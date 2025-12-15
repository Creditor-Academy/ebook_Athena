# How to Run and Check the Seed File

## Quick Start

### Step 1: Ensure Database Schema is Pushed

```bash
cd backend
npm run prisma:push
```

### Step 2: Run the Seed

```bash
npm run prisma:seed
```

You should see output like:
```
🌱 Starting database seed...
🧹 Cleaning existing data...
✅ Existing data cleaned
👤 Creating admin user...
✅ Admin user created: admin@ebookathena.com
👥 Creating regular users...
✅ User created: john.doe@example.com (John Doe)
...
✅ Database seed completed successfully!
```

### Step 3: Verify the Seed

#### Option A: Using Prisma Studio (Recommended)

```bash
npm run prisma:studio
```

This opens a browser at `http://localhost:5555` where you can:
- View all tables
- See all users with their details
- Check data visually

#### Option B: Using the Verification Script

```bash
npm run prisma:verify
```

This will show:
- Total user count
- Admin user details
- Regular users list
- OAuth users
- Summary statistics

#### Option C: Test via API

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test login with seeded users:

   **Admin:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@ebookathena.com", "password": "Admin@1234"}'
   ```

   **Regular User:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "john.doe@example.com", "password": "Password123"}'
   ```

## Seeded Users

### Admin User
- **Email:** `admin@ebookathena.com`
- **Password:** `Admin@1234`
- **Role:** `ADMIN`
- **Verified:** `true`

### Regular Users (Password: `Password123`)
1. `john.doe@example.com` - John Doe (verified)
2. `jane.smith@example.com` - Jane Smith (verified)
3. `alice.johnson@example.com` - Alice Johnson (not verified)
4. `bob.williams@example.com` - Bob Williams (verified)

### OAuth User
- **Email:** `google.user@example.com`
- **Password:** None (OAuth only)
- **Has Google Account:** Yes

## Troubleshooting

### Error: "PrismaClient needs to be constructed..."
This is a Prisma 7 configuration issue. The seed file should work once the Prisma Client is properly configured.

### Error: "Table doesn't exist"
Run `npm run prisma:push` first to create the database tables.

### Error: "Connection refused"
- Check your `.env` file has the correct `DATABASE_URL`
- Verify your Supabase database is accessible
- Check network connectivity

### Seed runs but no data
- Check console output for errors
- Verify database connection
- Use Prisma Studio to check if data exists

## Expected Results

After successful seeding, you should have:
- **1** Admin user
- **4** Regular users
- **1** OAuth user
- **Total: 6 users**

All passwords are hashed using bcrypt (12 rounds).

