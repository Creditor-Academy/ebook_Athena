import { Link } from 'react-router-dom'
import videoSrc from '../assets/Ebookread.mp4'

function VideoSection() {
  return (
    <section className="video-section">
      <div className="video-copy">
        <p className="eyebrow">Watch & Listen</p>
        <h2>Experience Athena eBooks in motion.</h2>
        <p className="muted">
          See how our reader flows, with smooth page turns, soft lighting, and a calm interface
          designed for long, comfortable sessions.
        </p>
        <div className="video-actions">
          <Link className="primary" to="/video">
            View full experience
          </Link>
          <Link className="secondary" to="/ebooks">
            Browse library
          </Link>
        </div>
      </div>
      <div className="video-card">
        <div className="video-wrapper">
          <video src={videoSrc} autoPlay muted loop controls playsInline preload="metadata" />
        </div>
        <div className="video-meta">
          <p className="muted">Ebook reader preview · 0:30</p>
          <p className="tagline">Adaptive layout · Clean typography · Smooth transitions</p>
        </div>
      </div>
    </section>
  )
}

export default VideoSection

