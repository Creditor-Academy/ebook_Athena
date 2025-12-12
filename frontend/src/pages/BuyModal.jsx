// Public asset; respect Vite base path for dev/prod
const digitalVideo = `${import.meta.env.BASE_URL}Digital.mp4`

const pageStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 18% 18%, rgba(37,99,235,0.12), transparent 36%), linear-gradient(135deg, #eef4ff 0%, #f9fbff 65%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2.6rem 1.5rem 3.6rem',
}

const cardStyle = {
  width: 'min(1100px, 100%)',
  background: '#f7faff',
  borderRadius: '20px',
  boxShadow: '0 28px 70px rgba(15,23,42,0.12)',
  display: 'grid',
  gridTemplateColumns: '1.05fr 0.95fr',
  overflow: 'hidden',
  border: '1px solid #d8e3ff',
}

const leftStyle = {
  padding: '1.8rem',
  background: 'linear-gradient(135deg, #e6eeff, #f4f7ff)',
  position: 'relative',
}

const rightStyle = {
  padding: '1.8rem',
  background: '#fdfefe',
  display: 'grid',
  gap: '0.8rem',
  alignContent: 'start',
  borderLeft: '1px solid #e2e9ff',
}

const btn = {
  padding: '0.75rem 1.2rem',
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
}

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8rem',
  alignItems: 'center',
  width: 'min(1200px, 100%)',
  margin: '0 auto',
}

const videoStyle = {
  width: 'min(1100px, 100%)',
  height: '460px',
  borderRadius: '16px',
  boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
  backgroundColor: '#000',
  border: '1px solid #d8e3ff',
  display: 'block',
}

const sampleBook = {
  title: 'The Chamber of Secrets',
  author: 'J.K. Rowling',
  price: '$18.00',
}

function BuyModalContent({ book = sampleBook, onClose, showClose = false }) {
  return (
    <div style={cardStyle}>
      {showClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#eef3ff',
            border: '1px solid #d8e3ff',
            borderRadius: '12px',
            padding: '0.35rem 0.55rem',
            cursor: 'pointer',
            zIndex: 2,
          }}
          aria-label="Close"
        >
          ✕
        </button>
      )}
      <div style={{ ...leftStyle, paddingRight: '2.4rem' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#1d4ed8' }}>Happy reading</p>
        <h2 style={{ margin: '0.2rem 0 0.4rem', fontSize: '2rem', color: '#0f172a' }}>
          {book.title}
        </h2>
        <p style={{ margin: '0.6rem 0', color: '#4b5563', maxWidth: '360px' }}>
          You&apos;ve delved deep into the wizarding world&apos;s secrets. Continue the journey with a
          beautifully crafted digital edition and immersive reader.
        </p>
      </div>
      <div style={rightStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background:
                'url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80) center/cover',
              border: '2px solid #d8e3ff',
            }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Alexander Mark</p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Premium Member</p>
          </div>
        </div>

        <h3 style={{ margin: '0.8rem 0 0.2rem', fontSize: '1.6rem' }}>{book.title}</h3>
        <p style={{ margin: 0, color: '#b02424', fontWeight: 700 }}>
          {book.price ?? '$18.00'}{' '}
          <span style={{ color: '#4b5563', fontWeight: 500 }}>/ book</span>
        </p>
        <p style={{ margin: '0.4rem 0 0.8rem', color: '#4b5563', lineHeight: 1.5 }}>
          Enjoy offline access, synced notes, and smooth page turns with a calm, modern interface
          designed for focus.
        </p>
        <button
          style={{
            ...btn,
            background: '#1d4ed8',
            color: '#fff',
            width: 'fit-content',
            boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
          }}
        >
          Buy now
        </button>
      </div>
    </div>
  )
}

function BuyModal() {
  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        <BuyModalContent />
        <video
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={videoStyle}
          poster=""
        >
          <source src={digitalVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

export default BuyModal
export { BuyModalContent }

