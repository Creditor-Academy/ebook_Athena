import prisma from '../lib/prisma.js';

async function testPrisma() {
  try {
    console.log('Testing Prisma client...');
    
    // Check if prisma is initialized
    if (!prisma) {
      console.error('❌ Prisma client is not initialized');
      process.exit(1);
    }
    
    // Check if book model exists
    if (!prisma.book) {
      console.error('❌ prisma.book is not available');
      console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('$')));
      process.exit(1);
    }
    
    console.log('✅ Prisma client initialized');
    console.log('✅ Book model is available');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Try to count books (this will fail if table doesn't exist)
    const count = await prisma.book.count();
    console.log(`✅ Books table exists (${count} books in database)`);
    
    // List all available models
    const models = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key] === 'object');
    console.log('Available Prisma models:', models);
    
    await prisma.$disconnect();
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Prisma:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPrisma();

