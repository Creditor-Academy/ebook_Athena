import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ebooks } from '../data/ebooks'
import { getCurrentUser } from '../services/auth'
import AuthModal from '../components/AuthModal'
import { BuyModalContent } from './BuyModal'
import { FaStar, FaShoppingCart, FaArrowLeft, FaBookOpen } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Mock chapters data for each book
const bookChapters = {
  'athena-rising': [
    { number: 1, title: 'Dawn of Resolve', pageCount: 24 },
    { number: 2, title: 'The Quiet Library', pageCount: 28 },
    { number: 3, title: 'Letters in the Cloud', pageCount: 32 },
    { number: 4, title: 'The Midnight Reader', pageCount: 26 },
    { number: 5, title: 'Between Shelves and Stars', pageCount: 30 },
    { number: 6, title: 'Wisdom\'s Path', pageCount: 35 },
  ],
  'code-calm': [
    { number: 1, title: 'Introduction to Mindful Coding', pageCount: 20 },
    { number: 2, title: 'Setting Up Your Practice', pageCount: 25 },
    { number: 3, title: 'Code Quality and Clarity', pageCount: 30 },
    { number: 4, title: 'Work-Life Balance', pageCount: 28 },
    { number: 5, title: 'Advanced Practices', pageCount: 32 },
  ],
  'design-light': [
    { number: 1, title: 'Principles of Human-Centered Design', pageCount: 22 },
    { number: 2, title: 'Understanding Your Users', pageCount: 27 },
    { number: 3, title: 'Creating Intuitive Interfaces', pageCount: 29 },
    { number: 4, title: 'Delight and Joy in Design', pageCount: 26 },
  ],
  'story-maps': [
    { number: 1, title: 'The Art of Storytelling', pageCount: 24 },
    { number: 2, title: 'Building Your Framework', pageCount: 30 },
    { number: 3, title: 'Plotting Unforgettable Narratives', pageCount: 28 },
    { number: 4, title: 'Advanced Techniques', pageCount: 32 },
  ],
  'fire-blood': [
    { number: 1, title: 'The Conquest', pageCount: 45 },
    { number: 2, title: 'Reign of Dragons', pageCount: 50 },
    { number: 3, title: 'The Dance Begins', pageCount: 48 },
    { number: 4, title: 'Aftermath', pageCount: 42 },
  ],
}

// Sample content for each book (expanded to ~2 pages)
const sampleContent = {
  'athena-rising': `In the quiet hours before dawn, when the world seems to pause and hold its breath, there exists a moment of profound possibility. This is the time when Athena rises—not just in myth, but in the hearts of those who seek wisdom and growth.

The journey of personal development is not a sprint but a marathon, one that requires patience, dedication, and an unwavering commitment to learning. Every chapter of life brings new challenges, new opportunities to expand our understanding of ourselves and the world around us.

In this book, we will explore transformative strategies that have guided countless individuals on their path to continuous learning and personal excellence. These are not quick fixes or empty promises, but time-tested principles that have proven their worth across generations.

**Chapter 1: The Foundation**

The foundation of any meaningful transformation lies in self-awareness. Before we can grow, we must first understand where we stand. This understanding doesn't come from external validation or comparison with others, but from honest introspection and a willingness to see ourselves as we truly are.

Many people fear this level of honesty, believing that acknowledging their current state means accepting limitations. But the opposite is true. Only when we clearly see our starting point can we chart a course toward where we want to be. This clarity becomes our compass, guiding every decision, every effort, every step forward.

The process begins with reflection. Set aside time each day—even just ten minutes—to contemplate your thoughts, feelings, and actions. Ask yourself: What did I learn today? What challenged me? What brought me joy? These simple questions open the door to deeper self-understanding.

**Chapter 2: Embracing Continuous Learning**

Learning is not confined to classrooms or structured courses. It happens in every moment, with every interaction, in every challenge we face. The key is to approach life with the mindset of a perpetual student, always open to new ideas, new perspectives, new ways of understanding.

This mindset transforms obstacles into opportunities. A mistake becomes a lesson. A setback becomes a chance to recalibrate. A question we can't answer becomes an invitation to explore. When we shift our perspective in this way, every experience becomes valuable, every moment becomes a chance to grow.

The most successful learners are those who remain curious. They ask questions, they seek out new experiences, they're not afraid to admit what they don't know. This humility is not weakness—it's strength. It's the foundation upon which true expertise is built.`,
  'code-calm': `The art of coding extends far beyond the syntax and algorithms we write. It is a practice—a mindful practice—that when approached with intention and care, transforms not just our code, but our entire approach to engineering and life.

Mindful coding begins with presence. It means being fully engaged with each line we write, each problem we solve, each solution we craft. It's about creating space for clarity, for understanding, for excellence.

This book is a guide to cultivating that mindful approach. Through practical techniques and real-world examples, you'll learn how to write code that is not only functional but beautiful—code that serves both the project and the programmer.

**Chapter 1: The Philosophy of Mindful Coding**

Before we dive into techniques and practices, we must understand the philosophy that underpins mindful coding. At its core, mindful coding is about bringing awareness and intention to every aspect of our work. It's about recognizing that code is not just a means to an end, but an expression of thought, care, and craftsmanship.

When we code mindfully, we're not just solving problems—we're creating solutions that will be read, understood, and maintained by others (including our future selves). This awareness changes how we approach our work. We begin to think not just about what works, but about what works well, what's clear, what's maintainable.

**Chapter 2: Creating Your Practice**

Establishing a mindful coding practice requires intention and consistency. Start with the environment you work in. Create a space that supports focus and calm. This might mean clearing clutter, adjusting lighting, or setting up your workspace in a way that feels right for you.

Then, establish rituals that signal the beginning of focused work. This could be a few minutes of meditation, a walk, or simply taking three deep breaths before you start coding. These rituals help transition your mind into a state of presence and focus.

During your coding sessions, practice single-tasking. Focus on one problem, one feature, one refactoring at a time. When distractions arise—and they will—acknowledge them and gently return your attention to the task at hand. This practice of returning attention, again and again, is the essence of mindfulness.`,
  'design-light': `Great design is invisible. When done well, it fades into the background, allowing users to focus on what matters most—their goals, their tasks, their experience. This is the essence of human-centered design: putting people at the center of every decision.

In this book, we'll explore how to create products and interfaces that don't just look good, but feel right. We'll dive into the principles that make interactions intuitive, the techniques that create delight, and the processes that ensure our designs truly serve their intended users.

**Chapter 1: Understanding Human-Centered Design**

Human-centered design starts with empathy. Before we can design solutions, we must understand the people we're designing for. This means going beyond demographics and user personas. It means understanding their motivations, their frustrations, their goals, and their context.

This understanding comes from observation, conversation, and genuine curiosity about how people interact with the world. When we take the time to truly see and understand our users, our designs naturally begin to align with their needs. We start creating solutions that feel intuitive because they reflect how people actually think and work.

**Chapter 2: Principles of Intuitive Design**

Intuitive design feels effortless to users. They can accomplish their goals without thinking about how the interface works—the interface simply gets out of their way. This feeling of effortlessness comes from following certain principles that align with how humans naturally think and behave.

The principle of familiarity suggests that users bring expectations from other experiences. When we leverage familiar patterns—common navigation structures, standard iconography, conventional layouts—we reduce the cognitive load on users. They don't have to learn how our interface works; they already know.

The principle of feedback ensures that users always understand what's happening. Every action should have a clear, immediate response. A button press should show visual feedback. A form submission should indicate success or error. This feedback loop helps users feel in control and confident in their interactions.`,
  'story-maps': `Every great story begins with a map—not a geographical map, but a narrative one. A story map guides us through the emotional landscape of our characters, the arc of their journey, and the themes that give our narratives depth and meaning.

Whether you're crafting fiction, memoir, or any form of narrative, understanding how to plot and structure your story is fundamental to creating work that captivates and resonates with readers.

**Chapter 1: The Foundation of Story**

A story is more than a sequence of events. It's a journey that transforms characters, challenges assumptions, and reveals truth. To create compelling narratives, we must understand the fundamental elements that make stories work: character, conflict, and change.

Characters are the heart of any story. They are the vehicles through which readers experience the narrative. To create memorable characters, we must understand their desires, their fears, their flaws, and their strengths. These elements drive their choices, which in turn drive the plot.

Conflict arises when characters pursue their goals in the face of obstacles. These obstacles can be external—other characters, forces of nature, societal constraints—or internal—their own fears, doubts, or limitations. The tension created by this conflict is what keeps readers engaged.

**Chapter 2: Mapping Your Narrative**

A story map is a tool for planning and organizing your narrative. It helps you see the big picture while also tracking the details that make your story come alive. Begin by identifying your story's key beats: the inciting incident, the rising action, the climax, the falling action, and the resolution.

Each of these beats serves a specific function in your narrative. The inciting incident disrupts the status quo and sets the story in motion. The rising action develops the conflict and raises the stakes. The climax is the point of maximum tension, where the conflict reaches its peak. The falling action shows the consequences, and the resolution brings closure.`,
  'fire-blood': `The history of House Targaryen is written in fire and blood. From Aegon's conquest to the Dance of Dragons, theirs is a saga of power, ambition, and the price of ruling the Seven Kingdoms. This chronicle details the rise and fall of the dragonlords, their victories and defeats, their triumphs and tragedies.

**Chapter 1: Aegon's Conquest**

In the year 2 BC, Aegon Targaryen, First of His Name, set foot on the shores of Westeros with his sisters Visenya and Rhaenys, and their three dragons: Balerion, Vhagar, and Meraxes. What followed would reshape the continent forever.

Aegon had watched the Seven Kingdoms tear themselves apart in endless wars. He saw weakness, division, and opportunity. With dragonfire and steel, he would forge them into one kingdom, united under his rule. But unity would come at a terrible cost.

The Field of Fire saw the combined armies of the Reach and the Westerlands burn. Thousands perished in dragonflame, and the survivors bent the knee. Harren the Black and his sons died in Harrenhal, their massive castle turned into their tomb. The Dornish wars would drag on for years, but one by one, the kingdoms submitted to the Targaryen rule.

**Chapter 2: The Reign of the Dragons**

With the conquest complete, Aegon established his capital at King's Landing, building the Red Keep and the Iron Throne from the swords of his vanquished enemies. For nearly three hundred years, the Targaryens ruled Westeros, their dragons ensuring their dominance.

But dragons are fire made flesh, and fire cannot be contained forever. The Dance of Dragons would tear the family apart, pitting Targaryen against Targaryen in a war that would see most of the dragons perish. The dragons that remained grew smaller, weaker, until the last of them died during the reign of Aegon III.`,
}

function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'cart' or 'buy'
  const [inCart, setInCart] = useState(false)
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [showChaptersModal, setShowChaptersModal] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    // Find book by ID
    const foundBook = ebooks.find((b) => b.id === id)
    setBook(foundBook)

    // Check authentication
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          // Check if book is in cart (you can implement cart API here)
          // For now, we'll skip this
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [id])

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction('cart')
      setShowAuthModal(true)
      return
    }

    // Add to cart logic (implement API call here)
    console.log('Adding to cart:', book.id)
    setInCart(true)
    // You can show a toast notification here
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

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    
    if (pendingAction === 'cart') {
      handleAddToCart()
    } else if (pendingAction === 'buy') {
      handleBuyNow()
    }
    
    setPendingAction(null)
  }

  const chapters = book ? (bookChapters[book.id] || []) : []

  const truncateParagraph = (text, limit = 380) => {
    if (!text) return ''
    const trimmed = text.trim()
    if (trimmed.length <= limit) return trimmed
    return `${trimmed.slice(0, limit).replace(/\s+\S*$/, '')}…`
  }

  const rawSample = book
    ? sampleContent[book.id] || book.description || 'Sample content coming soon.'
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

  if (!book) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Book not found</h2>
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/ebooks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '2rem',
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
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}
            >
              {/* Book Cover */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
                    objectFit: 'contain',
                  }}
                />
              </div>

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
                    maxWidth: '100%',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                    Want to read more? Purchase the book to unlock the full content.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Book Details */}
            <div style={{ padding: '2.5rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '1rem' }}>
              <div style={{ maxWidth: '100%', display: 'grid', gap: '0.9rem' }}>
                {/* Category */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                      marginBottom: '0.25rem',
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

                {/* Title */}
                <h1
                  style={{
                    margin: '0',
                    fontSize: '2.1rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.15,
                  }}
                >
                  {book.title}
                </h1>

                {/* Author */}
                <p
                  style={{
                    margin: '0',
                    fontSize: '1.1rem',
                    color: '#475569',
                    fontWeight: 400,
                  }}
                >
                  By {book.author}
                </p>

                {/* Rating */}
                <div style={{ margin: '0.25rem 0 0' }}>{renderStars(book.rating)}</div>

                {/* Price */}
                <div style={{ margin: '0.4rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: '#2563eb',
                    }}
                  >
                    {book.price}
                  </span>
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
                    {book.description || book.shortDescription}
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={inCart}
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    background: inCart ? '#10b981' : '#ffffff',
                    color: inCart ? '#ffffff' : '#2563eb',
                    border: `2px solid ${inCart ? '#10b981' : '#2563eb'}`,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: inCart ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!inCart) {
                      e.currentTarget.style.background = '#f0f4ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!inCart) {
                      e.currentTarget.style.background = '#ffffff'
                    }
                  }}
                >
                  <FaShoppingCart />
                  {inCart ? 'Added to Cart' : 'Add to Cart'}
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
    </>
  )
}

export default BookDetails

