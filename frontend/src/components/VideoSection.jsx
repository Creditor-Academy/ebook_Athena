import { Link } from 'react-router-dom'
import videoSrc from '../assets/Ebookread.mp4'

const styles = `
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.78rem 1.15rem;
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid transparent;
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease,
    background 150ms ease, color 150ms ease;
}

.cta-btn .cta-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.12);
  transition: transform 150ms ease, background 150ms ease;
}

.cta-primary {
  background: linear-gradient(120deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.32);
}

.cta-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.38);
}

.cta-primary:hover .cta-icon {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(2px);
}

.cta-secondary {
  background: #ffffff;
  color: #0f172a;
  border-color: var(--border);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.cta-secondary:hover {
  transform: translateY(-1px);
  border-color: #cbd5f5;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.cta-secondary:hover .cta-icon {
  background: rgba(37, 99, 235, 0.12);
  transform: translateX(2px);
}

.video-section {
  margin-top: 2.8rem;
  padding: 2.2rem 1.8rem 0;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 1.8rem;
  align-items: center;
}

/* LEFT CONTENT */
.video-copy h2 {
  margin: 0.2rem 0 0.5rem;
}

.video-copy .muted {
  max-width: 520px;
}

.video-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

/* VIDEO CARD (unchanged) */
.video-card {
  background: #0f1f45;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 20px 46px rgba(10, 18, 41, 0.32);
  border: 1px solid #1f3b7a;
  display: grid;
  gap: 0.6rem;
}

.video-wrapper {
  background: linear-gradient(180deg, #1b2f63 0%, #0f1f45 100%);
  border-radius: 14px;
  padding: 0.75rem;
  border: 1px solid #254b94;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 12px 28px rgba(4, 12, 30, 0.2);
}

.video-wrapper video {
  width: 100%;
  border-radius: 10px;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000b1f;
}

.video-meta {
  margin-top: 0.8rem;
  color: #e5edff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.video-meta .tagline {
  margin: 0;
  color: #c8d8ff;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .video-section {
    grid-template-columns: 1fr;
  }

  .video-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
`

function VideoSection() {
  return (
    <>
      <style>{styles}</style>

      <section className="video-section">
        <div className="video-copy">
          <p className="eyebrow">Watch & Listen</p>
          <h2>Experience Athena eBooks in motion.</h2>
          <p className="muted">
            See how our reader flows, with smooth page turns, soft lighting, and a calm interface
            designed for long, comfortable sessions.
          </p>

          <div className="video-actions">
            <Link className="cta-btn cta-primary" to="/video">
              View full experience
              <span className="cta-icon" aria-hidden="true">→</span>
            </Link>
            <Link className="cta-btn cta-secondary" to="/ebooks">
              Browse library
              <span className="cta-icon" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="video-card">
          <div className="video-wrapper">
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              controls
              playsInline
              preload="metadata"
            />
          </div>

          <div className="video-meta">
            <p className="muted">Ebook reader preview · 0:30</p>
            <p className="tagline">
              Adaptive layout · Clean typography · Smooth transitions
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default VideoSection
