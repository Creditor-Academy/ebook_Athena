import prisma from '../lib/prisma.js';
import axios from 'axios';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateToken,
} from '../utils/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

/**
 * Signup with email and password
 */
export async function signup(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'User with this email already exists',
          code: 'USER_EXISTS',
        },
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        emailVerified: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Delete expired sessions
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        expires: {
          lt: new Date(),
        },
      },
    });

    // Create session
    await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Generate email verification token
    const verificationToken = generateToken();
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail signup if email fails, but log it
      // In production, you might want to queue this for retry
    }

    // Set HTTP-only cookies for security
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user,
      accessToken, // Also send in response for mobile apps
      // Only return token in development for testing
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create user',
        code: 'SIGNUP_ERROR',
      },
    });
  }
}

/**
 * Login with email and password
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(401).json({
        error: {
          message: 'Please sign in with Google',
          code: 'OAUTH_REQUIRED',
        },
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Delete expired sessions
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        expires: {
          lt: new Date(),
        },
      },
    });

    // Create new session
    await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        image: user.image,
      },
      accessToken, // Also send in response for mobile apps
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR',
      },
    });
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    // Delete session
    await prisma.session.deleteMany({
      where: { userId: req.userId },
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_ERROR',
      },
    });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        emailVerified: true,
        role: true,
        image: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get user',
        code: 'GET_USER_ERROR',
      },
    });
  }
}

/**
 * Verify email
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return res.status(400).json({
        error: {
          message: 'Invalid verification token',
          code: 'INVALID_TOKEN',
        },
      });
    }

    if (verificationToken.expires < new Date()) {
      return res.status(400).json({
        error: {
          message: 'Verification token has expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    // Update user email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: {
        message: 'Email verification failed',
        code: 'VERIFICATION_ERROR',
      },
    });
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a verification link has been sent',
      });
    }

    // If already verified, don't reveal it
    if (user.emailVerified) {
      return res.json({
        message: 'If an account exists with this email, a verification link has been sent',
      });
    }

    // Delete old verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const verificationToken = generateToken();
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't reveal if email failed
    }

    res.json({
      message: 'If an account exists with this email, a verification link has been sent',
      // Only in development for testing
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined,
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to resend verification email',
        code: 'RESEND_VERIFICATION_ERROR',
      },
    });
  }
}

/**
 * Forgot password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    // Check if user has a password (OAuth users can't reset password)
    if (!user.password) {
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.firstName);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't reveal if email failed (security best practice)
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent',
      // Only in development for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to process password reset request',
        code: 'FORGOT_PASSWORD_ERROR',
      },
    });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({
        error: {
          message: 'Invalid reset token',
          code: 'INVALID_TOKEN',
        },
      });
    }

    if (resetToken.expires < new Date() || resetToken.used) {
      return res.status(400).json({
        error: {
          message: 'Reset token has expired or has already been used',
          code: 'TOKEN_INVALID',
        },
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Delete all sessions for security
    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    res.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: {
        message: 'Password reset failed',
        code: 'RESET_PASSWORD_ERROR',
      },
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          message: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED',
        },
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { sessionToken: refreshToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: session.userId,
      email: session.user.email,
      role: session.user.role,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: {
        message: 'Failed to refresh token',
        code: 'REFRESH_ERROR',
      },
    });
  }
}

/**
 * Google OAuth callback
 */
export async function googleCallback(req, res) {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${error}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token: googleRefreshToken, id_token } = tokenResponse.data;

    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const googleUser = userInfoResponse.data;
    const { email, name, picture, given_name, family_name } = googleUser;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          firstName: given_name || user.firstName,
          lastName: family_name || user.lastName,
          image: picture || user.image,
          emailVerified: true,
          lastLoginAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          emailVerified: true,
          role: true,
          image: true,
          createdAt: true,
        },
      });

      // Update or create account
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: googleUser.id,
          },
        },
        update: {
          access_token,
          refresh_token: googleRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
          id_token,
        },
        create: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleUser.id,
          access_token,
          refresh_token: googleRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          id_token,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          firstName: given_name || null,
          lastName: family_name || null,
          image: picture || null,
          emailVerified: true,
          password: null, // OAuth users don't have passwords
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          emailVerified: true,
          role: true,
          image: true,
          createdAt: true,
        },
      });

      // Create account
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleUser.id,
          access_token,
          refresh_token: googleRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          id_token,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Delete expired sessions
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        expires: {
          lt: new Date(),
        },
      },
    });

    // Create session
    await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed to 'lax' for OAuth redirects
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${accessToken}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
  }
}

/**
 * Google OAuth signup/login
 */
export async function googleAuth(req, res) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({
        error: {
          message: 'Google OAuth not configured',
          code: 'OAUTH_NOT_CONFIGURED',
        },
      });
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    }).toString()}`;

    res.redirect(googleAuthUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to initiate Google authentication',
        code: 'GOOGLE_AUTH_ERROR',
      },
    });
  }
}

