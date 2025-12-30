import { EPub } from 'epub2';
import axios from 'axios';

/**
 * Extract chapters/table of contents from EPUB file
 * @param {Buffer} epubBuffer - EPUB file buffer
 * @returns {Promise<Array>} Array of chapter objects with title, order, href, cfi
 */
export async function extractChapters(epubBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(epubBuffer);
      const chapters = [];

      epub.on('end', () => {
        try {
          // Extract chapters from flow (spine items) - these are the main content sections
          if (epub.flow && epub.flow.length > 0) {
            epub.flow.forEach((item, index) => {
              chapters.push({
                title: item.title || `Chapter ${index + 1}`,
                order: index + 1,
                href: item.href || null,
                cfi: null, // CFI can be calculated later if needed
                position: null, // Will be calculated below
              });
            });
          }

          // If we have navigation/toc metadata, use that for better chapter names
          if (epub.metadata && epub.metadata.toc && Array.isArray(epub.metadata.toc)) {
            epub.metadata.toc.forEach((tocItem, index) => {
              if (chapters[index]) {
                // Update chapter title if TOC has a better label
                if (tocItem.label && tocItem.label.trim()) {
                  chapters[index].title = tocItem.label.trim();
                }
                // Update href if TOC has it
                if (tocItem.href) {
                  chapters[index].href = tocItem.href;
                }
              } else {
                // Add new chapter from TOC if not in flow
                chapters.push({
                  title: tocItem.label || `Chapter ${chapters.length + 1}`,
                  order: chapters.length + 1,
                  href: tocItem.href || null,
                  cfi: null,
                  position: null,
                });
              }
            });
          }

          // If no chapters found, create a default one
          if (chapters.length === 0) {
            chapters.push({
              title: 'Chapter 1',
              order: 1,
              href: null,
              cfi: null,
              position: 0,
            });
          } else {
            // Calculate position (0.0 to 1.0) for each chapter
            const totalChapters = chapters.length;
            chapters.forEach((chapter, index) => {
              chapter.position = totalChapters > 1 ? index / (totalChapters - 1) : 0;
            });
          }

          console.log(`✅ Successfully extracted ${chapters.length} chapters from EPUB`);
          resolve(chapters);
        } catch (error) {
          console.error('Error processing EPUB chapters:', error);
          // Return default chapter on processing error
          resolve([{
            title: 'Chapter 1',
            order: 1,
            href: null,
            cfi: null,
            position: 0,
          }]);
        }
      });

      epub.on('error', (error) => {
        console.error('EPUB parsing error:', error);
        // Return default chapter if parsing fails
        resolve([{
          title: 'Chapter 1',
          order: 1,
          href: null,
          cfi: null,
          position: 0,
        }]);
      });

      epub.parse();
    } catch (error) {
      console.error('Error initializing EPUB parser:', error);
      // Return default chapter on initialization error
      resolve([{
        title: 'Chapter 1',
        order: 1,
        href: null,
        cfi: null,
        position: 0,
      }]);
    }
  });
}

/**
 * Extract text content from a specific chapter in EPUB
 * @param {Buffer} epubBuffer - EPUB file buffer
 * @param {string} chapterHref - Chapter href to extract
 * @returns {Promise<string>} Chapter text content
 */
export async function extractChapterText(epubBuffer, chapterHref) {
  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(epubBuffer);
      let chapterText = '';

      epub.on('end', () => {
        try {
          // Normalize the search href (remove # anchor and leading slash)
          const normalizeHref = (href) => {
            if (!href) return '';
            // Remove # anchor
            let normalized = href.split('#')[0];
            // Remove leading slash if present
            if (normalized.startsWith('/')) {
              normalized = normalized.substring(1);
            }
            return normalized.toLowerCase();
          };

          const searchHref = normalizeHref(chapterHref);
          console.log(`🔍 Looking for chapter with href: "${searchHref}" (original: "${chapterHref}")`);

          // Find the chapter by href in flow items
          let foundChapter = null;
          
          if (epub.flow && epub.flow.length > 0) {
            console.log(`📚 Available flow items (${epub.flow.length}):`);
            epub.flow.forEach((item, idx) => {
              const itemHref = normalizeHref(item.href);
              console.log(`  [${idx}] id: ${item.id}, href: "${item.href}" (normalized: "${itemHref}")`);
            });

            foundChapter = epub.flow.find(item => {
              const itemHref = normalizeHref(item.href);
              // Try exact match first
              if (itemHref === searchHref) return true;
              // Try partial matches
              if (itemHref.endsWith(searchHref) || searchHref.endsWith(itemHref)) return true;
              // Try matching just the filename
              const itemFilename = itemHref.split('/').pop();
              const searchFilename = searchHref.split('/').pop();
              if (itemFilename && searchFilename && itemFilename === searchFilename) return true;
              return false;
            });
          }

          if (!foundChapter) {
            console.warn(`❌ Chapter with href "${chapterHref}" (normalized: "${searchHref}") not found in EPUB`);
            // If no exact match, try to get the first chapter as fallback
            if (epub.flow && epub.flow.length > 0) {
              console.log(`⚠️ Using first chapter as fallback`);
              foundChapter = epub.flow[0];
            } else {
              resolve('');
              return;
            }
          }

          console.log(`✅ Found chapter: id=${foundChapter.id}, href=${foundChapter.href}`);

          // Get the chapter content using getChapter
          if (foundChapter.id) {
            epub.getChapter(foundChapter.id, (error, text) => {
              if (error) {
                console.error('Error getting chapter content:', error);
                // Try to get all chapters and concatenate if single chapter fails
                if (epub.flow && epub.flow.length > 0) {
                  console.log('Trying to extract text from all chapters...');
                  let allText = '';
                  let processed = 0;
                  epub.flow.forEach((item, index) => {
                    if (item.id) {
                      epub.getChapter(item.id, (err, txt) => {
                        processed++;
                        if (!err && txt) {
                          allText += cleanHtmlText(txt) + ' ';
                        }
                        if (processed === epub.flow.length) {
                          resolve(allText.trim());
                        }
                      });
                    } else {
                      processed++;
                      if (processed === epub.flow.length) {
                        resolve(allText.trim());
                      }
                    }
                  });
                } else {
                  resolve('');
                }
                return;
              }

              // Clean up HTML tags and extract text
              if (text) {
                chapterText = cleanHtmlText(text);
                console.log(`✅ Extracted ${chapterText.length} characters from chapter`);
              }

              resolve(chapterText);
            });
          } else {
            console.warn('Chapter has no ID, cannot extract content');
            resolve('');
          }

          // Helper function to clean HTML and extract text
          function cleanHtmlText(html) {
            if (!html) return '';
            return html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        } catch (error) {
          console.error('Error processing chapter:', error);
          resolve('');
        }
      });

      epub.on('error', (error) => {
        console.error('EPUB parsing error:', error);
        resolve('');
      });

      epub.parse();
    } catch (error) {
      console.error('Error initializing EPUB parser:', error);
      resolve('');
    }
  });
}

/**
 * Download EPUB file from URL and return as buffer
 * @param {string} epubUrl - URL of the EPUB file
 * @returns {Promise<Buffer>} EPUB file buffer
 */
export async function downloadEpubFromUrl(epubUrl) {
  try {
    const response = await axios.get(epubUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading EPUB:', error);
    throw new Error(`Failed to download EPUB file: ${error.message}`);
  }
}
