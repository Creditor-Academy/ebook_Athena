import prisma from '../lib/prisma.js';
import { downloadEpubFromUrl, extractChapterText } from '../utils/epubParser.js';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate summary for a specific chapter/lesson
 * @route POST /api/summarize
 * @access Private
 */
export async function summarizeChapter(req, res) {
  try {
    const { bookId, chapterHref } = req.body;
    const userId = req.userId;

    // Validate input
    if (!bookId || !chapterHref) {
      return res.status(400).json({
        error: {
          message: 'Book ID and chapter href are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: {
          message: 'OpenAI API key is not configured',
          code: 'CONFIGURATION_ERROR',
        },
      });
    }

    // Get book from database
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        bookFileUrl: true,
        userId: true,
      },
    });

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND',
        },
      });
    }

    // Check if user owns the book or uploaded it
    if (userId) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
      });

      const userOwnsBook = !!purchase;
      const userUploadedBook = book.userId === userId;

      if (!userOwnsBook && !userUploadedBook) {
        return res.status(403).json({
          error: {
            message: 'You must own this book to generate summaries',
            code: 'ACCESS_DENIED',
          },
        });
      }
    }

    // Try to get chapter info from database (optional - we can extract from EPUB if not found)
    let chapter = null;
    let chapterTitle = 'Selected Chapter';
    
    try {
      chapter = await prisma.chapter.findFirst({
        where: {
          bookId,
          href: chapterHref,
        },
        select: {
          id: true,
          title: true,
          href: true,
        },
      });
      
      if (chapter) {
        chapterTitle = chapter.title;
      }
    } catch (err) {
      console.warn('Could not fetch chapter from database, will use EPUB directly:', err);
    }

    // Download EPUB file
    console.log(`📥 Downloading EPUB from: ${book.bookFileUrl}`);
    let epubBuffer;
    try {
      epubBuffer = await downloadEpubFromUrl(book.bookFileUrl);
      console.log(`✅ EPUB downloaded successfully (${epubBuffer.length} bytes)`);
    } catch (downloadError) {
      console.error('❌ Failed to download EPUB:', downloadError);
      return res.status(500).json({
        error: {
          message: `Failed to download EPUB file: ${downloadError.message}`,
          code: 'EPUB_DOWNLOAD_ERROR',
        },
      });
    }

    // Extract chapter text
    console.log(`📖 Extracting text from chapter: ${chapterHref}`);
    let chapterText;
    try {
      chapterText = await extractChapterText(epubBuffer, chapterHref);
      console.log(`📄 Extracted chapter text length: ${chapterText?.length || 0} characters`);
    } catch (extractError) {
      console.error('❌ Error extracting chapter text:', extractError);
      return res.status(500).json({
        error: {
          message: `Failed to extract chapter content: ${extractError.message}`,
          code: 'CHAPTER_EXTRACTION_ERROR',
        },
      });
    }

    if (!chapterText || chapterText.trim().length === 0) {
      console.warn(`⚠️ Chapter content is empty for href: ${chapterHref}`);
      return res.status(404).json({
        error: {
          message: 'Chapter content not found or is empty. The chapter may not exist in the EPUB file, or the href format may not match.',
          code: 'CHAPTER_NOT_FOUND',
        },
      });
    }

    // Limit text length to avoid token limits (keep first 8000 characters)
    const textToSummarize = chapterText.length > 8000 
      ? chapterText.substring(0, 8000) + '...'
      : chapterText;

    // Generate summary using OpenAI
    console.log(`🤖 Generating summary for chapter: ${chapterTitle}`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, informative summaries of book chapters. Focus on key points, main themes, and important events.',
        },
        {
          role: 'user',
          content: `Please provide a comprehensive summary of the following chapter from "${book.title}" by ${book.author}:\n\nChapter: ${chapterTitle}\n\nContent:\n${textToSummarize}\n\nProvide a well-structured summary with key points and main themes.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary.';

    res.json({
      success: true,
      summary,
      chapter: {
        title: chapterTitle,
        href: chapterHref,
      },
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
    });
  } catch (error) {
    console.error('Summarize chapter error:', error);
    
    // Handle OpenAI API errors
    if (error?.status || error?.response) {
      return res.status(500).json({
        error: {
          message: `OpenAI API error: ${error.message || 'Unknown error'}`,
          code: 'OPENAI_ERROR',
        },
      });
    }

    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate summary',
        code: 'SUMMARIZE_ERROR',
      },
    });
  }
}

