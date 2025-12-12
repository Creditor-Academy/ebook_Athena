import { useNavigate } from 'react-router-dom'
import EbookCard from '../components/EbookCard'

function Profile({ purchasedEbooks }) {
  const navigate = useNavigate()

  const handleRead = (book) => {
    navigate(`/reader/${book.id}`)
  }

  return (
    <section>
      <header className="section-header">
        <h2>Your Profile</h2>
        <p>Welcome back, here is a peek at your library.</p>
      </header>

      <div className="profile-card">
        <div className="avatar" aria-hidden="true">
          A
        </div>
        <div>
          <h3>Alex Morgan</h3>
          <p className="muted">alex.morgan@example.com</p>
        </div>
      </div>

      <div className="subsection-header">
        <h3>My Purchased eBooks</h3>
        <p className="muted">Jump back into your recent reads.</p>
      </div>

      <div className="card-grid">
        {purchasedEbooks.map((book) => (
          <EbookCard
            key={book.id}
            book={book}
            actionLabel="Read"
            onAction={handleRead}
            variant="read"
          />
        ))}
      </div>
    </section>
  )
}

export default Profile

