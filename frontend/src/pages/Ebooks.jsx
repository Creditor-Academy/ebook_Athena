import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSpinner, FaExclamationTriangle, FaBookOpen } from 'react-icons/fa'
import { BuyModalContent } from './BuyModal'
import AuthModal from '../components/AuthModal'
import RecommendedSection from '../components/RecommendedSection'
import PopularSection from '../components/PopularSection'
import CategorySection from '../components/CategorySection'
import { getCurrentUser } from '../services/auth'
import { getAllBooks } from '../services/books'

function Ebooks() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingBook, setPendingBook] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  
  // Get unique categories from books that have at least one book
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(books.map(book => book.category).filter(Boolean))]
    // Filter to only include categories that have at least one book
    return uniqueCategories.filter(category => 
      books.some(book => book.category === category)
    )
  }, [books])
  
  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('[Ebooks] Fetching books from API...')
        setLoading(true)
        setError('')
        const data = await getAllBooks()
        console.log('[Ebooks] Books fetched successfully:', data)
        console.log('[Ebooks] Books array:', data.books)
        console.log('📚 [Ebooks] Books count:', data.books?.length || 0)
        setBooks(data.books || [])
        
        if (!data.books || data.books.length === 0) {
          console.warn('⚠️ [Ebooks] No books found in API response')
        }
      } catch (err) {
        console.error('❌ [Ebooks] Error fetching books:', err)
        console.error('❌ [Ebooks] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
        })
        setError(err.message || 'Failed to load books')
      } finally {
        setLoading(false)
        console.log('🏁 [Ebooks] Fetch completed, loading set to false')
      }
    }
    fetchBooks()
  }, [])

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    const token = urlParams.get('token')
    if (token) {
      localStorage.setItem('accessToken', token)
      checkAuth()
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleBuy = (book) => {
    if (!user) {
      setPendingBook(book)
      setShowAuthModal(true)
    } else {
      setSelected(book)
    }
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    if (pendingBook) {
      setSelected(pendingBook)
      setPendingBook(null)
    }
  }

  const closeModal = () => setSelected(null)

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 >= 0.5
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <span key={i} style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
            )
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} style={{ color: '#fbbf24', fontSize: '1rem', opacity: 0.5 }}>★</span>
            )
          } else {
            return (
              <span key={i} style={{ color: '#cbd5e1', fontSize: '1rem' }}>★</span>
            )
          }
        })}
        <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
          {(rating || 0).toFixed(1)}
        </span>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        color: '#64748b' 
      }}>
        <FaSpinner 
          style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: '#2563eb',
            animation: 'spin 1s linear infinite'
          }} 
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontSize: '1.1rem', margin: 0 }}>Loading books...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        color: '#dc2626' 
      }}>
        <FaExclamationTriangle 
          style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: '#dc2626'
          }} 
        />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
          Failed to load books
        </p>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d4ed8'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563eb'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Show empty state
  if (books.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        color: '#64748b' 
      }}>
        <FaBookOpen 
          style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: '#94a3b8',
            opacity: 0.5
          }} 
        />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#0f172a' }}>
          No books available
        </p>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>
          Check back later for new releases!
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .book-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .book-card:hover {
          transform: translateY(-4px);
        }
        .book-card.selected {
          transform: scale(1.05) translateY(-4px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Recommended Section */}
      <RecommendedSection 
        books={books} 
        isMobile={isMobile} 
        renderStars={renderStars} 
      />

      {/* Popular Section */}
      <PopularSection 
        isMobile={isMobile} 
        renderStars={renderStars} 
      />

      {/* Category Sections */}
      {categories.length > 0 && categories.map((category, index) => {
        // Check if category has books
        const categoryBooks = books.filter(book => book.category === category)
        if (categoryBooks.length === 0) return null
        
        // Alternate layout: even indices get 'left' layout, odd get 'right' layout
        // Section index: Recommended (0), Popular (1), then categories start at 2
        const sectionIndex = index + 2
        const layout = sectionIndex % 2 === 0 ? 'left' : 'right'
        const colorScheme = sectionIndex % 2 === 0 ? 'blue' : 'white'
        
        return (
          <CategorySection
            key={category}
            category={category}
            books={books}
            isMobile={isMobile}
            renderStars={renderStars}
            layout={layout}
            colorScheme={colorScheme}
          />
        )
      })}

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
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1200
        }} role="dialog" aria-modal="true">
          <BuyModalContent book={selected} onClose={closeModal} showClose />
        </div>
      )}
    </>
  )
}

export default Ebooks
