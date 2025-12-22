import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function RecommendedSection({ books, isMobile, renderStars }) {
  const navigate = useNavigate()
  const [selectedRecommended, setSelectedRecommended] = useState(null)

  // Get recommended books
  const recommendedBooks = useMemo(() => {
    let recommended = books
      .filter((book) => book.recommended)
      .slice(0, 6)
      .map((book) => ({
        ...book,
        cover: book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'
      }))

    // If we have less than 6 recommended books, add some non-recommended ones
    if (recommended.length < 6) {
      const additional = books
        .filter((book) => !book.recommended)
        .slice(0, 6 - recommended.length)
        .map((book) => ({
          ...book,
          cover: book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'
        }))
      recommended = [...recommended, ...additional]
    }
    return recommended
  }, [books])

  // Initialize selected book
  useEffect(() => {
    if (recommendedBooks.length > 0 && !selectedRecommended) {
      setSelectedRecommended(recommendedBooks[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedBooks.length])

  return (
    <section style={{ 
      position: 'relative',
      background: '#eff6ff',
      padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
      width: '100%'
    }} className="fade-in">
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
        gap: isMobile ? '2rem' : '2.5rem',
        alignItems: 'start',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header and Cards Container */}
        <div>
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '4px',
              height: '32px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                Recommended for You
              </h2>
              <p style={{
                margin: '0.5rem 0 0',
                fontSize: '1rem',
                color: '#64748b',
                fontWeight: 400
              }}>
                Handpicked selections based on your interests
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
            {recommendedBooks.map((book) => {
              const isSelected = selectedRecommended?.id === book.id
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedRecommended(book)}
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
                      ? '0 12px 32px rgba(37, 99, 235, 0.25)' 
                      : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    border: isSelected ? '3px solid #2563eb' : '3px solid transparent',
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
                        background: '#2563eb',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
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

        {/* Right Side - Square Description Box */}
        {selectedRecommended && (
          <div style={{
            width: isMobile ? '100%' : '400px',
            height: isMobile ? 'auto' : '100%',
            maxWidth: isMobile ? '100%' : '400px',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 20px 60px rgba(30, 64, 175, 0.15), 0 8px 24px rgba(30, 64, 175, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            minHeight: isMobile ? 'auto' : '400px',
            overflow: 'hidden',
            order: isMobile ? 2 : 'auto'
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
                src={selectedRecommended.cover}
                alt={`${selectedRecommended.title} cover`}
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
                {selectedRecommended.title}
              </h3>
              <p style={{
                margin: '0 0 0.5rem',
                fontSize: '0.875rem',
                color: '#64748b',
                fontWeight: 500
              }}>
                By {selectedRecommended.author}
              </p>
              {selectedRecommended.category && (
                <p style={{
                  margin: '0 0 0.75rem',
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {selectedRecommended.category}
                </p>
              )}
              <div style={{ marginBottom: '0.75rem' }}>
                {renderStars(selectedRecommended.rating)}
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
                {selectedRecommended.shortDescription || selectedRecommended.description || 'Discover this captivating story that will take you on an unforgettable journey.'}
              </p>
              <button
                onClick={() => navigate(`/book/${selectedRecommended.id}`)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)'
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default RecommendedSection

