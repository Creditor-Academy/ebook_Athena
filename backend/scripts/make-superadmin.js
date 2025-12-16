import prisma from '../lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Make a user superadmin by email
 */
async function makeSuperAdmin(email) {
  try {
    if (!email) {
      console.error('Error: Email is required');
      console.log('Usage: node scripts/make-superadmin.js <email>');
      process.exit(1);
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name || user.email}`);
    console.log(`Current role: ${user.role}`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' },
    });

    console.log(`\n Successfully updated user role to SUPER_ADMIN`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New role: ${updatedUser.role}`);
  } catch (error) {
    console.error(' Error updating user role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
makeSuperAdmin(email);

