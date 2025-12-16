import { useState, useEffect } from 'react'
import { FaUserTie, FaBook, FaEye, FaDollarSign, FaCalendarAlt, FaChartLine } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AuthorsPage() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAuthors()
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

  const getInitials = (name) => {
    if (!name) return 'A'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Authors Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          View all authors and their uploaded books with insights
        </p>
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

