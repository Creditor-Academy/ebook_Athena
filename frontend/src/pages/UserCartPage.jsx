import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { getCart, removeFromCart, updateCartItem, clearCart } from '../services/cart'
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft, FaSpinner } from 'react-icons/fa'

function UserCartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState({})
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          await fetchCart()
        } else {
          setError('Please login to view your cart')
          setLoading(false)
        }
      } catch {
        setError('Please login to view your cart')
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getCart()
      setCart(data)
    } catch (err) {
      setError(err.message || 'Failed to load cart')
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (bookId) => {
    try {
      setUpdating(prev => ({ ...prev, [bookId]: true }))
      await removeFromCart(bookId)
      await fetchCart()
    } catch (err) {
      alert(err.message || 'Failed to remove item from cart')
    } finally {
      setUpdating(prev => ({ ...prev, [bookId]: false }))
    }
  }

  const handleUpdateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(bookId)
      return
    }

    try {
      setUpdating(prev => ({ ...prev, [bookId]: true }))
      await updateCartItem(bookId, newQuantity)
      await fetchCart()
    } catch (err) {
      alert(err.message || 'Failed to update quantity')
    } finally {
      setUpdating(prev => ({ ...prev, [bookId]: false }))
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart? This will remove all items.')) {
      return
    }

    try {
      setUpdating({ clearing: true })
      await clearCart()
      await fetchCart()
    } catch (err) {
      alert(err.message || 'Failed to clear cart')
    } finally {
      setUpdating({})
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <FaSpinner style={{ fontSize: '2rem', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading cart...</p>
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

  const items = cart?.items || []
  const summary = cart?.summary || { subtotal: 0, platformCharge: 5.00, total: 0 }

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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Shopping Cart
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              {items.length > 0 ? `${items.length} item${items.length !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={updating.clearing}
              style={{
                padding: '0.75rem 1.5rem',
                background: updating.clearing ? '#e2e8f0' : '#fee2e2',
                color: updating.clearing ? '#94a3b8' : '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: updating.clearing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {updating.clearing ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Clearing...
                </>
              ) : (
                <>
                  <FaTrash />
                  Clear Cart
                </>
              )}
            </button>
          )}
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

      {items.length === 0 ? (
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
          <FaShoppingCart style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>
            No books added into cart
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 2rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Your cart is empty. Start adding books to your cart to continue shopping!
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
          {/* Cart Items */}
          <div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '1.5rem',
                  }}
                >
                  {/* Book Cover */}
                  <img
                    src={item.book.coverImageUrl || 'https://via.placeholder.com/120x180?text=No+Cover'}
                    alt={item.book.title}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/book/${item.book.id}`)}
                  />

                  {/* Book Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '0 0 0.5rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/book/${item.book.id}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#2563eb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#0f172a'
                        }}
                      >
                        {item.book.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                        by {item.book.author}
                      </p>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Quantity:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                          <button
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
                            disabled={updating[item.book.id]}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#f8fafc',
                              border: 'none',
                              borderRight: '1px solid #e2e8f0',
                              cursor: updating[item.book.id] ? 'not-allowed' : 'pointer',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FaMinus style={{ fontSize: '0.75rem' }} />
                          </button>
                          <div
                            style={{
                              padding: '0.5rem 1rem',
                              minWidth: '60px',
                              textAlign: 'center',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              background: '#ffffff',
                            }}
                          >
                            {updating[item.book.id] ? (
                              <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '0.75rem' }} />
                            ) : (
                              item.quantity
                            )}
                          </div>
                          <button
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
                            disabled={updating[item.book.id]}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#f8fafc',
                              border: 'none',
                              borderLeft: '1px solid #e2e8f0',
                              cursor: updating[item.book.id] ? 'not-allowed' : 'pointer',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FaPlus style={{ fontSize: '0.75rem' }} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                        Total: ${item.itemTotal.toFixed(2)}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.book.id)}
                        disabled={updating[item.book.id]}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: updating[item.book.id] ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginLeft: 'auto',
                        }}
                      >
                        {updating[item.book.id] ? (
                          <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '0.75rem' }} />
                        ) : (
                          <>
                            <FaTrash />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                position: 'sticky',
                top: '2rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Subtotal</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                    ${summary.subtotal.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Platform Charge</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                    ${summary.platformCharge.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>
                    ${summary.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Navigate to checkout or purchase page
                  alert('Checkout functionality will be implemented soon!')
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
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
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserCartPage

