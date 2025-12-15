# Database Seed Guide

## Prerequisites

1. Make sure your `.env` file has the correct `DATABASE_URL`
2. Ensure the database schema is pushed to your database

## Step 1: Push Database Schema

Before seeding, make sure your database schema is up to date:

```bash
cd backend
npm run prisma:push
```

Or create a migration:

```bash
npm run prisma:migrate
```

## Step 2: Run the Seed

Run the seed file to populate your database:

```bash
npm run prisma:seed
```

Or use Prisma's built-in command:

```bash
npx prisma db seed
```

## Step 3: Verify the Seed

### Option 1: Using Prisma Studio (Visual Interface)

Open Prisma Studio to view your data:

```bash
npm run prisma:studio
```

This will open a browser at `http://localhost:5555` where you can:
- View all users
- See their details (email, firstName, lastName, role, etc.)
- Check if data was created correctly

### Option 2: Using the API

Start your backend server:

```bash
npm run dev
```

Then test login with seeded users:

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ebookathena.com",
    "password": "Admin@1234"
  }'
```

**Regular User Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123"
  }'
```

### Option 3: Check via Database Query

You can also check directly in your Supabase dashboard or using a PostgreSQL client.

## Seeded Users

### Admin User
- **Email:** `admin@ebookathena.com`
- **Password:** `Admin@1234`
- **Role:** `ADMIN`
- **Email Verified:** `true`

### Regular Users
- `john.doe@example.com` / `Password123` (verified)
- `jane.smith@example.com` / `Password123` (verified)
- `alice.johnson@example.com` / `Password123` (not verified)
- `bob.williams@example.com` / `Password123` (verified)

### OAuth User
- `google.user@example.com` (OAuth only, no password)

## Troubleshooting

### Error: Database connection failed
- Check your `.env` file has the correct `DATABASE_URL`
- Verify your Supabase database is accessible

### Error: Table doesn't exist
- Run `npm run prisma:push` first to create tables

### Error: Unique constraint violation
- The seed file deletes existing data first
- If you see this error, the cleanup might have failed
- Check database permissions

### Seed runs but no data appears
- Check the console output for errors
- Verify the seed file completed successfully
- Use Prisma Studio to check if data exists

