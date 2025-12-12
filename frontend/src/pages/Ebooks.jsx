import { useState, useRef, useMemo } from 'react'
import EbookCard from '../components/EbookCard'
import { BuyModalContent } from './BuyModal'
import WriterProject from './WriterProject'

function Ebooks({ ebooks }) {
  const [selected, setSelected] = useState(null)
  const recommendedBooks = useMemo(() => ebooks.filter((book) => book.recommended), [ebooks])
  const [selectedBook, setSelectedBook] = useState(() => recommendedBooks[0] || null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartY, setTouchStartY] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const cardsContainerRef = useRef(null)

  const handleBuy = (book) => {
    setSelected(book)
  }

  const handleSelect = (book) => {
    if (!isDragging) {
      setSelectedBook(book)
      const index = recommendedBooks.findIndex((b) => b.id === book.id)
      setCurrentIndex(index >= 0 ? index : 0)
    }
  }

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : recommendedBooks.length - 1
    setCurrentIndex(newIndex)
    setSelectedBook(recommendedBooks[newIndex])
  }

  const handleNext = () => {
    const newIndex = currentIndex < recommendedBooks.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setSelectedBook(recommendedBooks[newIndex])
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

  const bookDetailStyle = {
    position: 'sticky',
    top: '2rem',
    background: '#1e3a8a',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 12px 28px rgba(30, 64, 175, 0.2)',
    border: '1px solid #1e40af',
    height: 'fit-content',
    color: '#ffffff',
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < fullStars ? '#fbbf24' : '#64748b', fontSize: '1.2rem' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '0.5rem', color: '#e0e7ff', fontSize: '0.9rem' }}>
          {rating}
        </span>
      </div>
    )
  }

  return (
    <>
      <div 
        className="ebooks-grid"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) 380px', 
          gap: '2rem',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Left Column - Books Section */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          {/* Recommended Section */}
          <section style={{ marginBottom: '3rem', position: 'relative' }}>
            <header className="section-header">
              <h2>Recommended for You</h2>
              <p>Handpicked selections based on your interests.</p>
            </header>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <button
                onClick={handlePrevious}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
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
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef3ff'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                }}
                aria-label="Previous book"
              >
                ←
              </button>
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
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem 0',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                  touchAction: 'pan-x pinch-zoom', // Allow horizontal panning, prevent vertical
                  maxWidth: '100%',
                  position: 'relative',
                }}
              >
                {recommendedBooks.map((book) => (
                  <div 
                    key={book.id} 
                    onClick={() => handleSelect(book)} 
                    style={{ 
                      cursor: 'pointer',
                      flexShrink: 0,
                      width: '280px',
                    }}
                  >
                    <EbookCard book={book} actionLabel="Buy Now" onAction={handleBuy} />
                  </div>
                ))}
              </div>
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
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
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef3ff'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                }}
                aria-label="Next book"
              >
                →
              </button>
            </div>
          </section>
        </div>

        {/* Right Column - Book Details Panel */}
        {selectedBook && (
          <div style={bookDetailStyle}>
            <img
              src={selectedBook.cover}
              alt={`${selectedBook.title} cover`}
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
              }}
            />
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', color: '#ffffff', lineHeight: 1.3 }}>
              {selectedBook.title}
            </h2>
            <p style={{ margin: '0 0 0.75rem', color: '#e0e7ff', fontSize: '0.9rem' }}>
              By {selectedBook.author}
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              {renderStars(selectedBook.rating)}
            </div>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#c7d2fe' }}>Downloads: </span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>{selectedBook.downloads}</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, color: '#e0e7ff', lineHeight: 1.5, fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {selectedBook.shortDescription || selectedBook.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Writer Project Section */}
      <WriterProject />

      {selected && (
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <BuyModalContent book={selected} onClose={closeModal} showClose />
        </div>
      )}
    </>
  )
}

export default Ebooks

