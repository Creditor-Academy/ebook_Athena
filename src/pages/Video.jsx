import videoSrc from '../assets/Ebookread.mp4'

function VideoPage() {
  return (
    <section className="video-page">
      <div className="video-hero">
        <p className="eyebrow">Immersive Demo</p>
        <h1>Read, watch, and listen with Athena eBooks.</h1>
        <p className="muted">
          A calm, modern reader built for focus. Play the preview to see smooth page turns and a
          distraction-free interface.
        </p>
      </div>

      <div className="video-stage">
        <div className="video-frame">
          <video src={videoSrc} controls playsInline />
        </div>
        <div className="video-highlights">
          <div className="pill">Smooth transitions</div>
          <div className="pill">Minimal UI</div>
          <div className="pill">Comfortable contrast</div>
          <div className="pill">Built for long reads</div>
        </div>
      </div>
    </section>
  )
}

export default VideoPage

