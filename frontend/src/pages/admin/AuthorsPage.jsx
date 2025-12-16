import { useState, useEffect } from 'react'
import { FaUserTie, FaBook, FaEye, FaDollarSign, FaCalendarAlt, FaChartLine, FaEnvelope, FaUser, FaFileAlt, FaCheckCircle, FaClock, FaTimes, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AuthorsPage() {
  const [authors, setAuthors] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactsLoading, setContactsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchAuthors()
    fetchContactRequests()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      // Fetch all users and filter for ADMIN/SUPER_ADMIN roles (authors)
      const response = await fetch(`${API_URL}/users`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        // Filter users with ADMIN role only (exclude SUPER_ADMIN)
        const adminUsers = (data.users || []).filter(
          (user) => user.role === 'ADMIN'
        )
        
        // For each author, fetch their books
        // Note: Since we can only fetch books for the logged-in user via /my-books,
        // we'll set books as empty array for now
        // In the future, you might want to create an endpoint like /ebooks/by-author/:authorId
        const authorsWithBooks = adminUsers.map((author) => ({
          ...author,
          books: [], // Will be populated when API endpoint is available
        }))
        
        setAuthors(authorsWithBooks)
      } else {
        setError('Failed to fetch authors')
      }
    } catch (err) {
      setError('Error loading authors')
      console.error('Error fetching authors:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContactRequests = async () => {
    try {
      setContactsLoading(true)
      const response = await fetch(`${API_URL}/contact`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setContactRequests(data.submissions || [])
        setCurrentRequestIndex(0) // Reset to first request when fetching
      } else {
        console.error('Failed to fetch contact requests')
      }
    } catch (err) {
      console.error('Error fetching contact requests:', err)
    } finally {
      setContactsLoading(false)
    }
  }

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      setUpdatingStatus(true)
      const response = await fetch(`${API_URL}/contact/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the request in the list
        setContactRequests((prev) =>
          prev.map((req) => (req.id === requestId ? data.submission : req))
        )
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert(err.message || 'Failed to update request status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const goToNextRequest = () => {
    if (currentRequestIndex < contactRequests.length - 1) {
      setCurrentRequestIndex(currentRequestIndex + 1)
    }
  }

  const goToPreviousRequest = () => {
    if (currentRequestIndex > 0) {
      setCurrentRequestIndex(currentRequestIndex - 1)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', text: '#92400e', icon: FaClock }
      case 'REVIEWED':
        return { bg: '#dbeafe', text: '#1e40af', icon: FaFileAlt }
      case 'APPROVED':
        return { bg: '#d1fae5', text: '#065f46', icon: FaCheckCircle }
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#991b1b', icon: FaTimes }
      default:
        return { bg: '#f1f5f9', text: '#64748b', icon: FaClock }
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading authors...</p>
      </div>
    )
  }

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Authors Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          View all authors and their uploaded books with insights
        </p>
      </div>

      {/* Contact Requests Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaEnvelope style={{ fontSize: '1.25rem', color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Publishing Requests ({contactRequests.length})
            </h2>
          </div>
        </div>

        {contactsLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>Loading requests...</p>
          </div>
        ) : contactRequests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <FaEnvelope style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No contact requests yet.</p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', position: 'relative' }}>
            {/* Navigation Controls */}
            {contactRequests.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  onClick={goToPreviousRequest}
                  disabled={currentRequestIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: currentRequestIndex === 0 ? '#e2e8f0' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: currentRequestIndex === 0 ? 'not-allowed' : 'pointer',
                    color: currentRequestIndex === 0 ? '#94a3b8' : '#0f172a',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    opacity: currentRequestIndex === 0 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentRequestIndex > 0) {
                      e.currentTarget.style.background = '#f1f5f9'
                      e.currentTarget.style.borderColor = '#94a3b8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentRequestIndex > 0) {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }
                  }}
                >
                  <FaChevronLeft />
                  Previous
                </button>

                <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                  Request {currentRequestIndex + 1} of {contactRequests.length}
                </div>

                <button
                  onClick={goToNextRequest}
                  disabled={currentRequestIndex === contactRequests.length - 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: currentRequestIndex === contactRequests.length - 1 ? '#e2e8f0' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: currentRequestIndex === contactRequests.length - 1 ? 'not-allowed' : 'pointer',
                    color: currentRequestIndex === contactRequests.length - 1 ? '#94a3b8' : '#0f172a',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    opacity: currentRequestIndex === contactRequests.length - 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentRequestIndex < contactRequests.length - 1) {
                      e.currentTarget.style.background = '#f1f5f9'
                      e.currentTarget.style.borderColor = '#94a3b8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentRequestIndex < contactRequests.length - 1) {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }
                  }}
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            )}

            {/* Current Request Card */}
            {contactRequests[currentRequestIndex] && (() => {
              const request = contactRequests[currentRequestIndex]
              const statusStyle = getStatusColor(request.status)
              const StatusIcon = statusStyle.icon

              return (
                <div
                  key={request.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease',
                    background: '#ffffff',
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
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      <FaUser />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              margin: 0,
                            }}
                          >
                            {request.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '6px',
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                          >
                            <StatusIcon style={{ fontSize: '0.7rem' }} />
                            {request.status}
                          </span>
                        </div>

                        {/* Status Change Dropdown */}
                        <div style={{ position: 'relative' }}>
                          <select
                            value={request.status}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                            disabled={updatingStatus}
                            style={{
                              padding: '0.5rem 2rem 0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: updatingStatus ? '#f1f5f9' : '#ffffff',
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: updatingStatus ? 'not-allowed' : 'pointer',
                              appearance: 'none',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#2563eb'
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="REVIEWED">REVIEWED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                          {updatingStatus && (
                            <FaSpinner
                              style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '0.875rem',
                                color: '#2563eb',
                                animation: 'spin 1s linear infinite',
                                pointerEvents: 'none',
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                          <FaEnvelope style={{ fontSize: '0.875rem' }} />
                          <span style={{ fontSize: '0.875rem' }}>{request.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                          <FaCalendarAlt style={{ fontSize: '0.875rem' }} />
                          <span style={{ fontSize: '0.875rem' }}>
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginTop: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <FaBook style={{ fontSize: '0.875rem', color: '#2563eb' }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                            Book Title:
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#475569' }}>{request.bookTitle}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FaFileAlt style={{ fontSize: '0.875rem', color: '#64748b' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Message:</span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.875rem',
                              color: '#475569',
                              lineHeight: '1.6',
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {request.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
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

      {/* Authors List */}
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
          <FaUserTie style={{ fontSize: '1.25rem', color: '#2563eb' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            All Authors ({authors.length})
          </h2>
        </div>

        {authors.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <FaUserTie style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>No authors found.</p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {authors.map((author) => {
                const totalBooks = author.books?.length || 0
                const totalViews = author.books?.reduce((sum, book) => sum + (book.views || 0), 0) || 0
                const totalRevenue = author.books?.reduce((sum, book) => sum + (book.revenue || 0), 0) || 0

                return (
                  <div
                    key={author.id}
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
                    {/* Author Header */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: author.image
                            ? 'transparent'
                            : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {author.image ? (
                          <img
                            src={author.image}
                            alt={author.name || author.email}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          getInitials(author.name || author.email)
                        )}
                      </div>

                      {/* Author Info */}
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '0 0 0.5rem',
                          }}
                        >
                          {author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                          {author.email}
                        </p>
                      </div>

                      {/* Author Stats Summary */}
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{totalBooks}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Books</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                            {totalViews.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Views</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                            ${totalRevenue.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Revenue</div>
                        </div>
                      </div>
                    </div>

                    {/* Books List */}
                    {author.books && author.books.length > 0 ? (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #f1f5f9',
                          }}
                        >
                          <FaBook style={{ fontSize: '1rem', color: '#2563eb' }} />
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                            Uploaded Books ({totalBooks})
                          </h4>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {author.books.map((book) => (
                            <div
                              key={book.id || book._id}
                              style={{
                                background: '#f8fafc',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr',
                                gap: '1rem',
                              }}
                            >
                              <img
                                src={book.cover || 'https://via.placeholder.com/80x120?text=No+Cover'}
                                alt={book.title}
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  background: '#e2e8f0',
                                }}
                              />
                              <div>
                                <h5
                                  style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    margin: '0 0 0.25rem',
                                  }}
                                >
                                  {book.title}
                                </h5>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                                  by {book.author}
                                </p>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaEye style={{ fontSize: '0.85rem', color: '#10b981' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                                      {(book.views || 0).toLocaleString()} views
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaDollarSign style={{ fontSize: '0.85rem', color: '#8b5cf6' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                                      ${(book.revenue || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  {book.createdAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <FaCalendarAlt style={{ fontSize: '0.85rem', color: '#2563eb' }} />
                                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(book.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          borderTop: '1px solid #f1f5f9',
                          marginTop: '1rem',
                          color: '#64748b',
                        }}
                      >
                        <FaBook style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>No books uploaded yet</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthorsPage

