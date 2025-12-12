const pageStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 18% 18%, rgba(37,99,235,0.12), transparent 36%), linear-gradient(135deg, #eef4ff 0%, #f9fbff 65%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
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

const bookWrapStyle = {
  position: 'absolute',
  top: '56%',
  left: '55%',
  transform: 'translate(-50%, -50%)',
  width: '400px',
  height: '260px',
  perspective: '1800px',
  filter: 'drop-shadow(0 18px 26px rgba(15,23,42,0.14))',
}

const pageBase = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '50%',
  background: '#ffffff',
  border: '1px solid #d9e6ff',
  boxShadow: '0 10px 22px rgba(15,23,42,0.08)',
  backgroundImage: 'linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
  backgroundSize: '8px 100%',
}

const leftPage = {
  ...pageBase,
  left: 0,
  borderRadius: '6px 0 0 6px',
  transformOrigin: '100% 50%',
  animation: 'pageTurn 4s cubic-bezier(0.45, 0.05, 0.2, 1) infinite',
}

const rightPage = {
  ...pageBase,
  right: 0,
  borderRadius: '0 6px 6px 0',
  transformOrigin: '0% 50%',
  animation: 'pageHold 4s cubic-bezier(0.45, 0.05, 0.2, 1) infinite',
}

const spine = {
  position: 'absolute',
  left: '50%',
  top: 0,
  bottom: 0,
  width: '10px',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(90deg, #c7dbff 0%, #e8f1ff 50%, #c7dbff 100%)',
  boxShadow: 'inset 0 0 8px rgba(15,23,42,0.1)',
}

const btn = {
  padding: '0.75rem 1.2rem',
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
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
        <button
          style={{
            ...btn,
            background: '#1d4ed8',
            color: '#fff',
            boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
            width: 'fit-content',
          }}
        >
          Start reading
        </button>

        <div style={bookWrapStyle}>
          <div style={leftPage} />
          <div style={rightPage} />
          <div style={spine} />
        </div>
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
      <style>{`
        @keyframes pageTurn {
          0%, 55% { transform: rotateY(0deg) rotateX(0deg) translateZ(0); box-shadow: 0 10px 22px rgba(0,0,0,0.12); }
          75% { transform: rotateY(-135deg) rotateX(-2deg) translateZ(4px); box-shadow: -18px 14px 24px rgba(0,0,0,0.18); }
          100% { transform: rotateY(0deg) rotateX(0deg) translateZ(0); box-shadow: 0 10px 22px rgba(0,0,0,0.12); }
        }
        @keyframes pageHold {
          0% { transform: rotateY(0deg); }
          75% { transform: rotateY(-3deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
      <BuyModalContent />
    </div>
  )
}

export default BuyModal
export { BuyModalContent }

