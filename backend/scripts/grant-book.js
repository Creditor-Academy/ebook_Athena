import prisma from '../lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Grant a book to users by email
 * Usage: node scripts/grant-book.js <bookTitle> [author] <email1> <email2> ...
 *        node scripts/grant-book.js "I want remedy now" "PAUL" komal@creditoracademy
 */
async function grantBook(bookTitle, author, emails) {
  try {
    if (!bookTitle || !emails || emails.length === 0) {
      console.error('Error: Book title and at least one email are required');
      console.log('Usage: node scripts/grant-book.js <bookTitle> [author] <email1> <email2> ...');
      console.log('Example: node scripts/grant-book.js "I want remedy now" "PAUL" komal@creditoracademy');
      process.exit(1);
    }

    console.log(`📚 Looking for book: "${bookTitle}"${author ? ` by ${author}` : ''}\n`);

    // First, find all books with matching title
    const allMatchingBooks = await prisma.book.findMany({
      where: {
        title: {
          contains: bookTitle,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        author: true,
        price: true,
      },
    });

    if (allMatchingBooks.length === 0) {
      console.error(`❌ Book "${bookTitle}" not found`);
      process.exit(1);
    }

    // If multiple books found, show them all
    if (allMatchingBooks.length > 1) {
      console.log(`⚠️  Found ${allMatchingBooks.length} books with title "${bookTitle}":\n`);
      allMatchingBooks.forEach((b, i) => {
        console.log(`   ${i + 1}. "${b.title}" by ${b.author} (ID: ${b.id})`);
      });
      console.log('');
    }

    let book;

    // If author is provided, find exact match by author
    if (author) {
      // Try to find exact author match (case-insensitive)
      book = allMatchingBooks.find(
        (b) => b.author.toLowerCase().trim() === author.toLowerCase().trim()
      );

      // If exact match not found, try contains match
      if (!book) {
        book = allMatchingBooks.find((b) =>
          b.author.toLowerCase().includes(author.toLowerCase())
        );
      }

      if (!book) {
        console.error(`❌ Book "${bookTitle}" by "${author}" not found`);
        console.log('\n📋 Available books with this title:');
        allMatchingBooks.forEach((b, i) => {
          console.log(`   ${i + 1}. "${b.title}" by ${b.author} (ID: ${b.id})`);
        });
        process.exit(1);
      }
    } else {
      // No author provided, use first match
      if (allMatchingBooks.length > 1) {
        console.error(`❌ Multiple books found. Please specify author name.`);
        console.log('\n📋 Available books:');
        allMatchingBooks.forEach((b, i) => {
          console.log(`   ${i + 1}. "${b.title}" by ${b.author} (ID: ${b.id})`);
        });
        console.log('\nUsage: node scripts/grant-book.js <bookTitle> <author> <email>');
        process.exit(1);
      }
      book = allMatchingBooks[0];
    }

    console.log(`✅ Selected book: "${book.title}" by ${book.author}`);
    console.log(`   Book ID: ${book.id}`);
    console.log(`   Price: $${book.price}\n`);

    // Process each email
    for (const email of emails) {
      try {
        console.log(`🔍 Looking for user: ${email}`);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error(`   ❌ User with email ${email} not found`);
          continue;
        }

        console.log(`   ✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

        // Check if user already owns the book
        const existingPurchase = await prisma.purchase.findUnique({
          where: {
            userId_bookId: {
              userId: user.id,
              bookId: book.id,
            },
          },
        });

        if (existingPurchase) {
          console.log(`   ⚠️  User already owns this book (Purchase ID: ${existingPurchase.id})`);
          continue;
        }

        // Create purchase record
        const purchase = await prisma.purchase.create({
          data: {
            userId: user.id,
            bookId: book.id,
            price: book.price,
            status: 'COMPLETED',
          },
        });

        console.log(`   ✅ Successfully granted book to ${user.email}`);
        console.log(`      Purchase ID: ${purchase.id}\n`);

        // Increment book downloads count
        await prisma.book.update({
          where: { id: book.id },
          data: {
            downloads: {
              increment: 1,
            },
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.error(`   ❌ User ${email} already owns this book`);
        } else {
          console.error(`   ❌ Error granting book to ${email}:`, error.message);
        }
      }
    }

    console.log('\n✅ Script completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get arguments from command line
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Error: Book title and at least one email are required');
  console.log('Usage: node scripts/grant-book.js <bookTitle> [author] <email1> <email2> ...');
  console.log('Example: node scripts/grant-book.js "I want remedy now" "PAUL" komal@creditoracademy');
  process.exit(1);
}

// Check if second argument is an email (contains @) or author name
const bookTitle = args[0];
let author = null;
let emails;

if (args.length >= 2 && !args[1].includes('@')) {
  // Second argument is author name
  author = args[1];
  emails = args.slice(2);
} else {
  // No author provided, all remaining args are emails
  emails = args.slice(1);
}

grantBook(bookTitle, author, emails);

