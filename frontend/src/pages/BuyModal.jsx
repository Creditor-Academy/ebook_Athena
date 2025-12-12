import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

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

const sampleOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.4rem',
  zIndex: 1600,
}

const sampleModal = {
  width: 'min(820px, 100%)',
  background: '#f8fbff',
  borderRadius: '18px',
  border: '1px solid #dbe4ff',
  boxShadow: '0 24px 58px rgba(15, 23, 42, 0.16)',
  padding: '1.2rem 1.2rem 1.4rem',
  position: 'relative',
  display: 'grid',
  gap: '0.9rem',
}

const samplePage = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #e3e9fb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
  minHeight: '320px',
  padding: '1rem',
  backgroundImage: 'linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
  backgroundSize: '10px 100%',
  display: 'grid',
  gap: '0.35rem',
}

function BuyModalContent({ book = sampleBook, onClose, showClose = false }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState('details') // details | payment | options
  const [processing, setProcessing] = useState(false)
  const [showSample, setShowSample] = useState(false)

  const startPayment = () => setStage('payment')

  const handleExplore = () => {
    onClose?.()
    navigate('/ebooks')
  }

  const handleRead = () => {
    onClose?.()
    navigate(`/reading-room/${book.id ?? 'sample'}`)
  }

  const submitPayment = (e) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setStage('options')
    }, 750)
  }

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

        {stage === 'details' && (
          <>
            <h3 style={{ margin: '0.8rem 0 0.2rem', fontSize: '1.6rem' }}>{book.title}</h3>
            <p style={{ margin: 0, color: '#b02424', fontWeight: 700 }}>
              {book.price ?? '$18.00'} <span style={{ color: '#4b5563', fontWeight: 500 }}>/ book</span>
            </p>
            <p style={{ margin: '0.4rem 0 0.8rem', color: '#4b5563', lineHeight: 1.5 }}>
              Enjoy offline access, synced notes, and smooth page turns with a calm, modern interface
              designed for focus.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  ...btn,
                  background: '#1d4ed8',
                  color: '#fff',
                  width: 'fit-content',
                  boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
                }}
                onClick={startPayment}
              >
                Buy now
              </button>
              <button
                style={{
                  ...btn,
                  background: '#eef3ff',
                  color: '#1f3d8a',
                  border: '1px solid #d8e3ff',
                  width: 'fit-content',
                }}
                onClick={() => setShowSample(true)}
              >
                Read sample
              </button>
            </div>
          </>
        )}

        {stage === 'payment' && (
          <form onSubmit={submitPayment} style={{ display: 'grid', gap: '0.7rem' }}>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <label style={{ fontWeight: 600, color: '#111827' }}>Name on card</label>
              <input
                required
                placeholder="Alex Mark"
                style={{ padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #dbe2f3' }}
              />
            </div>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <label style={{ fontWeight: 600, color: '#111827' }}>Card number</label>
              <input
                required
                placeholder="4242 4242 4242 4242"
                style={{ padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #dbe2f3' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div style={{ display: 'grid', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, color: '#111827' }}>Expiry</label>
                <input
                  required
                  placeholder="08 / 28"
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #dbe2f3' }}
                />
              </div>
              <div style={{ display: 'grid', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, color: '#111827' }}>CVC</label>
                <input
                  required
                  placeholder="123"
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid #dbe2f3' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                style={{
                  ...btn,
                  background: '#eef3ff',
                  color: '#1f3d8a',
                  border: '1px solid #d8e3ff',
                }}
                onClick={() => setStage('details')}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  ...btn,
                  background: '#1d4ed8',
                  color: '#fff',
                  boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
                  flex: 1,
                }}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Pay now'}
              </button>
            </div>
          </form>
        )}

        {stage === 'options' && (
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div>
              <p style={{ margin: 0, color: '#16a34a', fontWeight: 700 }}>Payment confirmed</p>
              <p style={{ margin: '0.2rem 0 0', color: '#4b5563' }}>Choose what to do next.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  ...btn,
                  background: '#1d4ed8',
                  color: '#fff',
                  boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
                }}
                onClick={handleRead}
              >
                Read book
              </button>
              <button
                style={{
                  ...btn,
                  background: '#eef3ff',
                  color: '#1f3d8a',
                  border: '1px solid #d8e3ff',
                }}
                onClick={handleExplore}
              >
                Explore more
              </button>
            </div>
          </div>
        )}
      </div>
      {showSample && <BuyModalContent.SampleOverlay onClose={() => setShowSample(false)} />}
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

// Sample preview overlay
BuyModalContent.SampleOverlay = ({ onClose }) => (
  <div style={sampleOverlay} role="dialog" aria-modal="true">
    <div style={sampleModal}>
      <button
        onClick={onClose}
        aria-label="Close sample"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#eef3ff',
          border: '1px solid #d8e3ff',
          borderRadius: '10px',
          padding: '0.35rem 0.5rem',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
      <div>
        <p className="eyebrow" style={{ margin: 0, color: '#1f3d8a' }}>
          Preview
        </p>
        <h3 style={{ margin: '0.15rem 0 0.25rem', color: '#0f172a' }}>Athena Rising</h3>
        <p style={{ margin: 0, color: '#4b5563' }}>First couple of pages — bookmarks disabled.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
        <div style={samplePage}>
          <p style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Page 1</p>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
            The carriage rattled down the cobblestone street as rain whispered on the glass. In the
            distance, the spires of Athena City rose like ink strokes against the morning fog.
          </p>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
            She opened her notebook, eyes tracing the faded map tucked inside. Somewhere in its maze of
            alleys waited a library that was not meant to exist.
          </p>
        </div>
        <div style={samplePage}>
          <p style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Page 2</p>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
            Lanterns flickered as the door creaked open. Rows of books murmured quietly, pages breathing
            in unison. A note lay on the lectern: “Read only what you are ready to remember.”
          </p>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
            She smiled. The adventure was just beginning.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
        <button
          style={{
            ...btn,
            background: '#1d4ed8',
            color: '#fff',
            boxShadow: '0 12px 24px rgba(29, 78, 216, 0.3)',
          }}
          onClick={onClose}
        >
          Continue
        </button>
      </div>
    </div>
  </div>
)


