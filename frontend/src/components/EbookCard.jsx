function EbookCard({ book, actionLabel, onAction, variant = 'buy', isBookCard = false }) {
  // Handle both API format (coverImageUrl) and local format (cover)
  const coverImage = book.coverImageUrl || book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'
  // Handle both API format (description/shortDescription) and local format (description)
  const description = book.shortDescription || book.description || ''
  // Format price if it's a number
  const displayPrice = typeof book.price === 'number' ? `$${parseFloat(book.price).toFixed(2)}` : book.price

  return (
    <article className={`card ${isBookCard ? 'book-card' : ''}`}>
      <div style={{ 
        width: '100%', 
        height: isBookCard ? '280px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: isBookCard ? '0.75rem' : '0',
        borderBottom: isBookCard ? '1px solid #e2e8f0' : 'none'
      }}>
        <img 
          src={coverImage} 
          alt={`${book.title} cover`} 
          className="card-cover" 
          style={isBookCard ? {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            maxHeight: '100%'
          } : {}}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover'
          }} 
        />
      </div>
      <div className="card-content" style={isBookCard ? { 
        padding: '1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      } : {}}>
        <div>
          <h3 style={isBookCard ? { 
            fontSize: '0.95rem',
            lineHeight: '1.3',
            marginBottom: '0.4rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          } : {}}>{book.title}</h3>
          <p className="author" style={isBookCard ? { 
            fontSize: '0.85rem',
            marginBottom: '0.5rem'
          } : {}}>By {book.author}</p>
          {!isBookCard && <p className="description">{description}</p>}
        </div>
        <div className="card-footer" style={isBookCard ? {
          marginTop: 'auto',
          paddingTop: '0.75rem'
        } : {}}>
          {variant === 'buy' ? <span className="price">{displayPrice}</span> : <span />}
          <button
            className={variant === 'buy' ? 'secondary' : 'primary ghost'}
            onClick={() => onAction(book)}
            style={isBookCard ? {
              width: '100%',
              padding: '0.6rem',
              fontSize: '0.9rem'
            } : {}}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  )
}

export default EbookCard

