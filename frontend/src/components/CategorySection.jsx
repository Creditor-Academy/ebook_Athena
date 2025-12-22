import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Color schemes - blue and white alternating
const colorSchemes = {
  blue: {
    background: '#eff6ff',
    accent: '#2563eb',
    accentGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    descriptionBg: '#ffffff'
  },
  white: {
    background: '#ffffff',
    accent: '#2563eb',
    accentGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    descriptionBg: '#ffffff'
  }
}

function CategorySection({ category, books, isMobile, renderStars, layout = 'left', colorScheme = 'blue' }) {
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState(null)

  // Get books for this category
  const categoryBooks = useMemo(() => {
    return books
      .filter((book) => book.category === category)
      .slice(0, 6)
      .map((book) => ({
        ...book,
        cover: book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'
      }))
  }, [books, category])

  // Get color scheme (blue or white)
  const colors = colorSchemes[colorScheme] || colorSchemes['blue']

  // Initialize selected book
  useEffect(() => {
    if (categoryBooks.length > 0 && !selectedBook) {
      setSelectedBook(categoryBooks[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryBooks.length])

  // Determine layout: 'left' means cards on left, description on right (like Recommended)
  // 'right' means description on left, cards on right (like Popular)
  const isLeftLayout = layout === 'left'

  // Don't render if no books in this category
  if (categoryBooks.length === 0) {
    return null
  }

  return (
    <section style={{ 
      position: 'relative',
      background: colors.background,
      padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
      width: '100%'
    }} className="fade-in">
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isLeftLayout ? '1fr 400px' : '400px 1fr'),
        gap: isMobile ? '2rem' : '2.5rem',
        alignItems: 'start',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Description Box */}
        {selectedBook && (
          <div style={{
            width: isMobile ? '100%' : '400px',
            height: isMobile ? 'auto' : '100%',
            maxWidth: isMobile ? '100%' : '400px',
            background: colors.descriptionBg,
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: `0 20px 60px ${colors.accent}15, 0 8px 24px ${colors.accent}10`,
            border: `1px solid ${colors.accent}1a`,
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            minHeight: isMobile ? 'auto' : '400px',
            overflow: 'hidden',
            order: isMobile ? 2 : (isLeftLayout ? 2 : 1)
          }}>
            {/* Book Cover Image */}
            <div style={{
              width: '100%',
              height: '200px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              <img
                src={selectedBook.cover}
                alt={`${selectedBook.title} cover`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200?text=No+Cover'
                }}
              />
            </div>

            {/* Book Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{
                margin: '0 0 0.5rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {selectedBook.title}
              </h3>
              <p style={{
                margin: '0 0 0.5rem',
                fontSize: '0.875rem',
                color: '#64748b',
                fontWeight: 500
              }}>
                By {selectedBook.author}
              </p>
              {selectedBook.category && (
                <p style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.75rem',
                  color: colors.accent,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {selectedBook.category}
                </p>
              )}
              <div style={{ marginBottom: '0.75rem' }}>
                {renderStars(selectedBook.rating)}
              </div>
              <p style={{
                margin: '0 0 1rem',
                fontSize: '0.875rem',
                color: '#475569',
                lineHeight: 1.6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                flex: 1
              }}>
                {selectedBook.shortDescription || selectedBook.description || 'Discover this captivating story that will take you on an unforgettable journey.'}
              </p>
              <button
                onClick={() => navigate(`/book/${selectedBook.id}`)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: colors.accentGradient,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px ${colors.accent}30`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${colors.accent}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 4px 16px ${colors.accent}30`
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* Header and Cards Container */}
        <div style={{ order: isMobile ? 1 : (isLeftLayout ? 1 : 2) }}>
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '4px',
              height: '32px',
              background: colors.accentGradient,
              borderRadius: '2px'
            }}></div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}>
                {category}
              </h2>
              <p style={{
                margin: '0.5rem 0 0',
                fontSize: '1rem',
                color: '#64748b',
                fontWeight: 400
              }}>
                Explore our collection of {category.toLowerCase()} books
              </p>
            </div>
          </div>

          {/* Book Cards */}
          <div className="scroll-container" style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            padding: '0.5rem',
            scrollBehavior: 'smooth'
          }}>
            {categoryBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`book-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    flexShrink: 0,
                    width: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '100%',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: isSelected 
                      ? `0 12px 32px ${colors.accent}25` 
                      : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    border: isSelected ? `3px solid ${colors.accent}` : '3px solid transparent',
                    transition: 'all 0.3s ease'
                  }}>
                    <img
                      src={book.cover}
                      alt={`${book.title} cover`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x300?text=No+Cover'
                      }}
                    />
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: colors.accent,
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${colors.accent}40`
                      }}>
                        <span style={{ color: '#ffffff', fontSize: '0.875rem' }}>✓</span>
                      </div>
                    )}
                  </div>
                  <p style={{
                    margin: '0.75rem 0 0',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    fontWeight: isSelected ? 600 : 500,
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategorySection

