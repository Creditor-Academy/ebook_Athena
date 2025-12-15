import { useEffect, useMemo, useState } from 'react'

const covers = [
  {
    title: 'The Night Library',
    author: 'Maeve Collins',
    cover: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900&q=80',
  },
  {
    title: 'Six of Crows',
    author: 'Leigh Bardugo',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80',
  },
  {
    title: 'The Smallest Thing',
    author: 'Lisa Manterfield',
    cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80',
  },
  {
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80',
  },
  {
    title: 'Fire & Blood',
    author: 'G.R.R. Martin',
    cover: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&q=80',
  },
  {
    title: 'Silent Pages',
    author: 'Aria Monroe',
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&q=80',
  },
  {
    title: 'Orbiting Words',
    author: 'Caleb Winters',
    cover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=900&q=80',
  },
  {
    title: 'Echoes of Dawn',
    author: 'Rina Solis',
    cover: 'https://images.unsplash.com/photo-1526318472351-bc6c2ea1f77b?w=900&q=80',
  },
  {
    title: 'Ink & Ember',
    author: 'Noah Hart',
    cover: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&q=80&sat=-30',
  },
  {
    title: 'Moonlit Chapters',
    author: 'Sofia Lane',
    cover: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?w=900&q=80',
  },
]

/* ---------------- ANIMATIONS ---------------- */

const animations = `
@keyframes riseFade {
  from { opacity: 0; transform: translateY(50px) scale(0.92); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`

/* ---------------- STYLES ---------------- */

const headerStyle = {
  textAlign: 'center',
  maxWidth: '720px',
  margin: '0 auto 2.6rem',
}

const eyebrowStyle = {
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#4f6df5',
  marginBottom: '0.3rem',
}

const titleStyle = {
  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
  margin: '0.3rem 0 0.5rem',
  color: '#0f172a',
}

const subtitleStyle = {
  color: '#475569',
  lineHeight: 1.6,
}

const stageStyle = {
  position: 'relative',
  marginTop: '1.8rem',
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  overflow: 'visible',
}

const rowStyle = {
  display: 'flex',
  gap: '1.2rem',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
}

const cardBase = {
  width: '180px',
  minHeight: '360px',
  borderRadius: '16px',
  background: '#fff',
  boxShadow: 'none',
  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
  cursor: 'pointer',
}

const coverImg = {
  width: '100%',
  height: '260px',
  objectFit: 'cover',
  borderRadius: '16px 16px 12px 12px',
}

const metaStyle = {
  padding: '0.8rem 0.6rem 1rem',
  textAlign: 'center',
}

const bookTitle = {
  fontWeight: 700,
  fontSize: '0.95rem',
  margin: '0.3rem 0 0.1rem',
  color: '#0f172a',
}

const bookAuthor = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#64748b',
}

const infoBox = {
  width: '320px',
  height: '360px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
  color: '#e2e8f0',
  padding: '1.6rem',
  boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
  display: 'grid',
  alignContent: 'space-between',
  gap: '1rem',
  position: 'relative',
  overflow: 'hidden',
}

const infoBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.75rem',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#cbd5f5',
  fontSize: '0.85rem',
  fontWeight: 600,
}

const infoTitle = {
  fontSize: '1.4rem',
  margin: 0,
  lineHeight: 1.35,
  color: '#fff',
}

const infoAuthor = { margin: 0, color: '#cbd5f5', fontWeight: 600 }

const infoDesc = { margin: '0.5rem 0 0', color: '#cbd5f5', lineHeight: 1.6 }

const infoDots = {
  display: 'flex',
  gap: '0.5rem',
}

const dotBase = isActive => ({
  width: isActive ? '20px' : '10px',
  height: '10px',
  borderRadius: '999px',
  background: isActive ? '#38bdf8' : 'rgba(255,255,255,0.25)',
  transition: 'all 200ms ease',
})

/* ---------------- COMPONENT ---------------- */

function EbookDetails() {
  const rotations = [-18, -9, 0, 9, 18]
  const shifts = [-120, -60, 0, 60, 120]
  const scales = [0.9, 0.96, 1.1, 0.96, 0.9]
  const [activeIdx, setActiveIdx] = useState(0)
  const [slideIdx, setSlideIdx] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  )

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const cardWidth =
    viewportWidth < 520 ? 150 : viewportWidth < 768 ? 160 : viewportWidth < 1024 ? 170 : 180
  const gap = viewportWidth < 520 ? 12 : viewportWidth < 768 ? 14 : 19.2
  const visibleCount =
    viewportWidth < 520 ? 1 : viewportWidth < 768 ? 2 : viewportWidth < 1024 ? 3 : viewportWidth < 1280 ? 4 : 5

  const maxSlide = useMemo(
    () => Math.max(0, covers.length - visibleCount),
    [visibleCount]
  )

  useEffect(() => {
    if (slideIdx > maxSlide) setSlideIdx(maxSlide)
  }, [maxSlide, slideIdx])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % covers.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const moveSlide = delta => {
    setSlideIdx(prev => {
      const next = prev + delta
      if (next < 0) return 0
      if (next > maxSlide) return maxSlide
      return next
    })
  }

  return (
    <section
      style={{
        marginTop: '2.5rem',
        padding: viewportWidth < 640 ? '0 16px' : viewportWidth < 1024 ? '0 32px' : '0 50px',
      }}
    >
      <style>{animations}</style>

      {/* ---------- HEADER ---------- */}
      <div style={headerStyle}>
        <p style={eyebrowStyle}>Audiobooks</p>
        <h2 style={titleStyle}>Stories that come alive in sound</h2>
        <p style={subtitleStyle}>
          Immerse yourself in beautifully narrated stories — perfect for travel,
          work, or moments of calm.
        </p>
      </div>

      {/* ---------- STAGE ---------- */}
      <div
        style={{
          ...stageStyle,
          display: 'grid',
          gridTemplateColumns: viewportWidth < 960 ? '1fr' : '320px 1fr',
          gap: viewportWidth < 640 ? '1.25rem' : '2rem',
          alignItems: 'center',
          justifyItems: 'center',
          justifyContent: 'center',
          maxWidth: '1180px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            ...infoBox,
            width: viewportWidth < 960 ? '100%' : '320px',
            height: viewportWidth < 640 ? 'auto' : '360px',
          }}
        >
          <span style={infoBadge}>Audiobook spotlight</span>
          <div>
            <p style={infoTitle}>{covers[activeIdx].title}</p>
            <p style={infoAuthor}>{covers[activeIdx].author}</p>
            <p style={infoDesc}>
              Hear the story narrated with rich detail and pacing that adapts to every moment. Switch
              devices seamlessly and pick up right where you left off.
            </p>
          </div>
          <div style={infoDots}>
            {covers.map((_, idx) => (
              <span key={_.title} style={dotBase(idx === activeIdx)} />
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              ...rowStyle,
              width: 'max-content',
              transform: `translateX(-${slideIdx * (cardWidth + gap)}px)`,
              transition: 'transform 260ms ease',
            }}
          >
            {covers.map((book, idx) => (
              <div
                key={book.title}
                style={{
                  ...cardBase,
                  width: `${cardWidth}px`,
                  transform: `
                    translateX(${shifts[idx % shifts.length]}px)
                    rotate(${rotations[idx % rotations.length]}deg)
                    scale(${scales[idx % scales.length]})
                  `,
                  animation: `riseFade 600ms ease forwards`,
                  animationDelay: `${(idx % 5) * 120}ms`,
                  zIndex: idx % 5 === 2 ? 6 : 3,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform += ' translateY(-12px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `
                    translateX(${shifts[idx % shifts.length]}px)
                    rotate(${rotations[idx % rotations.length]}deg)
                    scale(${scales[idx % scales.length]})
                  `
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <img src={book.cover} alt={book.title} style={coverImg} />
                <div style={metaStyle}>
                  <p style={bookTitle}>{book.title}</p>
                  <p style={bookAuthor}>{book.author}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              inset: '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              padding: viewportWidth < 640 ? '0 2px' : '0 6px',
            }}
          >
            <button
              onClick={() => moveSlide(-1)}
              disabled={slideIdx === 0}
              style={{
                pointerEvents: 'auto',
                border: 'none',
                background: slideIdx === 0 ? 'rgba(37, 99, 235, 0.35)' : '#2563eb',
                color: '#fff',
                borderRadius: '50%',
                width: viewportWidth < 640 ? '42px' : '48px',
                height: viewportWidth < 640 ? '42px' : '48px',
                display: 'grid',
                placeItems: 'center',
                cursor: slideIdx === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 26px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(6px)',
                fontSize: viewportWidth < 640 ? '1.1rem' : '1.3rem',
                fontWeight: 700,
              }}
            >
              ‹
            </button>
            <button
              onClick={() => moveSlide(1)}
              disabled={slideIdx === maxSlide}
              style={{
                pointerEvents: 'auto',
                border: 'none',
                background: slideIdx === maxSlide ? 'rgba(37, 99, 235, 0.35)' : '#2563eb',
                color: '#fff',
                borderRadius: '50%',
                width: viewportWidth < 640 ? '42px' : '48px',
                height: viewportWidth < 640 ? '42px' : '48px',
                display: 'grid',
                placeItems: 'center',
                cursor: slideIdx === maxSlide ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 26px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(6px)',
                fontSize: viewportWidth < 640 ? '1.1rem' : '1.3rem',
                fontWeight: 700,
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div style={{ textAlign: 'center', marginTop: '2.6rem' }}>
        <h3 style={{ marginBottom: '0.6rem' }}>
          The future of reading is listening
        </h3>
        <button
          style={{
            padding: '0.85rem 1.6rem',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 14px 32px rgba(37, 99, 235, 0.35)',
            cursor: 'pointer',
          }}
        >
          Start Listening
        </button>
      </div>
    </section>
  )
}

export default EbookDetails
