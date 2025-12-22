# Backend Setup Guide for Development

A simple step-by-step guide to set up and run the backend from scratch.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase PostgreSQL database (or any PostgreSQL database)

---

## Step 1: Database Setup

### Option A: Using Supabase (Recommended)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be created
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database
3. Use connection string: `postgresql://postgres:password@localhost:5432/ebook_athena`

---

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

---

## Step 3: Environment Variables

Create a `.env` file in the `backend` folder:

```env
# ============================================
# DATABASE CONFIGURATION (Required)
# ============================================
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# ============================================
# SERVER CONFIGURATION (Optional - has defaults)
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# JWT AUTHENTICATION (Required)
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# ============================================
# AWS S3 CONFIGURATION (Required for book uploads)
# ============================================
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# ============================================
# FRONTEND CONFIGURATION (Optional - has default)
# ============================================
FRONTEND_URL="http://localhost:5173"

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"

# ============================================
# SENDGRID EMAIL (Optional)
# ============================================
# SENDGRID_API_KEY=SG.your_actual_api_key_here
# FROM_EMAIL=noreply@ebookathena.com
# APP_NAME=eBook Athena
```

**Important:** 
- Replace `DATABASE_URL` with your actual database connection string
- **For S3 setup:** See `S3_SETUP.md` for detailed AWS S3 setup instructions
- **For complete env reference:** See `ENV_VARIABLES.md` for all environment variables

**Quick Setup:**
1. **Minimum required:** `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`
2. **For book uploads:** Add all 4 AWS S3 variables (see `S3_SETUP.md`)
3. **Optional:** Google OAuth, SendGrid email

---

## Step 4: Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the Prisma Client based on your schema.

---

## Step 5: Push Database Schema

This creates all tables in your database:

```bash
npm run prisma:push
```

You should see:
```
✅ Database schema pushed successfully
```

---

## Step 6: Seed the Database (Optional but Recommended)

This creates test users (Super Admin, Admin, and regular users):

```bash
npm run prisma:seed
```

You should see:
```
🌱 Starting database seed...
✅ Super Admin user created: superadmin@ebookathena.com
✅ Admin user created: admin@ebookathena.com
...
✅ Database seed completed successfully!
```

**Test Credentials:**
- **Super Admin:** `superadmin@ebookathena.com` / `SuperAdmin@1234`
- **Admin:** `admin@ebookathena.com` / `Admin@1234`
- **Regular User:** `john.doe@example.com` / `Password123`

---

## Step 7: Start the Development Server

```bash
npm run dev
```

You should see:
```
✅ Server running on port 5000
📦 Environment: development
🌐 URL: http://localhost:5000
```

---

## Step 8: Verify Everything Works

### Test 1: Health Check
Open your browser or Postman:
```
GET http://localhost:5000/
```

Expected response:
```json
{
  "message": "Node backend is running 🚀",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test 2: Login with Seeded User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@ebookathena.com",
  "password": "SuperAdmin@1234"
}
```

Expected response:
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:migrate` | Create and run migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:seed` | Seed database with test data |
| `npm run prisma:verify` | Verify seeded data |

---

## Troubleshooting

### Error: "PrismaClient needs to be constructed..."
**Solution:** Run `npm run prisma:generate` first

### Error: "Table doesn't exist"
**Solution:** Run `npm run prisma:push` to create tables

### Error: "Connection refused" or "Can't reach database"
**Solution:** 
- Check your `DATABASE_URL` in `.env`
- Verify your Supabase database is running
- Check your network connection

### Error: "Invalid email or password"
**Solution:**
- Make sure you ran `npm run prisma:seed`
- Use exact credentials from Step 6
- Check password is case-sensitive

### Error: "JWT_SECRET is not set"
**Solution:** Add `JWT_SECRET` and `REFRESH_TOKEN_SECRET` to your `.env` file

---

## Next Steps

- Check `docs/API_ENDPOINTS_POSTMAN.md` for all available API endpoints
- Use Prisma Studio (`npm run prisma:studio`) to view your database visually
- Start building your frontend integration

---

## Quick Reference

**Complete setup in one go:**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

That's it! Your backend should be running. 🚀

