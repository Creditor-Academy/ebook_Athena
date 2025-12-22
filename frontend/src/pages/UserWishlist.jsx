import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { getWishlist, removeFromWishlist } from '../services/wishlist'
import { addToCart } from '../services/cart'
import { FaHeart, FaTrash, FaSpinner, FaArrowLeft, FaShoppingCart } from 'react-icons/fa'
import { BuyModalContent } from './BuyModal'
import AuthModal from '../components/AuthModal'

function UserWishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState({})
  const [user, setUser] = useState(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [addingToCart, setAddingToCart] = useState({})
  const [showCartSuccess, setShowCartSuccess] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          await fetchWishlist()
        } else {
          setError('Please login to view your wishlist')
          setLoading(false)
        }
      } catch {
        setError('Please login to view your wishlist')
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getWishlist()
      setWishlist(data)
    } catch (err) {
      setError(err.message || 'Failed to load wishlist')
      setWishlist(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (bookId) => {
    try {
      setRemoving(prev => ({ ...prev, [bookId]: true }))
      await removeFromWishlist(bookId)
      await fetchWishlist()
    } catch (err) {
      alert(err.message || 'Failed to remove item from wishlist')
    } finally {
      setRemoving(prev => ({ ...prev, [bookId]: false }))
    }
  }

  const handleAddToCart = async (book, e) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (!user) {
      return
    }

    try {
      setAddingToCart(prev => ({ ...prev, [book.id]: true }))
      await addToCart(book.id, 1)
      // Show success modal
      setShowCartSuccess(true)
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowCartSuccess(false)
      }, 4000)
    } catch (err) {
      alert(err.message || 'Failed to add book to cart')
    } finally {
      setAddingToCart(prev => ({ ...prev, [book.id]: false }))
    }
  }

  const handleBuyNow = (book) => {
    if (!user) {
      return
    }
    setSelectedBook(book)
    setShowBuyModal(true)
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <FaSpinner style={{ fontSize: '2rem', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading wishlist...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={() => navigate('/ebooks')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Browse Books
        </button>
      </div>
    )
  }

  const books = wishlist?.books || []

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/ebooks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '0.5rem 1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <FaArrowLeft />
          Back to Books
        </button>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
            My Wishlist
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            {books.length > 0 ? `${books.length} book${books.length !== 1 ? 's' : ''} in your wishlist` : 'Your wishlist is empty'}
          </p>
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

      {books.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <FaHeart style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>
            Your wishlist is empty
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 2rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Start adding books to your wishlist to save them for later!
          </p>
          <button
            onClick={() => navigate('/ebooks')}
            style={{
              padding: '0.875rem 2rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {books.map((book) => (
            <div
              key={book.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Remove Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveItem(book.id)
                }}
                disabled={removing[book.id]}
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  background: removing[book.id] ? '#e2e8f0' : '#ffffff',
                  color: removing[book.id] ? '#94a3b8' : '#dc2626',
                  border: '2px solid #dc2626',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: removing[book.id] ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 100,
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!removing[book.id]) {
                    e.currentTarget.style.background = '#fee2e2'
                    e.currentTarget.style.transform = 'scale(1.15)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!removing[book.id]) {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }
                }}
                title="Remove from wishlist"
              >
                {removing[book.id] ? (
                  <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '1rem' }} />
                ) : (
                  <FaTrash style={{ fontSize: '1rem' }} />
                )}
              </button>

              {/* Book Cover */}
              <img
                src={book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                alt={book.title}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
                onClick={() => navigate(`/book/${book.id}`)}
              />

              {/* Book Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: '0 0 0.5rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/book/${book.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#0f172a'
                    }}
                  >
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                    by {book.author}
                  </p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.75rem' }}>
                    ${Number(book.price).toFixed(2)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleBuyNow(book)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#2563eb'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(book, e)}
                    disabled={addingToCart[book.id]}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: addingToCart[book.id] ? '#e2e8f0' : '#ffffff',
                      color: addingToCart[book.id] ? '#94a3b8' : '#2563eb',
                      border: `2px solid ${addingToCart[book.id] ? '#e2e8f0' : '#2563eb'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: addingToCart[book.id] ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!addingToCart[book.id]) {
                        e.currentTarget.style.background = '#f0f4ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!addingToCart[book.id]) {
                        e.currentTarget.style.background = '#ffffff'
                      }
                    }}
                  >
                    {addingToCart[book.id] ? (
                      <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '0.75rem' }} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedBook && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1200,
          }}
          onClick={() => setShowBuyModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <BuyModalContent book={selectedBook} onClose={() => setShowBuyModal(false)} />
          </div>
        </div>
      )}

      {/* Cart Success Modal */}
      {showCartSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            background: '#2563eb',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px',
          }}
        >
          <FaShoppingCart style={{ fontSize: '1.25rem' }} />
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>Added to cart successfully</span>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default UserWishlist

