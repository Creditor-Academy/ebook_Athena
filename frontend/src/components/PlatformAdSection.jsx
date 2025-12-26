import { useState } from 'react'
import CategorySection from './CategorySection'

function PlatformAdSection({ isMobile, categories, books, renderStars, selectedCategory, setSelectedCategory }) {

  return (
    <>
    <section style={{ 
      position: 'relative',
      padding: isMobile ? '2rem 1.5rem' : '2.5rem 2.5rem',
      width: '100%',
      overflow: 'hidden'
    }} className="fade-in">
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }}></div>
      
      {/* Gradient Overlay with Opacity */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.6) 0%, rgba(29, 78, 216, 0.6) 100%)',
        zIndex: 0
      }}></div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Content */}
          <div style={{
            textAlign: 'center',
            maxWidth: '800px'
          }}>
            <h2 style={{
              margin: '0 0 0.75rem',
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2
            }}>
              Browse by Category
            </h2>
            <p style={{
              margin: '0 0 1.5rem',
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6
            }}>
              Explore books organized by category
            </p>
            
            {/* Category Tags */}
            {categories && categories.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(isSelected ? null : category)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: isSelected 
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.15)',
                        color: isSelected ? '#2563eb' : '#ffffff',
                        border: isSelected ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '25px',
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isSelected 
                          ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                          : 'none',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        zIndex: 1
      }}>      </div>
    </section>

    {/* Selected Category Books */}
    {selectedCategory && books && (
      <CategorySection
        category={selectedCategory}
        books={books}
        isMobile={isMobile}
        renderStars={renderStars}
        layout="left"
        colorScheme="blue"
      />
    )}
    </>
  )
}

export default PlatformAdSection

