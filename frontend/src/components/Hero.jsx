import { useNavigate } from 'react-router-dom'
import { ebooks } from '../data/ebooks'

const heroStyles = `
.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(1rem, 4vw, 2.6rem);
  padding: clamp(1.6rem, 4vw, 3.5rem);

  align-items: center; /* ✅ CENTER CONTENT VERTICALLY */

  min-height: 88vh;
  color: #f8fbff;
  background: linear-gradient(120deg, rgba(9, 16, 40, 0.85), rgba(15, 32, 75, 0.65)),
    url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&auto=format&fit=crop')
      center/cover no-repeat;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.hero-content {
  align-self: center;          /* stays vertically centered */
  justify-content: flex-start; /* height = content only */
}


.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 15%, rgba(37, 99, 235, 0.18), transparent 38%),
    radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.16), transparent 36%);
  z-index: 0;
}

/* ---------------- LEFT CONTENT ---------------- */

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 🔹 IMPORTANT */
  align-self: center;
  justify-self: center;

  gap: 1rem;
  padding: clamp(1.2rem, 3vw, 2rem);

  background: rgba(6, 12, 28, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 18px 46px rgba(5, 10, 24, 0.32);
  backdrop-filter: blur(6px);
}

.hero-content h1 {
  font-size: clamp(2.1rem, 4vw, 3rem);
  line-height: 1.2;
  margin: 0.35rem 0 0.75rem;
  letter-spacing: -0.02em;
}

.hero-content .tagline {
  max-width: 620px;
  margin-bottom: 1.4rem;
  color: #e2e8f0;
}

.hero-content .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  color: #cbd5f5;
  font-weight: 700;
}

/* ---------------- SEARCH ---------------- */

.hero-search {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 0.4rem;
}

.hero-search input {
  flex: 1;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
}

.hero-search .primary {
  padding: 0.95rem 1.2rem;
  background: #2563eb;
  color: #fff;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.4);
}

/* ---------------- RIGHT VISUAL ---------------- */

.hero-visual {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* BOX REMOVED – OPEN LAYOUT */
.floating-shelf {
  position: relative;
  width: min(680px, 100%);   /* ⬅ increased from 520px */
  min-height: 460px;        /* ⬅ adds vertical presence */
  perspective: 1600px;      /* ⬅ deeper 3D */
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* MAIN SHELF */
.shelf-surface {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, #4466c9 0%, #2c4da2 100%);
  border-radius: 22px;
  padding: 2rem 1.8rem 2.4rem;   /* ⬅ taller shelf */
  box-shadow:
    0 40px 80px rgba(10, 20, 50, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transform: rotateX(7deg);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.6rem;                  /* ⬅ more spacing */
}

/* BOOKS */
.book-tilt {
  transform-style: preserve-3d;
  transition: transform 0.35s ease;
}

.book-tilt img {
  width: 100%;
  height: 280px;               /* ⬅ increased from 220px */
  object-fit: cover;
  border-radius: 18px;
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.35);
}

.book-tilt.pos-0 {
  transform: translateZ(40px) rotateY(-12deg);
}

.book-tilt.pos-1 {
  transform: translateZ(70px) scale(1.12);
}

.book-tilt.pos-2 {
  transform: translateZ(40px) rotateY(12deg);
}

.book-tilt:hover {
  transform: translateZ(95px) scale(1.08);
}

/* SHELF BASE */
.shelf-base {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: -20px;
  height: 34px;               /* ⬅ thicker */
  background: linear-gradient(180deg, #0b1a3a, #0e2554);
  border-radius: 0 0 24px 24px;
}

.shelf-shadow {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: -56px;
  box-shadow:
    0 40px 70px rgba(0, 0, 0, 0.4);
}

/* ---------------- RESPONSIVE ---------------- */

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-visual {
    order: -1;
    margin-bottom: 2rem;
  }
}

@media (max-width: 640px) {
  .hero-search {
    flex-direction: column;
  }
}
`

function Hero() {
  const navigate = useNavigate()
  const shelfBooks = ebooks.slice(0, 3)

  return (
    <section className="hero">
      <style>{heroStyles}</style>

      <div className="hero-content">
        <p className="eyebrow">New & Trending</p>
        <h1>Discover your next favorite story in a calm blue library.</h1>
        <p className="tagline">
          Explore curated digital shelves, trending authors, and serene reading experiences designed to
          keep you immersed.
        </p>

        <div className="hero-search">
          <input type="text" placeholder="Titles, authors, or topics" />
          <button className="primary" onClick={() => navigate('/ebooks')}>
            Browse eBooks
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="floating-shelf">
          <div className="shelf-surface">
            {shelfBooks.map((book, index) => (
              <div key={book.id} className={`book-tilt pos-${index}`}>
                <img src={book.cover} alt={book.title} />
              </div>
            ))}
          </div>

          <div className="shelf-shadow" />
        </div>
      </div>
    </section>
  )
}

export default Hero
