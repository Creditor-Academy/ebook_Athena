import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';

dotenv.config();

const SALT_ROUNDS = 12;

/**
 * Hash password for seed data
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleaned');

  // Create Super Admin User
  console.log('👑 Creating super admin user...');
  const superAdminPassword = await hashPassword('SuperAdmin@1234');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@ebookathena.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      name: 'Super Admin',
      emailVerified: true,
      role: 'SUPER_ADMIN',
      image: null,
    },
  });
  console.log(`✅ Super Admin user created: ${superAdmin.email}`);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminPassword = await hashPassword('Admin@1234');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ebookathena.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      emailVerified: true,
      role: 'ADMIN',
      image: null,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create Regular Users
  console.log('👥 Creating regular users...');
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: true,
      role: 'USER',
    },
    {
      email: 'jane.smith@example.com',
      password: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith',
      emailVerified: true,
      role: 'USER',
    },
    {
      email: 'alice.johnson@example.com',
      password: 'Password123',
      firstName: 'Alice',
      lastName: 'Johnson',
      emailVerified: false, // Not verified
      role: 'USER',
    },
    {
      email: 'bob.williams@example.com',
      password: 'Password123',
      firstName: 'Bob',
      lastName: 'Williams',
      emailVerified: true,
      role: 'USER',
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        emailVerified: userData.emailVerified,
        role: userData.role,
      },
    });
    createdUsers.push(user);
    console.log(`✅ User created: ${user.email} (${user.firstName} ${user.lastName})`);
  }

  // Create a Google OAuth user (no password)
  console.log('🔐 Creating Google OAuth user...');
  const googleUser = await prisma.user.create({
    data: {
      email: 'google.user@example.com',
      password: null, // OAuth users don't have passwords
      firstName: 'Google',
      lastName: 'User',
      name: 'Google User',
      emailVerified: true,
      role: 'USER',
      image: 'https://via.placeholder.com/150',
    },
  });

  // Create Google account for OAuth user
  await prisma.account.create({
    data: {
      userId: googleUser.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google_123456789',
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'Bearer',
      scope: 'openid email profile',
    },
  });
  console.log(`✅ Google OAuth user created: ${googleUser.email}`);

  console.log('\n📊 Seed Summary:');
  console.log(`   - Super Admin users: 1`);
  console.log(`   - Admin users: 1`);
  console.log(`   - Regular users: ${createdUsers.length}`);
  console.log(`   - OAuth users: 1`);
  console.log(`   - Total users: ${createdUsers.length + 3}`);

  console.log('\n🔑 Test Credentials:');
  console.log('   Super Admin:');
  console.log('     Email: superadmin@ebookathena.com');
  console.log('     Password: SuperAdmin@1234');
  console.log('\n   Admin:');
  console.log('     Email: admin@ebookathena.com');
  console.log('     Password: Admin@1234');
  console.log('\n   Regular Users:');
  users.forEach((user) => {
    console.log(`     ${user.email} / Password123`);
  });
  console.log('\n✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

