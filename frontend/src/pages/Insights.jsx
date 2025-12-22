import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { getMyUploadedBooks } from '../services/books'
import { FaBook, FaEye, FaDollarSign, FaCalendarAlt, FaSpinner } from 'react-icons/fa'

// Inline Book Viewer Component
function BookViewer({ bookFileUrl, bookId }) {
  const containerRef = useRef(null)
  const bookInstanceRef = useRef(null)
  const renditionRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [containerReady, setContainerReady] = useState(false)

  // Ensure container is mounted before loading
  useEffect(() => {
    if (containerRef.current) {
      setContainerReady(true)
    }
  }, [])

  useEffect(() => {
    if (!bookFileUrl || !containerReady) return

    let cancelled = false
    let bookInstance
    let rendition

    async function loadEpub() {
      if (!containerRef.current) {
        console.log('⚠️ [BookViewer] Container not available yet')
        return
      }

      try {
        setLoading(true)
        setLoadError('')
        console.log('📖 [BookViewer] Loading EPUB from:', bookFileUrl)

        const { default: ePub } = await import('epubjs')
        if (cancelled || !containerRef.current) {
          console.log('⚠️ [BookViewer] Cancelled or container not ready')
          return
        }

        bookInstance = ePub(bookFileUrl)
        bookInstanceRef.current = bookInstance
        console.log('✅ [BookViewer] EPUB instance created')

        // Get container width for proper sizing
        const containerWidth = containerRef.current.offsetWidth || 800

        rendition = bookInstance.renderTo(containerRef.current, {
          width: containerWidth,
          height: 600,
          flow: 'paginated',
          spread: 'none',
        })
        renditionRef.current = rendition

        // Fix iframe sandbox issue - EPUB.js creates iframe with srcdoc
        // We need to ensure allow-scripts is in the sandbox attribute
        const fixIframeSandbox = () => {
          try {
            const iframe = containerRef.current?.querySelector('iframe')
            if (iframe) {
              // Check if sandbox attribute exists
              if (iframe.hasAttribute('sandbox')) {
                const currentSandbox = iframe.getAttribute('sandbox') || ''
                if (!currentSandbox.includes('allow-scripts')) {
                  // Add allow-scripts and allow-same-origin to existing sandbox
                  const newSandbox = `${currentSandbox} allow-scripts allow-same-origin`.trim()
                  iframe.setAttribute('sandbox', newSandbox)
                  console.log('✅ [BookViewer] Iframe sandbox updated:', newSandbox)
                } else {
                  console.log('✅ [BookViewer] Iframe sandbox already has allow-scripts')
                }
              } else {
                // If no sandbox, add one with necessary permissions
                // This is needed for srcdoc iframes
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms')
                console.log('✅ [BookViewer] Iframe sandbox added with permissions')
              }
              return true // Successfully fixed
            }
            return false // Iframe not found yet
          } catch (err) {
            console.warn('⚠️ [BookViewer] Could not configure iframe sandbox:', err)
            return false
          }
        }

        // Try to fix sandbox immediately and with retries
        let attempts = 0
        const maxAttempts = 10
        const tryFix = () => {
          if (fixIframeSandbox() || attempts >= maxAttempts) {
            return
          }
          attempts++
          setTimeout(tryFix, 100)
        }
        tryFix()

        await rendition.display()
        console.log('✅ [BookViewer] EPUB displayed')
        
        // Final attempt after display
        setTimeout(fixIframeSandbox, 200)

        // Apply styles similar to ReadingRoom
        const themes = rendition.themes
        const baseBody = {
          margin: 0,
          padding: '1rem',
          overflowX: 'hidden',
          maxWidth: '100%',
        }
        themes.register('insights-theme', {
          body: {
            ...baseBody,
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '16px',
            lineHeight: '1.6',
          },
          img: {
            maxWidth: '100%',
            height: 'auto',
          },
          p: {
            maxWidth: '100%',
            wordWrap: 'break-word',
          },
        })
        themes.select('insights-theme')
        themes.fontSize('100%')
        console.log('✅ [BookViewer] Styles applied')
      } catch (err) {
        console.error('❌ [BookViewer] Error loading EPUB:', err)
        if (!cancelled) {
          setLoadError(`Failed to load book: ${err.message || 'Unknown error'}`)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          console.log('✅ [BookViewer] Loading complete')
        }
      }
    }

    // Small delay to ensure container is fully rendered
    const timer = setTimeout(() => {
      loadEpub()
    }, 50)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
      if (bookInstanceRef.current) {
        try {
          bookInstanceRef.current.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [bookFileUrl, bookId, containerReady])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        height: '600px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginTop: '0.75rem',
        overflow: 'hidden',
        background: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      {/* Always render container for EPUB - never hide it */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            zIndex: 10,
          }}
        >
          <FaSpinner
            style={{
              fontSize: '2rem',
              color: '#2563eb',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem',
            }}
          />
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#64748b', margin: 0 }}>Loading book...</p>
        </div>
      )}

      {/* Error overlay */}
      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#dc2626',
            background: '#fee2e2',
            zIndex: 10,
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>⚠️ {loadError}</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#991b1b' }}>
              Please check the browser console for more details.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Insights() {
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [expandedBookId, setExpandedBookId] = useState(null)
  const navigate = useNavigate()

  console.log('🔍 [Insights] Component rendered', { loading, booksCount: books.length, error })

  useEffect(() => {
    console.log('🔍 [Insights] useEffect triggered - checking auth')
    const checkAuth = async () => {
      try {
        console.log('🔍 [Insights] Fetching current user...')
        const currentUser = await getCurrentUser()
        console.log('🔍 [Insights] Current user:', currentUser)
        
        if (!currentUser) {
          console.warn('⚠️ [Insights] No current user found')
          setError('Access denied. You need ADMIN or SUPER_ADMIN role to view insights.')
          setLoading(false)
          return
        }
        
        console.log('🔍 [Insights] User role:', currentUser.role)
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
          console.warn('⚠️ [Insights] User does not have required role. Role:', currentUser.role)
          setError('Access denied. You need ADMIN or SUPER_ADMIN role to view insights.')
          setLoading(false)
          return
        }
        
        console.log('✅ [Insights] User authenticated, fetching books...')
        await fetchBooks()
      } catch (err) {
        console.error('❌ [Insights] Auth check failed:', err)
        setError(err.message || 'Failed to authenticate. Please login again.')
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  const fetchBooks = async () => {
    try {
      console.log('📚 [Insights] fetchBooks called')
      setError('')
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      console.log('🔍 [Insights] Access token exists:', !!token)
      console.log('🔍 [Insights] Calling getMyUploadedBooks with options:', {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      
      const data = await getMyUploadedBooks({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      
      console.log('✅ [Insights] API Response received:', data)
      console.log('🔍 [Insights] Books array:', data.books)
      console.log('🔍 [Insights] Books count:', data.books?.length || 0)
      console.log('🔍 [Insights] Pagination:', data.pagination)
      
      const booksArray = data.books || []
      console.log('📚 [Insights] Setting books state with', booksArray.length, 'books')
      setBooks(booksArray)
      
      if (booksArray.length === 0) {
        console.warn('⚠️ [Insights] No books found in response')
      } else {
        console.log('✅ [Insights] Books set successfully:', booksArray.map(b => ({ id: b.id, title: b.title })))
      }
    } catch (err) {
      console.error('❌ [Insights] Error fetching books:', err)
      console.error('❌ [Insights] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      })
      const errorMessage = err.message || 'Failed to load books'
      setError(errorMessage)
      // Don't set books to empty array on error, keep existing data if any
    } finally {
      console.log('🏁 [Insights] fetchBooks completed, setting loading to false')
      setLoading(false)
    }
  }

  console.log('🔍 [Insights] Render - Current state:', {
    loading,
    booksCount: books.length,
    error,
    hasBooks: books.length > 0,
  })

  if (loading) {
    console.log('⏳ [Insights] Still loading, showing loading state')
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Calculate totals
  const totalBooks = books.length
  const totalViews = books.reduce((sum, book) => sum + (book.downloads || 0), 0)
  // Revenue calculation - you may need to add a revenue field to the book model
  // For now, we'll calculate based on price * downloads or use a placeholder
  const totalRevenue = books.reduce((sum, book) => {
    const price = parseFloat(book.price || 0)
    const downloads = book.downloads || 0
    // Assuming revenue is price * downloads (you may need to adjust this based on your business logic)
    return sum + (price * downloads)
  }, 0)

  console.log('📊 [Insights] Calculated totals:', {
    totalBooks,
    totalViews,
    totalRevenue,
  })

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
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Error Loading Insights</div>
          <div>{error}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>
            <strong>Possible causes:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
              <li>Your user role is not ADMIN or SUPER_ADMIN</li>
              <li>Backend database migration needed (userId field issue)</li>
              <li>No books uploaded yet</li>
              <li>Backend server is not running</li>
            </ul>
            <div style={{ marginTop: '0.75rem' }}>
              <strong>Solution:</strong> Run these commands in the backend directory:
              <pre style={{ 
                background: '#f3f4f6', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                overflow: 'auto'
              }}>
                cd backend{'\n'}
                npm run prisma:generate{'\n'}
                npm run prisma:push
              </pre>
            </div>
          </div>
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
                        src={book.coverImageUrl || 'https://via.placeholder.com/100x150?text=No+Cover'}
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
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Downloads</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaEye style={{ fontSize: '0.85rem', color: '#10b981' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                              {(book.downloads || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Price</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaDollarSign style={{ fontSize: '0.85rem', color: '#8b5cf6' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                              ${parseFloat(book.price || 0).toFixed(2)}
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

                      {/* Book Viewer */}
                      {book.bookFileUrl && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #f1f5f9',
                          }}
                        >
                          <button
                            onClick={() => {
                              if (expandedBookId === book.id) {
                                setExpandedBookId(null)
                              } else {
                                setExpandedBookId(book.id)
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: expandedBookId === book.id ? '#2563eb' : '#f8fafc',
                              color: expandedBookId === book.id ? '#ffffff' : '#2563eb',
                              border: `1px solid ${expandedBookId === book.id ? '#2563eb' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => {
                              if (expandedBookId !== book.id) {
                                e.currentTarget.style.background = '#eef3ff'
                                e.currentTarget.style.borderColor = '#2563eb'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (expandedBookId !== book.id) {
                                e.currentTarget.style.background = '#f8fafc'
                                e.currentTarget.style.borderColor = '#e2e8f0'
                              }
                            }}
                          >
                            <FaBook />
                            {expandedBookId === book.id ? 'Hide Book' : 'Read Book'}
                          </button>

                          {expandedBookId === book.id && (
                            <BookViewer bookFileUrl={book.bookFileUrl} bookId={book.id} />
                          )}
                        </div>
                      )}
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
