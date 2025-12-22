import prisma from '../lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Grant a book to users by email
 * Usage: node scripts/grant-book.js <bookTitle> <email1> <email2> ...
 */
async function grantBook(bookTitle, emails) {
  try {
    if (!bookTitle || !emails || emails.length === 0) {
      console.error('Error: Book title and at least one email are required');
      console.log('Usage: node scripts/grant-book.js <bookTitle> <email1> <email2> ...');
      process.exit(1);
    }

    console.log(`📚 Looking for book: "${bookTitle}"`);

    // Find the book by title
    const book = await prisma.book.findFirst({
      where: {
        title: {
          contains: bookTitle,
          mode: 'insensitive',
        },
        isActive: true,
      },
    });

    if (!book) {
      console.error(`❌ Book "${bookTitle}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found book: "${book.title}" by ${book.author}`);
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
  console.log('Usage: node scripts/grant-book.js <bookTitle> <email1> <email2> ...');
  process.exit(1);
}

const bookTitle = args[0];
const emails = args.slice(1);

grantBook(bookTitle, emails);

