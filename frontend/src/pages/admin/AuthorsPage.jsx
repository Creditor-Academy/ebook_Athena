import { useState, useEffect, useRef } from 'react'
import { FaUserTie, FaBook, FaEye, FaDollarSign, FaCalendarAlt, FaChartLine, FaEnvelope, FaUser, FaFileAlt, FaCheckCircle, FaClock, FaTimes, FaChevronLeft, FaChevronRight, FaSpinner, FaShoppingCart, FaTrash } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// BookViewer Component (copied from Insights.jsx)
function BookViewer({ bookFileUrl, bookId }) {
  const containerRef = useRef(null)
  const bookInstanceRef = useRef(null)
  const renditionRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [containerReady, setContainerReady] = useState(false)

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
    let observer = null

    async function loadEpub() {
      if (!containerRef.current) return

      try {
        setLoading(true)
        setLoadError('')
        const { default: ePub } = await import('epubjs')
        if (cancelled || !containerRef.current) return

        bookInstance = ePub(bookFileUrl)
        bookInstanceRef.current = bookInstance
        const containerWidth = containerRef.current.offsetWidth || 800

        const fixIframeSandbox = (iframe) => {
          try {
            if (iframe) {
              if (iframe.hasAttribute('sandbox')) {
                const currentSandbox = iframe.getAttribute('sandbox') || ''
                if (!currentSandbox.includes('allow-scripts')) {
                  iframe.setAttribute('sandbox', `${currentSandbox} allow-scripts allow-same-origin`.trim())
                  return true
                }
                return true
              } else {
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms')
                return true
              }
            }
            return false
          } catch {
            return false
          }
        }

        observer = new MutationObserver(() => {
          const iframe = containerRef.current?.querySelector('iframe')
          if (iframe && fixIframeSandbox(iframe)) {
            observer.disconnect()
            observer = null
          }
        })

        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['sandbox'],
        })

        rendition = bookInstance.renderTo(containerRef.current, {
          width: containerWidth,
          height: 600,
          flow: 'paginated',
          spread: 'none',
        })
        renditionRef.current = rendition

        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe')
          if (iframe) {
            fixIframeSandbox(iframe)
            if (observer) {
              observer.disconnect()
              observer = null
            }
          }
        }, 50)

        await rendition.display()

        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe')
          if (iframe) {
            fixIframeSandbox(iframe)
          }
          if (observer) {
            observer.disconnect()
            observer = null
          }
        }, 200)

        const themes = rendition.themes
        themes.register('insights-theme', {
          body: {
            margin: 0,
            padding: '1rem',
            overflowX: 'hidden',
            maxWidth: '100%',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '16px',
            lineHeight: '1.6',
          },
          img: { maxWidth: '100%', height: 'auto' },
          p: { maxWidth: '100%', wordWrap: 'break-word' },
        })
        themes.select('insights-theme')
        themes.fontSize('100%')

        const goNext = () => renditionRef.current?.next()
        const goPrev = () => renditionRef.current?.prev()

        const handleKeyNavigation = (e) => {
          const active = document.activeElement
          const tag = active?.tagName?.toLowerCase()
          const inInput = active?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button'
          if (inInput) return

          switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
            case ' ':
              e.preventDefault()
              goNext()
              break
            case 'ArrowLeft':
            case 'PageUp':
              e.preventDefault()
              goPrev()
              break
          }
        }

        window.addEventListener('keydown', handleKeyNavigation)
        if (rendition) {
          rendition.on?.('keydown', handleKeyNavigation)
          rendition.on?.('rendered', () => {
            const contents = rendition.getContents?.() || []
            contents.forEach((c) => {
              if (c.document) c.document.addEventListener('keydown', handleKeyNavigation)
            })
          })
          const existingContents = rendition.getContents?.() || []
          existingContents.forEach((c) => {
            if (c.document) c.document.addEventListener('keydown', handleKeyNavigation)
          })
        }

        const cleanupNavigation = () => {
          window.removeEventListener('keydown', handleKeyNavigation)
          if (rendition) {
            rendition.off?.('keydown', handleKeyNavigation)
            const contents = rendition.getContents?.() || []
            contents.forEach((c) => {
              if (c.document) c.document.removeEventListener('keydown', handleKeyNavigation)
            })
          }
        }

        if (renditionRef.current) {
          renditionRef.current._cleanupNavigation = cleanupNavigation
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(`Failed to load book: ${err.message || 'Unknown error'}`)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadEpub()
    }, 50)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (renditionRef.current?._cleanupNavigation) {
        renditionRef.current._cleanupNavigation()
      }
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
          <p style={{ color: '#64748b', margin: 0 }}>Loading book...</p>
        </div>
      )}
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
          </div>
        </div>
      )}
    </div>
  )
}

function AuthorsPage() {
  const [authors, setAuthors] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactsLoading, setContactsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [expandedBookId, setExpandedBookId] = useState(null)
  const [deletingBookId, setDeletingBookId] = useState(null)
  const [deletingAuthorId, setDeletingAuthorId] = useState(null)

  useEffect(() => {
    fetchAuthors()
    fetchContactRequests()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      console.log(' [AuthorsPage] Fetching authors and books...')
      
      // Fetch all users (ADMIN and SUPER_ADMIN)
      const usersResponse = await fetch(`${API_URL}/users`, {
        credentials: 'include',
      })

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }

      const usersData = await usersResponse.json()
      console.log('👥 [AuthorsPage] Users fetched:', usersData.users?.length || 0)
      
      // Filter users with ADMIN or SUPER_ADMIN roles (authors)
      const authorUsers = (usersData.users || []).filter(
        (user) => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      )
      console.log('👤 [AuthorsPage] Authors found:', authorUsers.length)
      
      // Fetch all books to get userId information
      const booksResponse = await fetch(`${API_URL}/books?limit=1000`, {
        credentials: 'include',
      })

      if (!booksResponse.ok) {
        throw new Error('Failed to fetch books')
      }

      const booksData = await booksResponse.json()
      const allBooks = booksData.books || []
      console.log('📚 [AuthorsPage] All books fetched:', allBooks.length)
      
      // Group books by userId
      const booksByUserId = {}
      allBooks.forEach((book) => {
        if (book.userId) {
          if (!booksByUserId[book.userId]) {
            booksByUserId[book.userId] = []
          }
          booksByUserId[book.userId].push(book)
        }
      })
      console.log('📊 [AuthorsPage] Books grouped by userId:', Object.keys(booksByUserId).length, 'authors have books')
      
      // Map authors with their books
      const authorsWithBooks = authorUsers.map((author) => {
        const authorBooks = booksByUserId[author.id] || []
        console.log(`📖 [AuthorsPage] Author ${author.email} has ${authorBooks.length} books`)
        return {
          ...author,
          books: authorBooks,
        }
      })
      
      console.log('✅ [AuthorsPage] Authors with books:', authorsWithBooks.length)
      setAuthors(authorsWithBooks)
    } catch (err) {
      console.error('❌ [AuthorsPage] Error fetching authors:', err)
      setError('Error loading authors: ' + err.message)
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
                const totalPurchases = author.books?.reduce((sum, book) => sum + (book.downloads || 0), 0) || 0
                const totalRevenue = author.books?.reduce((sum, book) => {
                  const price = parseFloat(book.price || 0)
                  const purchases = book.downloads || 0
                  return sum + (price * purchases)
                }, 0) || 0

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              margin: 0,
                            }}
                          >
                            {author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email}
                          </h3>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Are you sure you want to delete author "${author.name || author.email}"? This will also delete all their books.`)) {
                                return
                              }
                              try {
                                setDeletingAuthorId(author.id)
                                const token = localStorage.getItem('accessToken')
                                const response = await fetch(`${API_URL}/users/${author.id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                  credentials: 'include',
                                })
                                if (response.ok) {
                                  await fetchAuthors()
                                } else {
                                  const errorData = await response.json()
                                  alert(errorData.error?.message || 'Failed to delete author')
                                }
                              } catch (err) {
                                alert('Error deleting author: ' + err.message)
                              } finally {
                                setDeletingAuthorId(null)
                              }
                            }}
                            disabled={deletingAuthorId === author.id}
                            style={{
                              padding: '0.5rem 1rem',
                              background: deletingAuthorId === author.id ? '#e2e8f0' : '#fee2e2',
                              color: deletingAuthorId === author.id ? '#94a3b8' : '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              cursor: deletingAuthorId === author.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            {deletingAuthorId === author.id ? (
                              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <FaTrash />
                            )}
                            Delete Author
                          </button>
                        </div>
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
                            {totalPurchases.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Purchased</div>
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
                                src={book.coverImageUrl || 'https://via.placeholder.com/80x120?text=No+Cover'}
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
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaShoppingCart style={{ fontSize: '0.85rem', color: '#10b981' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                                      {(book.downloads || 0).toLocaleString()} purchased
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaDollarSign style={{ fontSize: '0.85rem', color: '#8b5cf6' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                                      ${parseFloat(book.price || 0).toFixed(2)}
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
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                  {book.bookFileUrl && (
                                    <button
                                      onClick={() => {
                                        if (expandedBookId === book.id) {
                                          setExpandedBookId(null)
                                        } else {
                                          setExpandedBookId(book.id)
                                        }
                                      }}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        background: expandedBookId === book.id ? '#2563eb' : '#f8fafc',
                                        color: expandedBookId === book.id ? '#ffffff' : '#2563eb',
                                        border: `1px solid ${expandedBookId === book.id ? '#2563eb' : '#e2e8f0'}`,
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <FaBook />
                                      {expandedBookId === book.id ? 'Hide Book' : 'Read Book'}
                                    </button>
                                  )}
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
                                        return
                                      }
                                      try {
                                        setDeletingBookId(book.id)
                                        const token = localStorage.getItem('accessToken')
                                        const response = await fetch(`${API_URL}/books/${book.id}`, {
                                          method: 'DELETE',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                          },
                                          credentials: 'include',
                                        })
                                        if (response.ok) {
                                          await fetchAuthors()
                                          if (expandedBookId === book.id) {
                                            setExpandedBookId(null)
                                          }
                                        } else {
                                          const errorData = await response.json()
                                          alert(errorData.error?.message || 'Failed to delete book')
                                        }
                                      } catch (err) {
                                        alert('Error deleting book: ' + err.message)
                                      } finally {
                                        setDeletingBookId(null)
                                      }
                                    }}
                                    disabled={deletingBookId === book.id}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: deletingBookId === book.id ? '#e2e8f0' : '#fee2e2',
                                      color: deletingBookId === book.id ? '#94a3b8' : '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                      cursor: deletingBookId === book.id ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                    }}
                                  >
                                    {deletingBookId === book.id ? (
                                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                      <FaTrash />
                                    )}
                                    Delete Book
                                  </button>
                                </div>
                                {expandedBookId === book.id && book.bookFileUrl && (
                                  <BookViewer bookFileUrl={book.bookFileUrl} bookId={book.id} />
                                )}
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

