import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT access token
 * @param {object} payload - Token payload (userId, email, etc.)
 * @returns {string} JWT token
 */
export function generateAccessToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ebook-athena',
    audience: 'ebook-athena-users',
  });
}

/**
 * Generate refresh token
 * @param {object} payload - Token payload
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'ebook-athena',
    audience: 'ebook-athena-users',
  });
}

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'ebook-athena',
    audience: 'ebook-athena-users',
  });
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} Decoded token payload
 */
export function verifyRefreshToken(token) {
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, REFRESH_TOKEN_SECRET, {
    issuer: 'ebook-athena',
    audience: 'ebook-athena-users',
  });
}

import crypto from 'crypto';

/**
 * Generate a random token for email verification or password reset
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

