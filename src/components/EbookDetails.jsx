import { ebooks } from '../data/ebooks'

function EbookDetails() {
  const featuredRow = ebooks.slice(0, 5)

  return (
    <section className="details-section">
      <div className="details-top">
        <p className="eyebrow">Audiobooks</p>
        <h2>Story with audiobooks</h2>
        <p className="muted">
          Choose the story you want to hear — listen anytime, anywhere.
        </p>
        <button className="primary">Start listening</button>
      </div>

      <div className="details-stage">
        <span className="details-bg-text" aria-hidden="true">
          audiobook
        </span>
        <div className="details-row">
          {featuredRow.map((book) => (
            <div key={book.id} className="details-card">
              <img src={book.cover} alt={`${book.title} cover`} />
              <p className="details-title">{book.title}</p>
              <p className="details-author muted">{book.author}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="details-footer">
        <h3>The future of book reading is here with audiobooks.</h3>
      </div>
    </section>
  )
}

export default EbookDetails

