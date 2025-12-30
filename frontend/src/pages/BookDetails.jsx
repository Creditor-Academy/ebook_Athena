import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/auth'
import { getBookById } from '../services/books'
import { addToCart, checkBookInCart } from '../services/cart'
import { addToWishlist, removeFromWishlist, checkBookInWishlist } from '../services/wishlist'
import { createReview, getBookReviews, hasPurchasedBook } from '../services/reviews'
import AuthModal from '../components/AuthModal'
import { BuyModalContent } from './BuyModal'
import { FaStar, FaShoppingCart, FaBookOpen, FaSpinner, FaHeart, FaTimes } from 'react-icons/fa'


function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'cart' or 'buy'
  const [inCart, setInCart] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showAllChapters] = useState(false)
  const [showChaptersModal, setShowChaptersModal] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showPostPurchaseModal, setShowPostPurchaseModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    // Fetch book by ID from API
    const fetchBook = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getBookById(id)
        setBook(data.book)
      } catch (err) {
        setError(err.message || 'Failed to load book')
        console.error('Error fetching book:', err)
      } finally {
        setLoading(false)
      }
    }

    // Check authentication
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          // Check if book is in cart and wishlist
          if (id) {
            try {
              const [isInCart, isInWishlist] = await Promise.all([
                checkBookInCart(id),
                checkBookInWishlist(id)
              ])
              setInCart(isInCart)
              setInWishlist(isInWishlist)
            } catch (err) {
              console.error('Error checking cart/wishlist:', err)
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }

    if (id) {
      fetchBook()
      checkAuth()
    }
  }, [id])

  // Refresh cart and wishlist status when book changes
  useEffect(() => {
    if (book && user) {
      Promise.all([
        checkBookInCart(book.id),
        checkBookInWishlist(book.id)
      ])
        .then(([isInCart, isInWishlist]) => {
          setInCart(isInCart)
          setInWishlist(isInWishlist)
        })
        .catch((err) => {
          console.error('Error checking cart/wishlist:', err)
        })
    } else {
      setInCart(false)
      setInWishlist(false)
    }
  }, [book, user])

  // Fetch reviews when book changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!book?.id) return
      try {
        setLoadingReviews(true)
        const data = await getBookReviews(book.id)
        setReviews(data.reviews || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setReviews([])
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [book?.id])

  // Check purchase status and show post-purchase modal
  useEffect(() => {
    const checkPurchase = async () => {
      if (!book?.id || !user) {
        setHasPurchased(false)
        return
      }
      try {
        const purchased = await hasPurchasedBook(book.id)
        setHasPurchased(purchased)
        
        // Check if we should show post-purchase modal
        if (purchased) {
          const modalKey = `review_modal_${book.id}_${user.id}`
          const hasSeenModal = localStorage.getItem(modalKey)
          if (!hasSeenModal) {
            // Check if user already reviewed (check by user email/name)
            const userEmail = user.email || ''
            const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail.split('@')[0]
            const userReview = reviews.find(r => {
              const reviewUserName = r.user?.name || ''
              return reviewUserName === userName || reviewUserName === userEmail.split('@')[0]
            })
            if (!userReview) {
              // Show modal after a short delay
              setTimeout(() => {
                setShowPostPurchaseModal(true)
              }, 2000)
            }
          }
        }
      } catch (err) {
        console.error('Error checking purchase status:', err)
        setHasPurchased(false)
      }
    }
    checkPurchase()
  }, [book?.id, user, reviews])

  const handleToggleWishlist = async () => {
    if (!user) {
      setPendingAction('wishlist')
      setShowAuthModal(true)
      return
    }

    if (!book || togglingWishlist) {
      return
    }

    try {
      setTogglingWishlist(true)
      if (inWishlist) {
        await removeFromWishlist(book.id)
        setInWishlist(false)
      } else {
        await addToWishlist(book.id)
        setInWishlist(true)
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
      alert(err.message || 'Failed to update wishlist')
    } finally {
      setTogglingWishlist(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      setPendingAction('cart')
      setShowAuthModal(true)
      return
    }

    if (!book || inCart) {
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(book.id, 1)
      setInCart(true)
      // Show success modal
      setShowCartSuccess(true)
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowCartSuccess(false)
      }, 4000)
    } catch (err) {
      console.error('Error adding to cart:', err)
      if (err.message.includes('already in your cart')) {
        setInCart(true)
        setShowCartSuccess(true)
        setTimeout(() => {
          setShowCartSuccess(false)
        }, 4000)
      } else {
        alert(err.message || 'Failed to add book to cart')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      setPendingAction('buy')
      setShowAuthModal(true)
      return
    }

    // Show buy modal
    setShowBuyModal(true)
  }

  const handleAuthSuccess = async (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    
    if (pendingAction === 'cart') {
      handleAddToCart()
    } else if (pendingAction === 'buy') {
      handleBuyNow()
    } else if (pendingAction === 'wishlist') {
      handleToggleWishlist()
    }
    
    setPendingAction(null)
  }

  // Chapters are not available from API, so we'll use empty array for now
  // You can add chapters to the book model later if needed
  const chapters = []

  const truncateParagraph = (text, limit = 380) => {
    if (!text) return ''
    const trimmed = text.trim()
    if (trimmed.length <= limit) return trimmed
    return `${trimmed.slice(0, limit).replace(/\s+\S*$/, '')}…`
  }

  const rawSample = book
    ? book.description || book.shortDescription || 'Sample content coming soon.'
    : ''

  const sampleParagraphs = rawSample
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith('**') && p.endsWith('**') ? p : truncateParagraph(p, 360)))

  const blocks = sampleParagraphs.map((p) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return { type: 'heading', text: p.replace(/\*\*/g, '') }
    }
    return { type: 'para', text: p }
  })

  const paginateBlocks = (list, limit = 700) => {
    const pages = [[]]
    let currentLen = 0
    list.forEach((item) => {
      const cost = item.text.length + (item.type === 'heading' ? 40 : 0)
      if (currentLen + cost > limit && pages[pages.length - 1].length > 0) {
        pages.push([])
        currentLen = 0
      }
      pages[pages.length - 1].push(item)
      currentLen += cost
    })
    return pages
  }

  const paged = paginateBlocks(blocks, 720)
  const pageCount = paged.length
  const currentLeftPage = paged[pageIndex] || []
  const currentRightPage = paged[pageIndex + 1] || []
  const hasRightPage = pageIndex + 1 < pageCount

  useEffect(() => {
    setPageIndex(0)
  }, [id])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || event.target?.isContentEditable) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setPageIndex((prev) => Math.max(0, prev - 1))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setPageIndex((prev) => Math.min(Math.max(pageCount - 1, 0), prev + 1))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        window.scrollBy({ top: 240, behavior: 'smooth' })
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        window.scrollBy({ top: -240, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageCount])

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} style={{ color: '#fbbf24', fontSize: '1.1rem' }} />
          } else if (i === fullStars && hasHalfStar) {
            return <FaStar key={i} style={{ color: '#fbbf24', fontSize: '1.1rem', opacity: 0.5 }} />
          } else {
            return <FaStar key={i} style={{ color: '#cbd5e1', fontSize: '1.1rem' }} />
          }
        })}
        <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
          {rating}
        </span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  const handleSubmitReview = async () => {
    if (!book || !user || reviewRating === 0) return

    try {
      setSubmittingReview(true)
      await createReview(book.id, reviewRating, reviewComment)
      
      // Refresh reviews
      const data = await getBookReviews(book.id)
      setReviews(data.reviews || [])
      
      // Close modals and mark as seen
      setShowReviewModal(false)
      setShowPostPurchaseModal(false)
      const modalKey = `review_modal_${book.id}_${user.id}`
      localStorage.setItem(modalKey, 'true')
      
      // Reset form
      setReviewRating(0)
      setReviewComment('')
    } catch (err) {
      alert(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDismissPostPurchaseModal = () => {
    setShowPostPurchaseModal(false)
    if (book && user) {
      const modalKey = `review_modal_${book.id}_${user.id}`
      localStorage.setItem(modalKey, 'true')
    }
  }

  // Generate dynamic message based on book (varies greeting while keeping the format)
  const getPostPurchaseMessage = (bookTitle) => {
    const messages = [
      `Hey, looks like you purchased our bestseller '${bookTitle}'.`,
      `Great! You just purchased our bestseller '${bookTitle}'.`,
      `Awesome! You purchased our bestseller '${bookTitle}'.`,
      `Congratulations! You purchased our bestseller '${bookTitle}'.`,
      `Nice! You purchased our bestseller '${bookTitle}'.`,
    ]
    // Use book title hash to consistently pick a message for the same book
    const hash = bookTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return messages[hash % messages.length]
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p>Loading book details...</p>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>{error || 'Book not found'}</h2>
        <button
          onClick={() => navigate('/ebooks')}
          style={{
            marginTop: '1rem',
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
          Back to Books
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 50%, #f5f8ff 100%)',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          {/* Main Content */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(30, 64, 175, 0.08)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1.05fr 1fr',
              gap: '0',
            }}
          >
            {/* Left Side - Book Cover and Sample */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '3rem 3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}
            >
              {/* Sample Content - Book Pages Layout */}
              <div
                style={{
                  background: 'transparent',
                  padding: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 1.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  First couple of pages — bookmarks disabled
                </h3>
                
                {/* Two Page Book Layout */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                  }}
                >
                  {/* Page 1 */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '4px',
                      padding: '1.5rem 1.25rem',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)',
                      border: '1px solid #d1d5db',
                      width: '280px',
                      aspectRatio: '4 / 5.5',
                      maxHeight: '385px',
                      position: 'relative',
                      backgroundImage: `
                        repeating-linear-gradient(
                          transparent,
                          transparent 24px,
                          rgba(15, 23, 42, 0.04) 24px,
                          rgba(15, 23, 42, 0.04) 25px
                        )
                      `,
                      backgroundSize: '100% 25px',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 1rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Page {pageIndex + 1}
                    </h4>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#1f2937',
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        fontFamily: 'serif',
                      }}
                    >
                      {currentLeftPage.map((block, index) =>
                        block.type === 'heading' ? (
                          <h5
                            key={index}
                            style={{
                              margin: index > 0 ? '1rem 0 0.75rem' : '0 0 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#1f2937',
                            }}
                          >
                            {block.text}
                          </h5>
                        ) : (
                          <p key={index} style={{ margin: '0 0 0.75rem', textIndent: '1rem' }}>
                            {block.text}
                          </p>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Page 2 */}
                  {hasRightPage && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '4px',
                        padding: '1.5rem 1.25rem',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)',
                        border: '1px solid #d1d5db',
                        width: '280px',
                        aspectRatio: '4 / 5.5',
                        maxHeight: '385px',
                        position: 'relative',
                        backgroundImage: `
                          repeating-linear-gradient(
                            transparent,
                            transparent 24px,
                            rgba(15, 23, 42, 0.04) 24px,
                            rgba(15, 23, 42, 0.04) 25px
                          )
                        `,
                        backgroundSize: '100% 25px',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 1rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Page {pageIndex + 2}
                      </h4>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#1f2937',
                          lineHeight: '1.6',
                          textAlign: 'justify',
                          fontFamily: 'serif',
                        }}
                      >
                        {currentRightPage.map((block, index) =>
                          block.type === 'heading' ? (
                            <h5
                              key={index}
                              style={{
                                margin: index > 0 ? '1rem 0 0.75rem' : '0 0 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#1f2937',
                              }}
                            >
                              {block.text}
                            </h5>
                          ) : (
                            <p key={index} style={{ margin: '0 0 0.75rem', textIndent: '1rem' }}>
                              {block.text}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.875rem',
                    background: '#f0f4ff',
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: '1px solid #c7d2fe',
                    width: '100%',
                    maxWidth: '580px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                    Want to read more? Purchase the book to unlock the full content.
                  </p>
                </div>

                {/* Ratings & Comments Section */}
                <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '580px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <h3
                    style={{
                      margin: '0 0 1.25rem',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    Ratings & Comments
                  </h3>

                  {hasPurchased && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      style={{
                        marginBottom: '1.5rem',
                        padding: '0.75rem 1.25rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1d4ed8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2563eb'
                      }}
                    >
                      Write a Review
                    </button>
                  )}

                  {loadingReviews ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem', color: '#64748b' }} />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        No reviews yet. Be the first to rate.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          style={{
                            padding: '1.25rem',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                                {review.user?.name || 'Anonymous'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    style={{
                                      fontSize: '0.875rem',
                                      color: i < review.rating ? '#fbbf24' : '#cbd5e1',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.createdAt && (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {formatDate(review.createdAt)}
                              </div>
                            )}
                          </div>
                          {review.comment && (
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Book Details */}
            <div style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '1rem' }}>
              {/* Category and Wishlist - At Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: togglingWishlist ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    minHeight: '40px',
                  }}
                  onMouseEnter={(e) => {
                    if (!togglingWishlist) {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!togglingWishlist) {
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {togglingWishlist ? (
                    <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '1.25rem', color: '#94a3b8' }} />
                  ) : (
                    <FaHeart 
                      style={{ 
                        fontSize: '1.5rem', 
                        fill: inWishlist ? '#dc2626' : '#94a3b8',
                        color: inWishlist ? '#dc2626' : '#94a3b8'
                      }} 
                    />
                  )}
                </button>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    background: '#e8f1ff',
                    color: '#1d4ed8',
                    borderRadius: '999px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.35px',
                    border: '1px solid #c7d7ff',
                    boxShadow: '0 6px 14px rgba(29,78,216,0.08)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '999px',
                      background: '#1d4ed8',
                    }}
                  />
                  {book.category}
                </span>
              </div>

              {/* Top Section: Cover Image and Book Info */}
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                marginBottom: '1.5rem',
                alignItems: 'flex-start'
              }}>
                {/* Book Cover Image - Left */}
                <div style={{
                  flexShrink: 0,
                  width: '180px',
                  height: '270px'
                }}>
                  <img
                    src={book.coverImageUrl || 'https://via.placeholder.com/180x270?text=No+Cover'}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Book Info - Right */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* Title */}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.2,
                    }}
                  >
                    {book.title}
                  </h1>

                  {/* Author */}
                  <p
                    style={{
                      margin: '0',
                      fontSize: '1rem',
                      color: '#475569',
                      fontWeight: 500,
                    }}
                  >
                    By {book.author}
                  </p>

                  {/* Review (Rating) */}
                  <div style={{ margin: '0.5rem 0' }}>
                    <p style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Review
                    </p>
                    {renderStars(book.rating || 0)}
                  </div>

                  {/* Published Date */}
                  <div style={{ margin: '0.5rem 0' }}>
                    <p style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Published Date
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      color: '#475569',
                      fontWeight: 500
                    }}>
                      {formatDate(book.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: '100%', display: 'grid', gap: '0.9rem' }}>

                {/* Price */}
                <div style={{ margin: '0.4rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: '#2563eb',
                    }}
                  >
                    {book.price === '0' || book.price === 0 ? 'Free' : `$${parseFloat(book.price).toFixed(2)}`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={inCart || addingToCart}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      background: inCart ? '#10b981' : addingToCart ? '#e2e8f0' : '#ffffff',
                      color: inCart ? '#ffffff' : addingToCart ? '#94a3b8' : '#2563eb',
                      border: `2px solid ${inCart ? '#10b981' : addingToCart ? '#e2e8f0' : '#2563eb'}`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: inCart || addingToCart ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!inCart && !addingToCart) {
                        e.currentTarget.style.background = '#f0f4ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!inCart && !addingToCart) {
                        e.currentTarget.style.background = '#ffffff'
                      }
                    }}
                  >
                    {addingToCart ? (
                      <>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart />
                        {inCart ? 'Added to Cart' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
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
                    Buy Now
                  </button>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3
                    style={{
                      margin: '0 0 0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    About this book
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      color: '#64748b',
                      lineHeight: 1.7,
                    }}
                  >
                    {book.description || book.shortDescription || 'No description available'}
                  </p>
                </div>

                {/* Additional Info */}
                  {/* Chapters Section */}
                  {chapters.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h3
                        style={{
                          margin: '0 0 1rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FaBookOpen style={{ fontSize: '0.95rem', color: '#2563eb' }} />
                        Table of Contents
                      </h3>
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '12px',
                          padding: '0.9rem',
                          border: '1px solid #e2e8f0',
                          maxHeight: showAllChapters ? 'none' : '420px',
                          overflow: 'hidden',
                          position: 'relative',
                          maskImage: showAllChapters
                            ? 'none'
                            : 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0))',
                          WebkitMaskImage: showAllChapters
                            ? 'none'
                            : 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0))',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {chapters.map((chapter, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                background: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.05)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    background: '#eef3ff',
                                    color: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {chapter.number}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                                    Chapter {chapter.number}: {chapter.title}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {chapter.pageCount} pages
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {!showAllChapters && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 'auto 0 0 0',
                              height: '54px',
                              background: 'linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(248,250,252,0.9) 60%, #f8fafc 100%)',
                            }}
                          />
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.6rem' }}>
                        <button
                          className="secondary ghost"
                          onClick={() => setShowChaptersModal(true)}
                          style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid #dbeafe',
                            background: '#eef3ff',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          Show all
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false)
            setPendingAction(null)
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Buy Modal */}
      {showBuyModal && book && (
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
            <BuyModalContent book={book} onClose={() => setShowBuyModal(false)} />
          </div>
        </div>
      )}

      {/* Post-Purchase Review Modal */}
      {showPostPurchaseModal && book && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 2000,
          }}
          onClick={handleDismissPostPurchaseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2)',
            }}
          >
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{
                    width: '90px',
                    height: '135px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                />
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: '#475569', lineHeight: 1.6 }}>
                  {getPostPurchaseMessage(book.title)}
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#475569', fontWeight: 500 }}>
                  How was it?
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDismissPostPurchaseModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                Skip / Maybe later
              </button>
              <button
                onClick={() => {
                  setShowPostPurchaseModal(false)
                  setShowReviewModal(true)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2563eb'
                }}
              >
                Rate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewModal && book && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 2000,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes style={{ fontSize: '1.25rem', color: '#64748b' }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{
                    width: '80px',
                    height: '120px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  {book.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  by {book.author}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                Rating <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewRating(rating)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <FaStar
                      style={{
                        fontSize: '2rem',
                        color: rating <= reviewRating ? '#fbbf24' : '#cbd5e1',
                        transition: 'color 0.2s ease',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                Comment (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || submittingReview}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: reviewRating === 0 ? '#cbd5e1' : '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: reviewRating === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
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

      {/* Chapters Modal */}
      {showChaptersModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem',
            zIndex: 2000,
          }}
          onClick={() => setShowChaptersModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              width: 'min(520px, 95vw)',
              height: 'calc(100vh - 2rem)',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '18px',
              boxShadow: '-16px 0 32px rgba(0,0,0,0.18)',
              padding: '1.1rem 1.15rem 1.25rem',
              display: 'grid',
              gap: '0.85rem',
              overflow: 'hidden',
              transform: 'translateX(0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Table of Contents</h3>
              <button className="secondary ghost" onClick={() => setShowChaptersModal(false)} aria-label="Close chapters">
                ✕
              </button>
            </div>
            <div
              style={{
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(chapters || []).map((chapter, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: '#eef3ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {chapter.number}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Chapter {chapter.number}: {chapter.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{chapter.pageCount} pages</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
    </>
  )
}

export default BookDetails

