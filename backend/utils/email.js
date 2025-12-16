import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: SENDGRID_API_KEY is not set. Email sending will fail in production!');
}

/**
 * Send email verification link to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} firstName - User's first name (optional)
 */
export async function sendVerificationEmail(email, token, firstName = null) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Verification email would be sent to:', email);
      console.log('📧 [DEV] Verification token:', token);
      console.log('📧 [DEV] Verification URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
      return { success: true, dev: true };
    }
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const appName = process.env.APP_NAME || 'eBook Athena';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@ebookathena.com';

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: appName,
      },
      subject: 'Verify Your Email Address - eBook Athena',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${appName}!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hi there,'}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for signing up! To complete your registration and start exploring our collection of eBooks, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; color: #667eea; background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                <strong>Important:</strong> This verification link will expire in 24 hours.
              </p>
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                If you didn't create an account with ${appName}, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${appName}!

${firstName ? `Hi ${firstName},` : 'Hi there,'}

Thank you for signing up! To complete your registration, please verify your email address by visiting the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with ${appName}, please ignore this email.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Verification email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    // Log more details if available
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @param {string} firstName - User's first name (optional)
 */
export async function sendPasswordResetEmail(email, token, firstName = null) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Password reset email would be sent to:', email);
      console.log('📧 [DEV] Reset token:', token);
      console.log('📧 [DEV] Reset URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`);
      return { success: true, dev: true };
    }
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const appName = process.env.APP_NAME || 'eBook Athena';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@ebookathena.com';

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: appName,
      },
      subject: 'Reset Your Password - eBook Athena',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hi there,'}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your ${appName} account. Click the button below to reset it:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; color: #667eea; background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                <strong>Important:</strong> This reset link will expire in 1 hour.
              </p>
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

${firstName ? `Hi ${firstName},` : 'Hi there,'}

We received a request to reset your password for your ${appName} account. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    
    throw new Error('Failed to send password reset email');
  }
}

