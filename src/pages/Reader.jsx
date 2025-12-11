import { Link, useParams } from 'react-router-dom'

function Reader({ ebooks, purchasedEbooks, samplePdfSrc }) {
  const { id } = useParams()
  const book = ebooks.find((item) => item.id === id) ?? purchasedEbooks.find((item) => item.id === id)
  const title = book?.title ?? 'eBook Reader'

  return (
    <section className="reader">
      <div className="reader-topbar">
        <h2>{title}</h2>
        <Link className="secondary" to="/profile">
          ← Back to Profile
        </Link>
      </div>
      <div className="reader-frame">
        <iframe title={title} src={samplePdfSrc} frameBorder="0" allowFullScreen />
      </div>
    </section>
  )
}

export default Reader

