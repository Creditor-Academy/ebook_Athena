import { useState } from 'react'
import { writers } from '../data/writers'

function WriterProject() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const selectedWriter = writers[selectedIndex]

  // Animation keyframes
  const fadeSlideKeyframes = `
    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeSlideInImage {
      from {
        opacity: 0;
        transform: translateX(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `

  const handlePrevious = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : writers.length - 1))
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedIndex((prev) => (prev < writers.length - 1 ? prev + 1 : 0))
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }

  const handleSelectWriter = (index) => {
    if (index !== selectedIndex) {
      setIsAnimating(true)
      setTimeout(() => {
        setSelectedIndex(index)
        setTimeout(() => setIsAnimating(false), 50)
      }, 150)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < fullStars ? '#fbbf24' : '#d1d5db', fontSize: '1.1rem' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
          {rating}
        </span>
      </div>
    )
  }

  const sectionStyle = {
    marginTop: '4rem',
    padding: '2.5rem 1.5rem 3.5rem',
    background: 'linear-gradient(135deg, #f9fbff 0%, #f0f4ff 100%)',
    borderRadius: '18px',
    border: '1px solid #e1e9ff',
    boxShadow: '0 14px 38px rgba(37, 99, 235, 0.08)',
  }

  return (
    <section style={sectionStyle}>
      <style>{fadeSlideKeyframes}</style>
      <header className="section-header" style={{ marginBottom: '3rem' }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Meet Our Writers
        </p>
        <h2 style={{ margin: '0.25rem 0 0.4rem' }}>Writers Blog</h2>
        <p className="muted" style={{ margin: 0 }}>
          Discover talented authors and their inspiring stories behind the books.
        </p>
      </header>

      {/* Main Content: Details Left, Image Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Left Side - Writer Details */}
        <div
          style={{
            animation: isAnimating ? 'none' : 'fadeSlideIn 0.6s ease-out',
            animationDelay: '0.1s',
            animationFillMode: 'both',
          }}
        >
          <h2
            style={{
              margin: '0 0 0.5rem',
              fontSize: '2rem',
              color: '#0f172a',
              letterSpacing: '0.02em',
              fontWeight: 700,
            }}
          >
            {selectedWriter.name}
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>{renderStars(selectedWriter.rating)}</div>
          <p
            style={{
              margin: '0 0 1.5rem',
              color: '#4b5563',
              fontSize: '1rem',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            {selectedWriter.bio}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e4ebff',
            }}
          >
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>
                {selectedWriter.books}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 400 }}>Books</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>
                {selectedWriter.followers}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 400 }}>Followers</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedWriter.specialties.map((specialty) => (
              <span
                key={specialty}
                style={{
                  background: '#eef3ff',
                  backgroundImage: 'linear-gradient(135deg, #eef3ff 0%, #e0e7ff 100%)',
                  color: '#1d4ed8',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage =
                    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage =
                    'linear-gradient(135deg, #eef3ff 0%, #e0e7ff 100%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side - Large Writer Image with depth */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            marginLeft: '-2rem',
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              animation: isAnimating ? 'none' : 'fadeSlideInImage 0.8s ease-out',
              animationDelay: '0.2s',
              animationFillMode: 'both',
            }}
          >
            {/* Blurred background effect */}
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                background: 'rgba(37, 99, 235, 0.1)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                zIndex: -1,
                opacity: 0.6,
              }}
            />
            <img
              src={selectedWriter.avatar}
              alt={selectedWriter.name}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: '500px',
                objectFit: 'cover',
                borderRadius: '16px',
                boxShadow:
                  '0 20px 60px rgba(15, 23, 42, 0.15), 0 -10px 30px rgba(255, 255, 255, 0.8)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow =
                  '0 30px 80px rgba(15, 23, 42, 0.2), 0 -15px 40px rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow =
                  '0 20px 60px rgba(15, 23, 42, 0.15), 0 -10px 30px rgba(255, 255, 255, 0.8)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Carousel - Small Pictures with scroll snapping */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '2rem',
          position: 'relative',
        }}
      >
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eef3ff'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.1)'
          }}
          aria-label="Previous writer"
        >
          ←
        </button>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '0.5rem',
            maxWidth: 'calc(100vw - 200px)',
          }}
        >
          <style>
            {`
              div[style*="scrollSnapType"]::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {writers.map((writer, index) => (
            <div
              key={writer.id}
              onClick={() => handleSelectWriter(index)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                scrollSnapAlign: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <img
                src={writer.avatar}
                alt={writer.name}
                style={{
                  width: index === selectedIndex ? '110px' : '70px',
                  height: index === selectedIndex ? '110px' : '70px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: index === selectedIndex ? '5px solid #1d4ed8' : '3px solid #e4ebff',
                  boxShadow:
                    index === selectedIndex
                      ? '0 8px 24px rgba(29, 78, 216, 0.3), 0 0 0 4px rgba(29, 78, 216, 0.1)'
                      : '0 4px 12px rgba(15, 23, 42, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow =
                    index === selectedIndex
                      ? '0 8px 24px rgba(29, 78, 216, 0.3), 0 0 0 4px rgba(29, 78, 216, 0.1)'
                      : '0 4px 12px rgba(15, 23, 42, 0.1)'
                }}
              />
              {index === selectedIndex && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem',
                    color: '#1d4ed8',
                    fontWeight: 600,
                    animation: 'fadeSlideIn 0.4s ease-out',
                  }}
                >
                  {writer.name}
                </div>
              )}
            </div>
          ))}
        </div>

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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eef3ff'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.1)'
          }}
          aria-label="Next writer"
        >
          →
        </button>
      </div>
    </section>
  )
}

export default WriterProject

