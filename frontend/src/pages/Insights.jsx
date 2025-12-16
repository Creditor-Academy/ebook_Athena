import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { FaBook, FaEye, FaDollarSign, FaCalendarAlt } from 'react-icons/fa'

function Insights() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
          navigate('/')
          return
        }
        setUser(currentUser)
        fetchBooks()
      } catch (err) {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:5000/api/ebooks/my-books', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }

      const data = await response.json()
      setBooks(data.books || [])
    } catch (err) {
      setError(err.message || 'Failed to load books')
      console.error('Error fetching books:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Calculate totals
  const totalBooks = books.length
  const totalViews = books.reduce((sum, book) => sum + (book.views || 0), 0)
  const totalRevenue = books.reduce((sum, book) => sum + (book.revenue || 0), 0)

  return (
    <div>
      {/* Stats Overview - 3 Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
              }}
            >
              <FaBook />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Books</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{totalBooks}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Number of books you've published</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
              }}
            >
              <FaEye />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{totalViews.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total number of book page views</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
              }}
            >
              <FaDollarSign />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>
                ${totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total earnings from all books</div>
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

      {/* Books List */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Your Books ({books.length})
          </h2>
        </div>

        {books.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <FaBook style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>No books uploaded yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#94a3b8' }}>
              Upload your first book to see insights here.
            </p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {books.map((book) => (
                <div
                  key={book.id || book._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1.25rem' }}>
                    {/* Book Cover */}
                    <div>
                      <img
                        src={book.cover || 'https://via.placeholder.com/100x150?text=No+Cover'}
                        alt={book.title}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                        }}
                      />
                    </div>

                    {/* Book Details */}
                    <div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <h3
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '0 0 0.25rem',
                          }}
                        >
                          {book.title}
                        </h3>
                        <p
                          style={{
                            fontSize: '0.9rem',
                            color: '#64748b',
                            margin: 0,
                          }}
                        >
                          by {book.author}
                        </p>
                        {book.category && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.75rem',
                              color: '#2563eb',
                              background: '#eef3ff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              marginTop: '0.5rem',
                            }}
                          >
                            {book.category}
                          </span>
                        )}
                      </div>

                      {/* Metrics Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Views</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaEye style={{ fontSize: '0.85rem', color: '#10b981' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                              {(book.views || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Revenue</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaDollarSign style={{ fontSize: '0.85rem', color: '#8b5cf6' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                              ${(book.revenue || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            Uploaded
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt style={{ fontSize: '0.85rem', color: '#2563eb' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                              {book.createdAt
                                ? new Date(book.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Insights
