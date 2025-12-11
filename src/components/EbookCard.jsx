function EbookCard({ book, actionLabel, onAction, variant = 'buy' }) {
  return (
    <article className="card">
      <img src={book.cover} alt={`${book.title} cover`} className="card-cover" />
      <div className="card-content">
        <h3>{book.title}</h3>
        <p className="author">By {book.author}</p>
        <p className="description">{book.description}</p>
        <div className="card-footer">
          {variant === 'buy' ? <span className="price">{book.price}</span> : <span />}
          <button
            className={variant === 'buy' ? 'secondary' : 'primary ghost'}
            onClick={() => onAction(book)}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  )
}

export default EbookCard

