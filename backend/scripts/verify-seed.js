import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Verify seed data was created successfully
 */
async function verifySeed() {
  try {
    console.log('🔍 Verifying seed data...\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);

    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ebookathena.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (admin) {
      console.log('\n✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Verified: ${admin.emailVerified}`);
    } else {
      console.log('\n❌ Admin user NOT found');
    }

    // Get regular users
    const regularUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        email: {
          not: 'google.user@example.com',
        },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`\n👥 Regular users (${regularUsers.length}):`);
    regularUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (Verified: ${user.emailVerified})`
      );
    });

    // Get OAuth user
    const oauthUser = await prisma.user.findUnique({
      where: { email: 'google.user@example.com' },
      include: {
        accounts: true,
      },
    });

    if (oauthUser) {
      console.log('\n🔐 Google OAuth user found:');
      console.log(`   Email: ${oauthUser.email}`);
      console.log(`   Name: ${oauthUser.name}`);
      console.log(`   Has password: ${oauthUser.password ? 'Yes' : 'No'}`);
      console.log(`   Google accounts: ${oauthUser.accounts.length}`);
    } else {
      console.log('\n❌ Google OAuth user NOT found');
    }

    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Total users: ${userCount}`);
    console.log(`   Admin users: ${admin ? 1 : 0}`);
    console.log(`   Regular users: ${regularUsers.length}`);
    console.log(`   OAuth users: ${oauthUser ? 1 : 0}`);

    // Expected counts
    const expectedCount = 6; // 1 admin + 4 regular + 1 oauth
    if (userCount === expectedCount) {
      console.log(`\n✅ Seed verification PASSED! (Expected ${expectedCount} users, found ${userCount})`);
    } else {
      console.log(
        `\n⚠️  Seed verification WARNING! (Expected ${expectedCount} users, found ${userCount})`
      );
    }
  } catch (error) {
    console.error('❌ Error verifying seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();

