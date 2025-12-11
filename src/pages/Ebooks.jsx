import EbookCard from '../components/EbookCard'

function Ebooks({ ebooks }) {
  const handleBuy = (book) => {
    window.alert(`Thanks for your interest in "${book.title}"! Checkout coming soon.`)
  }

  return (
    <section>
      <header className="section-header">
        <h2>Featured eBooks</h2>
        <p>Explore our latest selection crafted for learners and creators.</p>
      </header>
      <div className="card-grid">
        {ebooks.map((book) => (
          <EbookCard key={book.id} book={book} actionLabel="Buy Now" onAction={handleBuy} />
        ))}
      </div>
    </section>
  )
}

export default Ebooks

