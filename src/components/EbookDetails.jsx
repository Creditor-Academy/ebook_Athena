const covers = [
  {
    title: 'The Night Library',
    author: 'Maeve Collins',
    cover: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80',
  },
  {
    title: 'Six of Crows',
    author: 'Leigh Bardugo',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  },
  {
    title: 'The Smallest Thing',
    author: 'Lisa Manterfield',
    cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
  },
  {
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  },
  {
    title: 'Fire & Blood',
    author: 'G.R.R. Martin',
    cover: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800&q=80',
  },
]

const fadeIn = `
@keyframes fadeSlide {
  0% { opacity: 0; transform: translateY(26px) rotateY(-6deg); }
  100% { opacity: 1; transform: translateY(0) rotateY(0deg); }
}
`

const sectionStyle = {
  marginTop: '2.4rem',
  padding: '2rem 1.5rem 2.4rem',
  background: 'linear-gradient(135deg, #f9fbff 0%, #f0f4ff 100%)',
  borderRadius: '18px',
  border: '1px solid #e1e9ff',
  boxShadow: '0 14px 38px rgba(37, 99, 235, 0.08)',
  overflow: 'hidden',
}

const stageStyle = {
  position: 'relative',
  padding: '1.2rem 1rem 1.4rem',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e4ebff',
  boxShadow: '0 12px 28px rgba(30, 64, 175, 0.08)',
  overflow: 'hidden',
}

const bgTextStyle = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '4.8rem',
  fontWeight: 700,
  color: 'rgba(37, 99, 235, 0.05)',
  textTransform: 'lowercase',
  pointerEvents: 'none',
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  gap: '1.1rem',
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 1,
}

const bookBaseStyle = {
  width: '150px',
  background: 'linear-gradient(90deg, #fdfdfd 0%, #f5f7ff 40%, #eef2ff 100%)',
  borderRadius: '10px',
  padding: '0.7rem',
  boxShadow:
    '8px 12px 28px rgba(15, 23, 42, 0.18), inset 4px 0 10px rgba(0,0,0,0.08), inset -2px 0 6px rgba(255,255,255,0.6)',
  transformStyle: 'preserve-3d',
  transition: 'transform 200ms ease, box-shadow 200ms ease',
}

const imgStyle = {
  width: '100%',
  height: '190px',
  objectFit: 'cover',
  borderRadius: '8px',
  display: 'block',
  boxShadow: '0 8px 18px rgba(15, 23, 42, 0.18)',
}

const titleStyle = { margin: '0.35rem 0 0.1rem', fontWeight: 700, textAlign: 'center' }
const authorStyle = { margin: 0, textAlign: 'center', color: '#556078', fontSize: '0.9rem' }

const offsets = [
  { translateY: 28, rotate: -10, scale: 0.9 },
  { translateY: 12, rotate: -5, scale: 0.95 },
  { translateY: -10, rotate: 0, scale: 1.08 },
  { translateY: 12, rotate: 5, scale: 0.95 },
  { translateY: 28, rotate: 10, scale: 0.9 },
]

function EbookDetails() {
  return (
    <section className="details-section" style={sectionStyle}>
      <style>{fadeIn}</style>
      <div className="details-top" style={{ textAlign: 'center', marginBottom: '1.3rem' }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Audiobooks
        </p>
        <h2 style={{ margin: '0.25rem 0 0.4rem' }}>Story with audiobooks</h2>
        <p className="muted" style={{ margin: 0 }}>
          Choose the story you want to hear — listen anytime, anywhere.
        </p>
        <button className="primary" style={{ marginTop: '0.8rem', borderRadius: '999px' }}>
          Start listening
        </button>
      </div>

      <div className="details-stage" style={stageStyle}>
        <span className="details-bg-text" aria-hidden="true" style={bgTextStyle}>
          audiobook
        </span>
        <div className="details-row" style={rowStyle}>
          {covers.map((book, idx) => {
            const offset = offsets[idx] ?? { translateY: 0, rotate: 0, scale: 1 }
            const animDelay = `${idx * 80}ms`
            return (
              <div
                key={book.title}
                className="details-card"
                style={{
                  ...bookBaseStyle,
                  transform: `translateY(${offset.translateY}px) rotateY(${offset.rotate}deg) scale(${offset.scale})`,
                  animation: `fadeSlide 420ms ease forwards`,
                  animationDelay: animDelay,
                }}
              >
                <img src={book.cover} alt={`${book.title} cover`} style={imgStyle} />
                <p className="details-title" style={titleStyle}>
                  {book.title}
                </p>
                <p className="details-author muted" style={authorStyle}>
                  {book.author}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="details-footer" style={{ marginTop: '1.3rem', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>The future of book reading is here with audiobooks.</h3>
      </div>
    </section>
  )
}

export default EbookDetails

