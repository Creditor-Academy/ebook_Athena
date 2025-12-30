import { useState, useEffect, useRef } from 'react'
import { FaSpinner, FaBrain, FaCheckCircle } from 'react-icons/fa'

function SummarizerModal({ 
  isOpen, 
  onClose, 
  tocItems, 
  selectedChapter, 
  onChapterChange, 
  onGenerate, 
  summaryText, 
  isLoading,
  theme = 'light'
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const scrollContainerRef = useRef(null)

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('')
      setIsTyping(false)
      setIsExpanded(false)
    }
  }, [isOpen])

  // Auto-scroll to bottom when text is being typed
  useEffect(() => {
    if (isTyping && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          // Smooth scroll to bottom to follow the typing cursor
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
          
          // Check if there's more content to scroll
          const container = scrollContainerRef.current
          const hasMoreContent = container.scrollHeight > container.clientHeight
          const isNearBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 10
          setShowScrollIndicator(hasMoreContent && !isNearBottom)
        }
      })
    }
  }, [displayedText, isTyping])

  // Handle scroll events to show/hide gradient indicator
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const hasMoreContent = container.scrollHeight > container.clientHeight
      const isNearBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 10
      setShowScrollIndicator(hasMoreContent && !isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    // Initial check
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [displayedText, isExpanded])

  // Scroll to top when starting new summary
  useEffect(() => {
    if (scrollContainerRef.current && !isLoading && summaryText && summaryText !== 'Select a chapter to summarize.') {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [summaryText, isLoading])

  // Handle typing animation when summary text changes
  useEffect(() => {
    if (summaryText && !isLoading && summaryText !== 'Select a chapter to summarize.') {
      setIsExpanded(true)
      setIsTyping(true)
      setDisplayedText('')
      
      let currentIndex = 0
      const typingSpeed = 15 // milliseconds per character
      let timeoutId = null
      
      const typeNextChar = () => {
        if (currentIndex < summaryText.length) {
          setDisplayedText(summaryText.substring(0, currentIndex + 1))
          currentIndex++
          timeoutId = setTimeout(typeNextChar, typingSpeed)
        } else {
          setIsTyping(false)
          // Final scroll to bottom when typing completes
          if (scrollContainerRef.current) {
            setTimeout(() => {
              scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
              })
            }, 100)
          }
        }
      }
      
      // Start typing after a short delay
      timeoutId = setTimeout(typeNextChar, 300)
      
      // Cleanup function
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    } else if (isLoading) {
      setIsExpanded(true)
      setDisplayedText('')
      setIsTyping(false)
    }
  }, [summaryText, isLoading])

  const handleGenerate = () => {
    setIsExpanded(true)
    onGenerate()
  }

  if (!isOpen) return null

  const palette = {
    light: {
      surface: '#ffffff',
      surfaceSoft: '#f5f7fb',
      text: '#0f172a',
      subtext: '#4b5563',
      border: '#d9e2f3',
      backdrop: 'rgba(0,0,0,0.25)',
    },
    dark: {
      surface: '#0f172a',
      surfaceSoft: '#0b1224',
      text: '#e5edff',
      subtext: '#cbd5f5',
      border: '#111827',
      backdrop: 'rgba(0,0,0,0.35)',
    },
    night: {
      surface: '#0b0b08',
      surfaceSoft: '#0f0f0a',
      text: '#f8f5d0',
      subtext: '#e7e1a6',
      border: '#1f1f14',
      backdrop: 'rgba(0,0,0,0.4)',
    },
  }[theme]

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .summarizer-modal-content {
          animation: fadeIn 0.3s ease-out;
        }
        .typing-cursor::after {
          content: '|';
          animation: pulse 1s infinite;
          color: ${palette.text};
          font-weight: 300;
        }
        
        /* Custom scrollbar for webkit browsers */
        .summarizer-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .summarizer-scroll-container::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .summarizer-scroll-container::-webkit-scrollbar-thumb {
          background: ${palette.border};
          border-radius: 4px;
        }
        .summarizer-scroll-container::-webkit-scrollbar-thumb:hover {
          background: ${palette.subtext};
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: palette.backdrop,
          backdropFilter: 'blur(2px)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="summarizer-modal-content"
          style={{
            position: 'relative',
            width: isExpanded ? 'min(700px, 95vw)' : 'min(500px, 90vw)',
            maxHeight: isExpanded ? '90vh' : '80vh',
            background: palette.surface,
            color: palette.text,
            border: `1px solid ${palette.border}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: isExpanded ? '1.5rem' : '1.2rem',
            display: 'grid',
            gap: isExpanded ? '1rem' : '0.8rem',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaBrain 
                style={{ 
                  fontSize: '1.5rem', 
                  color: '#6366f1',
                  animation: isLoading ? 'pulse 2s infinite' : 'none'
                }} 
              />
              <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                AI Summarizer
              </h4>
            </div>
            <button 
              className="secondary ghost" 
              onClick={onClose} 
              aria-label="Close summarizer"
              style={{
                borderRadius: '8px',
                padding: '0.5rem',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Chapter Selector */}
          {!isExpanded && (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', color: palette.subtext, fontWeight: 500 }}>
                Select Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => onChapterChange(e.target.value)}
                disabled={isLoading}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  border: `1px solid ${palette.border}`,
                  background: palette.surfaceSoft,
                  color: palette.text,
                  fontSize: '0.95rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {tocItems.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Generate Button */}
          {!isExpanded && (
            <button 
              className="primary" 
              onClick={handleGenerate} 
              disabled={isLoading}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <FaBrain />
                  Generate Summary
                </>
              )}
            </button>
          )}

          {/* Loading State */}
          {isLoading && isExpanded && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
                minHeight: '200px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <FaSpinner 
                  style={{ 
                    fontSize: '3rem', 
                    color: '#6366f1',
                    animation: 'spin 1s linear infinite'
                  }} 
                />
                <FaBrain
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.5rem',
                    color: '#818cf8',
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: palette.text,
                  marginBottom: '0.5rem'
                }}>
                  Generating Summary for You
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: palette.subtext 
                }}>
                  This may take a moment...
                </p>
              </div>
            </div>
          )}

          {/* Summary Display */}
          {!isLoading && isExpanded && summaryText && summaryText !== 'Select a chapter to summarize.' && (
            <div
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                background: palette.surfaceSoft,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px',
                maxHeight: '60vh',
              }}
            >
              {/* Scrollable content container */}
              <div
                ref={scrollContainerRef}
                className="summarizer-scroll-container"
                style={{
                  padding: '1.25rem',
                  color: palette.text,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.7',
                  fontSize: '0.95rem',
                  position: 'relative',
                  scrollBehavior: 'smooth',
                  // Custom scrollbar styling for Firefox
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${palette.border} transparent`,
                }}
              >
                {displayedText}
                {isTyping && (
                  <span className="typing-cursor" style={{ marginLeft: '2px' }} />
                )}
                {!isTyping && displayedText === summaryText && (
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: `1px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#10b981',
                    fontSize: '0.85rem',
                  }}>
                    <FaCheckCircle />
                    <span>Summary Complete</span>
                  </div>
                )}
                {/* Spacer to ensure cursor is visible */}
                {isTyping && <div style={{ height: '2rem' }} />}
              </div>
              
              {/* Gradient fade at bottom when scrolling (indicates more content) */}
              {showScrollIndicator && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: `linear-gradient(to bottom, transparent, ${palette.surfaceSoft})`,
                    pointerEvents: 'none',
                    borderRadius: '0 0 12px 12px',
                    transition: 'opacity 0.3s ease',
                  }}
                />
              )}
            </div>
          )}

          {/* Error State */}
          {!isLoading && isExpanded && summaryText && summaryText.startsWith('Error:') && (
            <div
              style={{
                border: `1px solid #ef4444`,
                borderRadius: '12px',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '0.9rem',
              }}
            >
              {summaryText}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SummarizerModal

