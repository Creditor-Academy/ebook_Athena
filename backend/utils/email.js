import nodemailer from 'nodemailer';

// Create nodemailer transporter with Gmail
const createTransporter = () => {
  const email = process.env.EMAIL_USER || 'support@creditoracademy.com';
  const password = process.env.EMAIL_PASSWORD || 'cuuw egxb zhkn mxyh';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error);
    } else {
      console.log('✅ Email transporter is ready to send messages');
      console.log(`📧 Using email: ${email}`);
    }
  });

  return transporter;
};

// Initialize transporter (uses defaults if env vars not set)
let transporter = createTransporter();

/**
 * Send email verification link to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} firstName - User's first name (optional)
 */
export async function sendVerificationEmail(email, token, firstName = null) {
  // Check if email is configured
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Verification email would be sent to:', email);
      console.log('📧 [DEV] Verification token:', token);
      console.log('📧 [DEV] Verification URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
      return { success: true, dev: true };
    }
    throw new Error('Email transporter is not configured');
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const appName = process.env.APP_NAME || 'eBook Athena';
    const fromEmail = process.env.EMAIL_USER || 'support@creditoracademy.com';

    const mailOptions = {
      from: {
        name: appName,
        address: fromEmail,
      },
      to: email,
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
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
  // Check if email is configured
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Password reset email would be sent to:', email);
      console.log('📧 [DEV] Reset token:', token);
      console.log('📧 [DEV] Reset URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`);
      return { success: true, dev: true };
    }
    throw new Error('Email transporter is not configured');
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const appName = process.env.APP_NAME || 'eBook Athena';
    const fromEmail = process.env.EMAIL_USER || 'support@creditoracademy.com';

    const mailOptions = {
      from: {
        name: appName,
        address: fromEmail,
      },
      to: email,
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send signin verification code to user
 * @param {string} email - User's email address
 * @param {string} code - 6-digit verification code
 * @param {string} firstName - User's first name (optional)
 */
export async function sendSigninVerificationCode(email, code, firstName = null) {
  try {
    const appName = process.env.APP_NAME || 'eBook Athena';
    const fromEmail = process.env.EMAIL_USER || 'support@creditoracademy.com';

    const mailOptions = {
      from: {
        name: appName,
        address: fromEmail,
      },
      to: email,
      subject: 'Verification Code for eBook',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign-In Verification Code</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Sign-In Verification</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hi there,'}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a sign-in request for your ${appName} account. Please use the verification code below to complete your sign-in:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 20px 40px; background-color: #fff; border: 2px solid #667eea; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Enter this code in the sign-in page to complete your authentication.
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                <strong>Important:</strong> This code will expire in 10 minutes.
              </p>
              <p style="font-size: 13px; color: #666; margin: 5px 0;">
                If you didn't attempt to sign in, please ignore this email and consider changing your password.
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
Sign-In Verification

${firstName ? `Hi ${firstName},` : 'Hi there,'}

We received a sign-in request for your ${appName} account. Please use the verification code below to complete your sign-in:

Verification Code: ${code}

Enter this code in the sign-in page to complete your authentication.

This code will expire in 10 minutes.

If you didn't attempt to sign in, please ignore this email and consider changing your password.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Signin verification code sent to: ${email}`);
    console.log('📧 Email info:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending signin verification code:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw new Error(`Failed to send signin verification code: ${error.message}`);
  }
}
