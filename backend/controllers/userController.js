import prisma from '../lib/prisma.js';
import { body, validationResult } from 'express-validator';

/**
 * Get all users (Super Admin only)
 */
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch users',
        code: 'GET_USERS_ERROR',
      },
    });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user',
        code: 'GET_USER_ERROR',
      },
    });
  }
}

/**
 * Update user role (Super Admin only)
 */
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: {
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE',
        },
      });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Prevent changing own role (security measure)
    if (targetUser.id === req.userId) {
      return res.status(400).json({
        error: {
          message: 'You cannot change your own role',
          code: 'CANNOT_CHANGE_OWN_ROLE',
        },
      });
    }

    // Prevent downgrading the last SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });

      if (superAdminCount <= 1) {
        return res.status(400).json({
          error: {
            message: 'Cannot remove the last SUPER_ADMIN',
            code: 'LAST_SUPER_ADMIN',
          },
        });
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update user role',
        code: 'UPDATE_ROLE_ERROR',
      },
    });
  }
}

/**
 * Update user profile (Admin can update any, User can update own)
 */
export async function updateUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, image } = req.body;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Users can only update their own profile unless they're SUPER_ADMIN or ADMIN
    if (
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'ADMIN' &&
      req.userId !== userId
    ) {
      return res.status(403).json({
        error: {
          message: 'You can only update your own profile',
          code: 'FORBIDDEN',
        },
      });
    }

    // Build update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (image !== undefined) updateData.image = image;

    // Update name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      const newFirstName = firstName !== undefined ? firstName : currentUser.firstName;
      const newLastName = lastName !== undefined ? lastName : currentUser.lastName;

      if (newFirstName && newLastName) {
        updateData.name = `${newFirstName} ${newLastName}`;
      } else {
        updateData.name = newFirstName || newLastName || null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'User profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update user profile',
        code: 'UPDATE_PROFILE_ERROR',
      },
    });
  }
}

/**
 * Delete user (Super Admin only)
 */
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Prevent deleting yourself
    if (targetUser.id === req.userId) {
      return res.status(400).json({
        error: {
          message: 'You cannot delete your own account',
          code: 'CANNOT_DELETE_SELF',
        },
      });
    }

    // Prevent deleting the last SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });

      if (superAdminCount <= 1) {
        return res.status(400).json({
          error: {
            message: 'Cannot delete the last SUPER_ADMIN',
            code: 'LAST_SUPER_ADMIN',
          },
        });
      }
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete user',
        code: 'DELETE_USER_ERROR',
      },
    });
  }
}

