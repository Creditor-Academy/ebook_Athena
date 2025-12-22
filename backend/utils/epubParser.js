import Epub from 'epub2';

/**
 * Extract chapters/table of contents from EPUB file
 * @param {Buffer} epubBuffer - EPUB file buffer
 * @returns {Promise<Array>} Array of chapter objects with title, order, href, cfi
 */
export async function extractChapters(epubBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const epub = new Epub(epubBuffer);
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

