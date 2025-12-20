# Environment Variables Reference

Complete list of all environment variables required for the backend.

## Required Environment Variables

### 1. Database Configuration

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

**Description:** PostgreSQL database connection string  
**Required:** Yes  
**Example:** `postgresql://postgres:mypassword@db.abcdefgh.supabase.co:5432/postgres`

---

### 2. Server Configuration

```env
PORT=5000
NODE_ENV=development
```

**Description:**
- `PORT`: Server port number (default: 5000)
- `NODE_ENV`: Environment mode (`development` or `production`)

**Required:** No (has defaults)

---

### 3. JWT Authentication

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"
```

**Description:**
- `JWT_SECRET`: Secret key for signing access tokens
- `REFRESH_TOKEN_SECRET`: Secret key for signing refresh tokens
- `JWT_EXPIRES_IN`: Access token expiration (default: 7d)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration (default: 30d)

**Required:** Yes (JWT_SECRET and REFRESH_TOKEN_SECRET are required)  
**Note:** Generate strong random strings for production. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4. AWS S3 Configuration (For Book Uploads)

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

**Description:**
- `AWS_ACCESS_KEY_ID`: AWS IAM user access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS IAM user secret access key
- `AWS_REGION`: AWS region where your S3 bucket is located
- `AWS_S3_BUCKET_NAME`: Name of your S3 bucket

**Required:** Yes (if you want to upload books)  
**Setup:** See `S3_SETUP.md` for detailed AWS S3 setup instructions

**Common AWS Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

---

### 5. Frontend URL

```env
FRONTEND_URL="http://localhost:5173"
```

**Description:** Frontend application URL for CORS configuration  
**Required:** No (defaults to `http://localhost:5173`)

---

### 6. Google OAuth (Optional)

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
```

**Description:** Google OAuth credentials for social login  
**Required:** No (optional feature)

---

### 7. SendGrid Email (Optional)

```env
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=noreply@ebookathena.com
APP_NAME=eBook Athena
```

**Description:** SendGrid configuration for email sending  
**Required:** No (optional, for email verification and password reset)  
**Setup:** See `SENDGRID_SETUP.md` for detailed instructions

---

## Complete .env File Template

Copy this template to create your `.env` file in the `backend` folder:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# ============================================
# AWS S3 CONFIGURATION (For Book Uploads)
# ============================================
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# ============================================
# FRONTEND CONFIGURATION
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

---

## Quick Setup Checklist

### Minimum Required (Basic Setup)
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `REFRESH_TOKEN_SECRET`

### For Book Uploads (Required)
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_BUCKET_NAME`

### Optional Features
- [ ] `FRONTEND_URL` (has default)
- [ ] `PORT` (has default: 5000)
- [ ] `NODE_ENV` (has default: development)
- [ ] Google OAuth variables
- [ ] SendGrid variables

---

## Environment-Specific Notes

### Development
- Use `NODE_ENV=development`
- Use local database or Supabase free tier
- Use test AWS credentials (not production)

### Production
- Use `NODE_ENV=production`
- Use production database
- Use production AWS credentials
- **Never commit `.env` file to version control**
- Use environment variable management (AWS Secrets Manager, etc.)

---

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong secrets** - Generate random strings for JWT secrets
3. **Rotate credentials** - Regularly rotate AWS keys and secrets
4. **Use different credentials** - Separate dev and production credentials
5. **Limit AWS permissions** - Use IAM policies with minimal required permissions
6. **Use environment variable managers** - For production, use AWS Secrets Manager or similar

---

## Troubleshooting

### Error: "AWS_S3_BUCKET_NAME is not configured"
**Solution:** Add all AWS S3 environment variables to your `.env` file

### Error: "JWT_SECRET is not set"
**Solution:** Add `JWT_SECRET` and `REFRESH_TOKEN_SECRET` to your `.env` file

### Error: "Can't reach database"
**Solution:** Check `DATABASE_URL` is correct and database is accessible

### Error: "Invalid AWS credentials"
**Solution:** Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct

---

## Related Documentation

- **Database Setup:** See `SETUP_GUIDE.md`
- **S3 Setup:** See `S3_SETUP.md`
- **SendGrid Setup:** See `SENDGRID_SETUP.md`
- **API Endpoints:** See `API_ENDPOINTS_POSTMAN.md`

---

**Last Updated:** 2024

