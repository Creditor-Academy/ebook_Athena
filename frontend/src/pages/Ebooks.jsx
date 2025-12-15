import { useState, useRef, useMemo, useEffect } from 'react'
import { BuyModalContent } from './BuyModal'
import WriterProject from './WriterProject'
import AuthModal from '../components/AuthModal'
import { getCurrentUser } from '../services/auth'
import cover1 from '../assets/covers/book1.jpg'
import cover2 from '../assets/covers/book2.jpg'
import cover3 from '../assets/covers/1.png'
import cover4 from '../assets/covers/2.png'
import cover5 from '../assets/covers/3.png'
import cover6 from '../assets/covers/4.png'

function Ebooks({ ebooks }) {
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingBook, setPendingBook] = useState(null)
  const recommendedBooks = useMemo(() => {
    // Get all recommended books and add more if needed
    let books = ebooks.filter((book) => book.recommended)
    // If we have less than 6 recommended books, add some non-recommended ones
    if (books.length < 6) {
      const additional = ebooks.filter((book) => !book.recommended).slice(0, 6 - books.length)
      books = [...books, ...additional]
    }
    // Assign cover images from assets
    const covers = [cover1, cover2, cover3, cover4, cover5, cover6]
    return books.slice(0, 6).map((book, index) => ({
      ...book,
      cover: covers[index] || book.cover
    }))
  }, [ebooks])
  const [selectedBook, setSelectedBook] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Initialize selectedBook when recommendedBooks is available
  useEffect(() => {
    if (recommendedBooks.length > 0 && !selectedBook) {
      setSelectedBook(recommendedBooks[0])
      setCurrentIndex(0)
    }
  }, [recommendedBooks, selectedBook])
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartY, setTouchStartY] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const cardsContainerRef = useRef(null)
  const bookRefs = useRef([])

  // Initialize bookRefs array when recommendedBooks changes
  useEffect(() => {
    bookRefs.current = bookRefs.current.slice(0, recommendedBooks.length)
  }, [recommendedBooks])

  // Check authentication on mount and handle Google OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()

    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('token')) {
      // Token received from Google OAuth
      checkAuth()
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Auto-play functionality - move to next book every 5 seconds
  useEffect(() => {
    if (recommendedBooks.length === 0) return

    const autoPlayInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % recommendedBooks.length
        const nextBook = recommendedBooks[nextIndex]
        setSelectedBook(nextBook)
        // Scroll to the book
        if (bookRefs.current[nextIndex]) {
          bookRefs.current[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
        return nextIndex
      })
    }, 5000) // 5 seconds

    return () => clearInterval(autoPlayInterval)
  }, [recommendedBooks])

  const handleBuy = (book) => {
    if (!user) {
      // User not logged in, show auth modal
      setPendingBook(book)
      setShowAuthModal(true)
    } else {
      // User is logged in, proceed with purchase
      setSelected(book)
    }
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    // If there was a pending book, proceed with purchase
    if (pendingBook) {
      setSelected(pendingBook)
      setPendingBook(null)
    }
  }

  const handleSelect = (book) => {
    if (!isDragging) {
      setSelectedBook(book)
      const index = recommendedBooks.findIndex((b) => b.id === book.id)
      setCurrentIndex(index >= 0 ? index : 0)
      // Scroll to the selected book
      if (bookRefs.current[index]) {
        bookRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }

  // Handle scroll to detect which book is in view
  useEffect(() => {
    const handleScroll = () => {
      if (!cardsContainerRef.current) return

      const container = cardsContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      let closestBook = null
      let closestDistance = Infinity
      let closestIndex = 0

      bookRefs.current.forEach((ref, index) => {
        if (!ref) return
        const rect = ref.getBoundingClientRect()
        const bookCenter = rect.left + rect.width / 2
        const distance = Math.abs(containerCenter - bookCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestBook = recommendedBooks[index]
          closestIndex = index
        }
      })

      if (closestBook && closestBook.id !== selectedBook?.id) {
        setSelectedBook(closestBook)
        setCurrentIndex(closestIndex)
      }
    }

    const container = cardsContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [recommendedBooks, selectedBook])

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : recommendedBooks.length - 1
    setCurrentIndex(newIndex)
    setSelectedBook(recommendedBooks[newIndex])
    // Scroll to the book
    if (bookRefs.current[newIndex]) {
      bookRefs.current[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  const handleNext = () => {
    const newIndex = currentIndex < recommendedBooks.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setSelectedBook(recommendedBooks[newIndex])
    // Scroll to the book
    if (bookRefs.current[newIndex]) {
      bookRefs.current[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    // Only handle touches within the card container
    if (!cardsContainerRef.current?.contains(e.target)) {
      return
    }
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e) => {
    if (touchStart !== null && touchStartY !== null) {
      const currentX = e.targetTouches[0].clientX
      const currentY = e.targetTouches[0].clientY
      const deltaX = Math.abs(touchStart - currentX)
      const deltaY = Math.abs(touchStartY - currentY)
      
      // Only prevent default if we're swiping horizontally (more horizontal than vertical)
      // and only within the card container
      if (deltaX > 10 && deltaX > deltaY * 1.5) {
        e.stopPropagation()
        e.preventDefault()
        setTouchEnd(currentX)
      }
    }
  }

  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null)
      setTouchEnd(null)
      setTouchStartY(null)
      return
    }
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      e.stopPropagation()
      e.preventDefault()
      if (isLeftSwipe) {
        handleNext()
      } else {
        handlePrevious()
      }
    }
    
    setTouchStart(null)
    setTouchEnd(null)
    setTouchStartY(null)
  }

  // Mouse drag handlers for desktop
  const onMouseDown = (e) => {
    // Only start dragging if clicking on the card container, not on buttons or links
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) {
      return
    }
    // Only handle if within the card container
    if (!cardsContainerRef.current?.contains(e.target)) {
      return
    }
    setIsDragging(false)
    setTouchStart(e.clientX)
  }

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      const distance = Math.abs(touchStart - e.clientX)
      // Only consider it dragging if moved more than 5px
      if (distance > 5) {
        setIsDragging(true)
        setTouchEnd(e.clientX)
      }
    }
  }

  const onMouseUp = (e) => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false)
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && isDragging) {
      e.preventDefault()
      handleNext()
    } else if (isRightSwipe && isDragging) {
      e.preventDefault()
      handlePrevious()
    }
    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const closeModal = () => setSelected(null)

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    zIndex: 1200,
  }


  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < fullStars ? '#fbbf24' : '#64748b', fontSize: '0.9rem' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '0.4rem', color: '#475569', fontSize: '0.8rem' }}>
          {rating}
        </span>
      </div>
    )
  }

  return (
    <>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Recommended Section */}
        <section style={{ 
          marginBottom: '3rem', 
          position: 'relative',
          background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 50%, #f5f8ff 100%)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(30, 64, 175, 0.08)',
        }}>
          <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2>Recommended for You</h2>
              <p>Handpicked selections based on your interests.</p>
            </div>
            {/* Navigation arrows in top right */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handlePrevious}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e4ebff',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#1d4ed8',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef3ff'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                aria-label="Previous book"
              >
                ←
              </button>
              <button
                onClick={handleNext}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e4ebff',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#1d4ed8',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef3ff'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                aria-label="Next book"
              >
                →
              </button>
            </div>
          </header>
          {/* Top Section - Book Details Grid */}
          {selectedBook && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '1.5rem',
              alignItems: 'start'
            }}>
              {/* Left Side - Title, Author, Rating */}
              <div style={{ 
                padding: '1rem 0',
              }}>
                <h2 style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: '1.75rem', 
                  fontWeight: 700,
                  color: '#0f172a', 
                  lineHeight: 1.2,
                }}>
                  {selectedBook.title}
                </h2>
                <p style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: '0.95rem', 
                  color: '#475569',
                  fontWeight: 500,
                }}>
                  By {selectedBook.author}
                </p>
                <div style={{ marginTop: '0.25rem' }}>
                  {renderStars(selectedBook.rating)}
                </div>
              </div>
              
              {/* Right Side - Description and Buy Now */}
              <div style={{
                background: 'rgba(30, 58, 138, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 8px 20px rgba(30, 64, 175, 0.25)',
                border: '1px solid rgba(30, 64, 175, 0.3)',
                color: '#ffffff',
                height: 'fit-content',
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ margin: 0, color: '#e0e7ff', lineHeight: 1.5, fontSize: '0.8rem' }}>
                    {selectedBook.shortDescription || selectedBook.description}
                  </p>
                </div>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#c7d2fe' }}>Downloads: </span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{selectedBook.downloads}</span>
                </div>
                <button
                  onClick={() => handleBuy(selectedBook)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: '#ffffff',
                    color: '#1d4ed8',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eef3ff'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Books Container - Below the details, no overlap */}
          <div
            ref={cardsContainerRef}
            className="card-grid"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ 
              userSelect: 'none',
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-x pinch-zoom',
              maxWidth: '100%',
              position: 'relative',
              alignItems: 'flex-end',
            }}
          >
              {recommendedBooks.map((book, index) => {
                const isSelected = selectedBook?.id === book.id
                return (
                  <div 
                    key={book.id}
                    ref={(el) => (bookRefs.current[index] = el)}
                    onClick={() => handleSelect(book)}
                    style={{ 
                      flexShrink: 0,
                      width: isSelected ? '140px' : '120px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ cursor: 'pointer', width: '100%' }}>
                      <img
                        src={book.cover}
                        alt={`${book.title} cover`}
                        style={{
                          width: '100%',
                          height: isSelected ? '200px' : '170px',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isSelected 
                            ? '0 12px 24px rgba(30, 64, 175, 0.25)' 
                            : '0 4px 12px rgba(30, 64, 175, 0.12)',
                          borderRadius: '6px',
                        }}
                      />
                    </div>
                    <p style={{
                      margin: '0.5rem 0 0',
                      fontSize: isSelected ? '0.85rem' : '0.75rem',
                      color: '#0f172a',
                      fontWeight: isSelected ? 600 : 500,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {book.title}
                    </p>
                  </div>
                )
              })}
            </div>
        </section>
      </div>

      {/* Writer Project Section */}
      <WriterProject />

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false)
            setPendingBook(null)
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {selected && (
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <BuyModalContent book={selected} onClose={closeModal} showClose />
        </div>
      )}
    </>
  )
}

export default Ebooks

