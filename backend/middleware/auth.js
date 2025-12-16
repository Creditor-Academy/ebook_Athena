import { verifyAccessToken } from '../utils/auth.js';
import prisma from '../lib/prisma.js';

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    const tokenFromCookie = req.cookies?.accessToken;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            message: 'Token expired',
            code: 'TOKEN_EXPIRED',
          },
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: {
            message: 'Invalid token',
            code: 'INVALID_TOKEN',
          },
        });
      }
      throw error;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
      },
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token exists
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    const tokenFromCookie = req.cookies?.accessToken;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          role: true,
          image: true,
        },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    // Continue even if there's an error
    next();
  }
}

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
      });
    }

    next();
  };
}

