# SendGrid Email Setup Guide

This guide will help you set up SendGrid for sending verification and password reset emails.

## Prerequisites

1. A SendGrid account (sign up at [sendgrid.com](https://sendgrid.com))
2. A verified sender email address or domain

## Step 1: Get Your SendGrid API Key

1. Log in to your SendGrid account
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "eBook Athena Production")
5. Select **Full Access** or **Restricted Access** with Mail Send permissions
6. Click **Create & View**
7. **Copy the API key immediately** (you won't be able to see it again!)

## Step 2: Verify Your Sender Email

### Option A: Single Sender Verification (Recommended for Development)

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in the required information:
   - **From Email Address**: The email you want to send from (e.g., `noreply@ebookathena.com`)
   - **From Name**: Your app name (e.g., "eBook Athena")
   - **Reply To**: Same as From Email or a support email
   - **Company Address**: Your business address
4. Click **Create**
5. Check your email and click the verification link

### Option B: Domain Authentication (Recommended for Production)

1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Wait for verification (can take up to 48 hours)

## Step 3: Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=noreply@ebookathena.com
APP_NAME=eBook Athena
FRONTEND_URL=http://localhost:5173
```

### Environment Variables Explained

- **SENDGRID_API_KEY**: Your SendGrid API key (starts with `SG.`)
- **FROM_EMAIL**: The verified sender email address
- **APP_NAME**: Your application name (used in email templates)
- **FRONTEND_URL**: Your frontend URL (used to generate verification links)

## Step 4: Test Email Sending

### Test Signup Flow

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Sign up a new user:
   ```bash
   POST http://localhost:5000/api/auth/signup
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "Test1234",
     "firstName": "Test",
     "lastName": "User"
   }
   ```

3. Check the email inbox for the verification email
4. Click the verification link or use the token to verify:
   ```bash
   POST http://localhost:5000/api/auth/verify-email
   Content-Type: application/json
   
   {
     "token": "verification_token_from_email"
   }
   ```

### Test Resend Verification

```bash
POST http://localhost:5000/api/auth/resend-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Ensure `SENDGRID_API_KEY` is set correctly in `.env`
2. **Check Sender Verification**: Make sure your sender email is verified
3. **Check Logs**: Look for error messages in your server console
4. **Check SendGrid Activity**: Go to **Activity** in SendGrid dashboard to see email status

### Common Errors

#### "The from address does not match a verified Sender Identity"

- **Solution**: Verify your sender email in SendGrid dashboard
- Go to **Settings** → **Sender Authentication** → **Single Sender Verification**

#### "API key does not have permission to send emails"

- **Solution**: Check your API key permissions
- Ensure it has "Mail Send" permissions

#### "Invalid API key"

- **Solution**: Regenerate your API key and update `.env`

### Development vs Production

**Development:**
- You can use a verified single sender email
- Free tier allows 100 emails/day
- Good for testing

**Production:**
- Use domain authentication for better deliverability
- Consider upgrading to a paid plan for higher limits
- Monitor email delivery rates in SendGrid dashboard

## Email Templates

The current implementation uses HTML email templates with:
- Responsive design
- Brand colors (gradient header)
- Clear call-to-action buttons
- Plain text fallback

### Customizing Email Templates

Edit `backend/utils/email.js` to customize:
- Email styling
- Brand colors
- Email content
- Logo/images (use absolute URLs)

## Security Best Practices

1. **Never commit API keys**: Keep `.env` in `.gitignore`
2. **Use environment-specific keys**: Different keys for dev/staging/production
3. **Rotate keys regularly**: Update API keys periodically
4. **Monitor usage**: Check SendGrid dashboard for unusual activity
5. **Rate limiting**: Consider implementing rate limits on email endpoints

## SendGrid Free Tier Limits

- **100 emails/day** (free tier)
- **40,000 emails for first 30 days** (trial)
- Upgrade to paid plans for higher limits

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Email Best Practices](https://sendgrid.com/resource/email-deliverability-best-practices/)

