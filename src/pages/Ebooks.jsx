import { useState } from 'react'
import EbookCard from '../components/EbookCard'
import { BuyModalContent } from './BuyModal'

function Ebooks({ ebooks }) {
  const [selected, setSelected] = useState(null)

  const handleBuy = (book) => {
    setSelected(book)
  }

  const closeModal = () => setSelected(null)

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    zIndex: 1200,
  }

  return (
    <>
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

      {selected && (
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <BuyModalContent book={selected} onClose={closeModal} showClose />
        </div>
      )}
    </>
  )
}

export default Ebooks

