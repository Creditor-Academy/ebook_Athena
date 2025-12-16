import { useState, useEffect, useMemo } from 'react'
import { FaUser, FaBook, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaSearch, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaUserShield, FaTrash, FaEdit } from 'react-icons/fa'
import { updateUserRole, deleteUser } from '../../services/auth'
import { getCurrentUser } from '../../services/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const USERS_PER_PAGE = 5

const styles = `
  @media (max-width: 968px) {
    .users-layout {
      grid-template-columns: 1fr !important;
    }
    .filters-sidebar {
      position: static !important;
    }
  }
`

// Role Change Modal Component
function RoleChangeModal({ user, onClose, onSuccess }) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedRole === user.role) {
      onClose()
      return
    }

    setError('')
    setLoading(true)

    try {
      await updateUserRole(user.id, selectedRole)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1400,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#f1f5f9',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#64748b',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Change User Role
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Update the role for <strong>{user.name || user.email}</strong>
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0f172a',
              }}
            >
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
              }}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedRole === user.role}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading || selectedRole === user.role ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading || selectedRole === user.role ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedRole !== user.role) {
                  e.currentTarget.style.background = '#1d4ed8'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedRole !== user.role) {
                  e.currentTarget.style.background = '#2563eb'
                }
              }}
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete User Modal Component
function DeleteUserModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setError('')
    setLoading(true)

    try {
      await deleteUser(user.id)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1400,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#f1f5f9',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#64748b',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <FaTrash style={{ fontSize: '1.5rem', color: '#dc2626' }} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Delete User
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Are you sure you want to delete <strong>{user.name || user.email}</strong>? This action cannot be undone.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#cbd5e1'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#94a3b8' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#b91c1c'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#dc2626'
              }
            }}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUser, setCurrentUser] = useState(null)
  const [roleChangeModal, setRoleChangeModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.error('Error fetching current user:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/users`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Error loading users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Filter users based on search query and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter (name, email)
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      const matchesSearch =
        searchQuery === '' ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      // Verified filter
      const matchesVerified =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && user.emailVerified) ||
        (verifiedFilter === 'unverified' && !user.emailVerified)

      return matchesSearch && matchesRole && matchesVerified
    })
  }, [users, searchQuery, roleFilter, verifiedFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setVerifiedFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all' || verifiedFilter !== 'all'

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, verifiedFilter])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRoleChangeSuccess = () => {
    fetchUsers()
    setSuccessMessage('User role updated successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleDeleteSuccess = () => {
    fetchUsers()
    setSuccessMessage('User deleted successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div>
        {/* Header with Search */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Users Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              View all users and their purchased books
            </p>
          </div>
          
          {/* Search Bar */}
          <div style={{ minWidth: '300px', maxWidth: '400px', flex: '0 0 auto' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '1rem',
                }}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b'
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #86efac',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Main Content with Filters on Right */}
        <div className="users-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
          {/* Users List */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <FaUser style={{ fontSize: '1.25rem', color: '#2563eb' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            All Users ({filteredUsers.length})
          </h2>
        </div>

            {filteredUsers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <FaUser style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', margin: 0 }}>
                  {users.length === 0 ? 'No users found.' : 'No users match your filters.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: user.image
                          ? 'transparent'
                          : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.email}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        getInitials(user.name || user.email)
                      )}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: 0,
                          }}
                        >
                          {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                        </h3>
                        {user.emailVerified && (
                          <FaCheckCircle style={{ fontSize: '1rem', color: '#10b981' }} title="Email Verified" />
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background:
                              user.role === 'SUPER_ADMIN'
                                ? '#fef3c7'
                                : user.role === 'ADMIN'
                                ? '#eef3ff'
                                : '#f1f5f9',
                            color:
                              user.role === 'SUPER_ADMIN'
                                ? '#92400e'
                                : user.role === 'ADMIN'
                                ? '#2563eb'
                                : '#475569',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                          <FaEnvelope style={{ fontSize: '0.875rem' }} />
                          <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                          <FaCalendarAlt style={{ fontSize: '0.875rem' }} />
                          <span style={{ fontSize: '0.875rem' }}>
                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* User Stats - Only show for regular users */}
                      {user.role === 'USER' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #f1f5f9',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                              Books Purchased
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaBook style={{ fontSize: '0.85rem', color: '#2563eb' }} />
                              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>0</span>
                              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>(Coming soon)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Top Right Corner (Icons Only) - Only show for Super Admin */}
                      {isSuperAdmin && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            gap: '0.5rem',
                          }}
                        >
                          <button
                            onClick={() => setRoleChangeModal(user)}
                            title="Change Role"
                            style={{
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              background: '#f0f4ff',
                              border: '1px solid #c7d2fe',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              color: '#2563eb',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e0e7ff'
                              e.currentTarget.style.borderColor = '#a5b4fc'
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0f4ff'
                              e.currentTarget.style.borderColor = '#c7d2fe'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <FaUserShield />
                          </button>
                          <button
                            onClick={() => setDeleteModal(user)}
                            disabled={currentUser?.id === user.id}
                            title={currentUser?.id === user.id ? 'You cannot delete your own account' : 'Delete user'}
                            style={{
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              background: currentUser?.id === user.id ? '#f1f5f9' : '#fee2e2',
                              border: currentUser?.id === user.id ? '1px solid #e2e8f0' : '1px solid #fecaca',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              color: currentUser?.id === user.id ? '#94a3b8' : '#dc2626',
                              cursor: currentUser?.id === user.id ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (currentUser?.id !== user.id) {
                                e.currentTarget.style.background = '#fecaca'
                                e.currentTarget.style.borderColor = '#fca5a5'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentUser?.id !== user.id) {
                                e.currentTarget.style.background = '#fee2e2'
                                e.currentTarget.style.borderColor = '#fecaca'
                                e.currentTarget.style.transform = 'scale(1)'
                              }
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: '1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{startIndex + 1}</span> to{' '}
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {Math.min(endIndex, filteredUsers.length)}
                  </span>{' '}
                  of <span style={{ fontWeight: 600, color: '#0f172a' }}>{filteredUsers.length}</span> users
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem 0.75rem',
                      background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.borderColor = '#cbd5e1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                      }
                    }}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* Page Numbers */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)

                      if (!showPage) {
                        // Show ellipsis
                        const prevPage = page - 1
                        const nextPage = page + 1
                        if (
                          (prevPage === 1 || prevPage === currentPage - 2) &&
                          nextPage !== totalPages &&
                          nextPage !== currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              style={{
                                padding: '0.5rem 0.75rem',
                                color: '#94a3b8',
                                fontSize: '0.875rem',
                              }}
                            >
                              ...
                            </span>
                          )
                        }
                        return null
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            minWidth: '40px',
                            background: currentPage === page ? '#2563eb' : '#ffffff',
                            border: `1px solid ${currentPage === page ? '#2563eb' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: currentPage === page ? 600 : 500,
                            color: currentPage === page ? '#ffffff' : '#0f172a',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== page) {
                              e.currentTarget.style.background = '#f8fafc'
                              e.currentTarget.style.borderColor = '#cbd5e1'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== page) {
                              e.currentTarget.style.background = '#ffffff'
                              e.currentTarget.style.borderColor = '#e2e8f0'
                            }
                          }}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem 0.75rem',
                      background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.borderColor = '#cbd5e1'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                      }
                    }}
                  >
                    <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
              </>
            )}
          </div>

          {/* Filters Sidebar */}
          <div
            className="filters-sidebar"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
              height: 'fit-content',
              maxHeight: 'calc(100vh - 250px)',
              position: 'sticky',
              top: '1rem',
              overflowY: 'auto',
            }}
          >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0',
            }}
          >
            <FaFilter style={{ fontSize: '1.1rem', color: '#2563eb' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Filters</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Role Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.5px',
                }}
              >
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: roleFilter !== 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  if (roleFilter === 'all') {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }
                }}
              >
                <option value="all">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.5px',
                }}
              >
                Verification
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: verifiedFilter !== 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  if (verifiedFilter === 'all') {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }
                }}
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Results Count */}
            <div
              style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Results</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {filteredUsers.length}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#64748b' }}>
                  {' '}
                  / {users.length}
                </span>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fecaca'
                  e.currentTarget.style.borderColor = '#fca5a5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fee2e2'
                  e.currentTarget.style.borderColor = '#fecaca'
                }}
              >
                <FaTimes style={{ fontSize: '0.75rem' }} />
                Clear All Filters
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {roleChangeModal && (
        <RoleChangeModal
          user={roleChangeModal}
          onClose={() => setRoleChangeModal(null)}
          onSuccess={handleRoleChangeSuccess}
        />
      )}

      {/* Delete User Modal */}
      {deleteModal && (
        <DeleteUserModal
          user={deleteModal}
          onClose={() => setDeleteModal(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}

export default UsersPage

