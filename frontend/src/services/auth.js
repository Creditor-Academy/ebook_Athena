const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Sign up a new user
 */
export async function signup(email, password, firstName, lastName) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, firstName, lastName }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Signup failed')
  }

  // Store access token in localStorage if provided (for API calls)
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken)
  }

  // Remove role from user data
  const { user, ...rest } = data
  const userWithoutRole = { ...user }
  delete userWithoutRole.role

  return {
    ...rest,
    user: userWithoutRole,
  }
}

/**
 * Login user
 */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Login failed')
  }

  // Store access token in localStorage if provided (for API calls)
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken)
  }

  // Remove role from user data
  const { user, ...rest } = data
  const userWithoutRole = { ...user }
  delete userWithoutRole.role

  return {
    ...rest,
    user: userWithoutRole,
  }
}

/**
 * Get current authenticated user
 * Note: Role is kept for internal checks but should not be displayed in UI
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()

  // Keep role for internal checks (superadmin check) but don't display in UI
  return data.user
}

/**
 * Logout user
 */
export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Logout failed')
  }

  // Remove access token from localStorage on logout
  localStorage.removeItem('accessToken')

  return data
}

/**
 * Initiate Google OAuth
 */
export function initiateGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`
}

/**
 * Verify email with verification token
 */
export async function verifyEmail(token) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ token }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Email verification failed')
  }

  return data
}

/**
 * Verify signin code and complete login
 */
export async function verifySigninCode(email, code) {
  const response = await fetch(`${API_URL}/auth/verify-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, code }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Verification failed')
  }

  // Store access token in localStorage if provided (for API calls)
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken)
  }

  // Remove role from user data
  const { user, ...rest } = data
  const userWithoutRole = { ...user }
  delete userWithoutRole.role

  return {
    ...rest,
    user: userWithoutRole,
  }
}

/**
 * Update user role (Super Admin only)
 */
export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ role }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update user role')
  }

  return data
}

/**
 * Delete user (Super Admin only)
 */
export async function deleteUser(userId) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to delete user')
  }

  return data
}

