import { useNavigate } from 'react-router-dom'
import { ebooks } from '../data/ebooks'
import EbookDetails from '../components/EbookDetails'

function Home() {
  const navigate = useNavigate()
  const shelfBooks = ebooks.slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">New & Trending</p>
          <h1>Discover your next favorite story in a calm blue library.</h1>
          <p className="tagline">
            Explore curated digital shelves, trending authors, and serene reading experiences
            designed to keep you immersed.
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
                  <img src={book.cover} alt={`${book.title} cover`} />
                </div>
              ))}
            </div>
            <div className="shelf-base" />
            <div className="shelf-shadow" aria-hidden="true" />
          </div>
        </div>
      </section>
      <EbookDetails />
    </>
  )
}

export default Home

