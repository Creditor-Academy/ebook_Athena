import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ebooks, purchasedEbooks } from '../data/ebooks'

function ReadingRoom({ samplePdfSrc }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const viewerRef = useRef(null)
  const renditionRef = useRef(null)
  const bookRef = useRef(null)
  const lastHighlightRef = useRef(null)
  const selectionContentRef = useRef(null)
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadError, setLoadError] = useState('')
  const [theme, setTheme] = useState('light')
  const [fontScale, setFontScale] = useState(100)
  const [layoutMode, setLayoutMode] = useState('paginated') // paginated | scrolled
  const fallbackToc = [
    { href: '#athena-rising-1', label: 'Athena Rising — Dawn of Resolve' },
    { href: '#athena-rising-2', label: 'Chapter 2 — The Quiet Library' },
    { href: '#athena-rising-3', label: 'Chapter 3 — Letters in the Cloud' },
    { href: '#athena-rising-4', label: 'Chapter 4 — The Midnight Reader' },
    { href: '#athena-rising-5', label: 'Chapter 5 — Between Shelves and Stars' },
  ]
  const [showSettings, setShowSettings] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [tocItems, setTocItems] = useState(fallbackToc)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState('Type a phrase and hit search.')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summarySelection, setSummarySelection] = useState(fallbackToc[0]?.href ?? '')
  const [summaryText, setSummaryText] = useState('Select a chapter to summarize.')
  // Book flip animation removed
  const [selectionMenu, setSelectionMenu] = useState({
    visible: false,
    left: 0,
    top: 0,
    text: '',
    cfiRange: '',
    placeAbove: true,
  })

  const book = useMemo(
    () => ebooks.find((item) => item.id === id) ?? purchasedEbooks.find((item) => item.id === id),
    [id],
  )

  const title = book?.title ?? 'Your Reading Room'
  const author = book?.author ?? 'Immersive Mode'
  const epubSrc = '/_OceanofPDF.com_Harry_Potter_and_the_socerer_stone_-_J_K_Rowling.epub'
  const pdfSrc = useMemo(
    () => `${samplePdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
    [samplePdfSrc],
  )

  const palette = useMemo(() => {
    if (theme === 'dark') {
      return {
        surface: '#0f172a',
        surfaceSoft: '#0b1224',
        text: '#e5edff',
        subtext: '#cbd5f5',
        border: '#111827',
        badgeBg: '#111827',
        badgeText: '#e5edff',
        shadow: '0 18px 40px rgba(0,0,0,0.45)',
        backdrop: '#0b1224',
      }
    }
    if (theme === 'night') {
      return {
        surface: '#0b0b08',
        surfaceSoft: '#0f0f0a',
        text: '#f8f5d0',
        subtext: '#e7e1a6',
        border: '#1f1f14',
        badgeBg: '#1f1f14',
        badgeText: '#f8f5d0',
        shadow: '0 18px 40px rgba(0,0,0,0.45)',
        backdrop: '#0a0a07',
      }
    }
    return {
      surface: '#ffffff',
      surfaceSoft: '#f5f7fb',
      text: '#0f172a',
      subtext: '#4b5563',
      border: '#d9e2f3',
      badgeBg: '#eef2ff',
      badgeText: '#1f3d8a',
      shadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
      backdrop: '#f6f7fb',
    }
  }, [theme])

  const getLayoutConfig = (mode) => {
    if (mode === 'scrolled') {
      return { flow: 'scrolled-doc', spread: 'none' }
    }
    if (mode === 'book') {
      return { flow: 'paginated', spread: 'always' }
    }
    return { flow: 'paginated', spread: 'none' }
  }

  useEffect(() => {
    const seen = localStorage.getItem('reader-tour-shown')
    if (!seen) {
      setShowTour(true)
      localStorage.setItem('reader-tour-shown', 'true')
    }
  }, [])

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel()
      } catch (_e) {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let rendition
    let bookInstance

    async function loadEpub() {
      try {
        const { default: ePub } = await import('epubjs')
        if (cancelled || !viewerRef.current) return
        bookInstance = ePub(epubSrc)
        bookRef.current = bookInstance
        const layoutCfg = getLayoutConfig(layoutMode)
        rendition = bookInstance.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: layoutCfg.flow,
          spread: layoutCfg.spread,
        })
        renditionRef.current = rendition

        const saved = localStorage.getItem(`epub-cfi-${id}`)
        await rendition.display(saved || undefined)
        applyReaderStyles()

        try {
          const nav = await bookInstance.loaded.navigation
          const navItems = (nav?.toc ?? []).filter((item) => item?.href && item?.label)
          if (navItems.length > 1) {
            setTocItems(navItems)
          } else {
            setTocItems(fallbackToc)
          }
        } catch (_e) {
          // keep existing tocItems (dummy)
        }

        rendition.on('relocated', (location) => {
          if (!bookInstance.locations) return
          const percent = bookInstance.locations.percentageFromCfi(location.start.cfi)
          if (!Number.isNaN(percent)) {
            setProgress(Math.round(percent * 100))
            localStorage.setItem(`epub-cfi-${id}`, location.start.cfi)
          }
        })

        await bookInstance.locations.generate(1200)
        rendition.themes.fontSize(`${fontScale}%`)

        rendition.on('selected', (cfiRange, contents) => {
          try {
            selectionContentRef.current = contents
            const selection = contents?.window?.getSelection()
            if (!selection || selection.isCollapsed) {
              setSelectionMenu((m) => ({ ...m, visible: false }))
              return
            }
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            const hostRect = viewerRef.current?.getBoundingClientRect()
            if (!hostRect) return
            const centerX = rect.left - hostRect.left + rect.width / 2
            const gutter = 12
            const clampedLeft = Math.min(
              Math.max(centerX, gutter),
              Math.max(gutter, hostRect.width - gutter),
            )
            const desiredTop = rect.top - hostRect.top - 2
            const placeAbove = desiredTop > 6
            const top = placeAbove ? desiredTop : rect.bottom - hostRect.top + 4
            setSelectionMenu({
              visible: true,
              left: clampedLeft,
              top: Math.max(8, top),
              placeAbove,
              text: selection.toString(),
              cfiRange,
            })
          } catch (e) {
            setSelectionMenu((m) => ({ ...m, visible: false }))
          }
        })

        rendition.on('selectionCleared', () => {
          selectionContentRef.current = null
          setSelectionMenu({ visible: false, left: 0, top: 0, text: '', cfiRange: '' })
        })
      } catch (err) {
        if (!cancelled) setLoadError('Unable to load the ePub. Showing PDF preview instead.')
      }
    }

    loadEpub()

    return () => {
      cancelled = true
      if (rendition) rendition.destroy()
      if (bookInstance) bookInstance.destroy()
    }
  }, [epubSrc, id, layoutMode])

  const tourSlides = [
    {
      title: 'Reading controls hidden',
      desc: 'Download/print buttons are removed to keep content protected.',
    },
    {
      title: 'Focus mode',
      desc: 'Clean, distraction-free frame so you stay in the story.',
    },
    {
      title: 'Quick actions',
      desc: 'Save to library or jump back to explore more titles anytime.',
    },
  ]

  const nextTour = () => {
    if (tourStep < tourSlides.length - 1) setTourStep((s) => s + 1)
    else setShowTour(false)
  }

  const applyReaderStyles = () => {
    if (!renditionRef.current) return
    const baseBody = {
      margin: 0,
      overflowX: 'hidden',
      maxWidth: '100%',
    }
    const styles =
      theme === 'light'
        ? {
            body: { ...baseBody, background: '#fdfefe', color: '#0f172a' },
            img: { maxWidth: '100%', height: 'auto' },
          }
        : theme === 'dark'
          ? {
              body: { ...baseBody, background: '#0b1224', color: '#e5edff' },
              img: { maxWidth: '100%', height: 'auto' },
            }
          : {
              body: { ...baseBody, background: '#0d0d09', color: '#f8f5d0' },
              img: { maxWidth: '100%', height: 'auto' },
            }
    const themes = renditionRef.current.themes
    themes.register('reader-theme', styles)
    themes.select('reader-theme')
    themes.fontSize(`${fontScale}%`)
  }

  useEffect(() => {
    applyReaderStyles()
  }, [theme, fontScale])

  const changeTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  const increaseFont = () => setFontScale((s) => Math.min(s + 10, 180))
  const decreaseFont = () => setFontScale((s) => Math.max(s - 10, 80))
  const goNext = () => renditionRef.current?.next()
  const goPrev = () => renditionRef.current?.prev()
  const openToc = () => setShowToc(true)
  const closeToc = () => setShowToc(false)
  const openSearch = () => setShowSearch(true)
  const closeSearch = () => {
    setShowSearch(false)
    setSearchStatus('Type a phrase and hit search.')
  }
  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchStatus('Enter something to search.')
      return
    }
    if (!bookRef.current || !renditionRef.current) {
      setSearchStatus('Reader not ready.')
      return
    }
    setSearchStatus(`Searching for “${query}”...`)
    try {
      const results = await bookRef.current.search(query)
      if (results?.length) {
        await renditionRef.current.display(results[0].cfi)
        setSearchStatus(`Found ${results.length} result(s). Jumped to first.`)
      } else {
        setSearchStatus('No matches found.')
      }
    } catch (e) {
      setSearchStatus('Search failed. Please try again.')
    }
  }

  const speakCurrentPage = () => {
    if (!renditionRef.current) return
    try {
      const contents = renditionRef.current.getContents?.() ?? []
      const text = contents
        .map((c) => c?.document?.body?.innerText ?? '')
        .join('\n')
        .trim()
      if (!text) return
      const synth = window.speechSynthesis
      synth.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.onboundary = (e) => {
        if (e.name !== 'word') return
        const charIndex = e.charIndex
        const docContent = renditionRef.current?.getContents?.()[0]
        const doc = docContent?.document
        if (!doc) return

        if (lastHighlightRef.current) {
          const prev = lastHighlightRef.current
          const parent = prev.parentNode
          if (parent) {
            parent.replaceChild(doc.createTextNode(prev.textContent ?? ''), prev)
            parent.normalize()
          }
          lastHighlightRef.current = null
        }

        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
        let node = walker.nextNode()
        let acc = 0
        while (node) {
          const len = node.textContent?.length ?? 0
          if (charIndex < acc + len) {
            const local = charIndex - acc
            const textContent = node.textContent ?? ''
            let start = local
            let end = local
            while (start > 0 && textContent[start - 1] !== ' ') start--
            while (end < textContent.length && textContent[end] !== ' ') end++
            const range = doc.createRange()
            range.setStart(node, start)
            range.setEnd(node, end)
            const mark = doc.createElement('mark')
            mark.style.background = '#fde68a'
            mark.style.color = 'inherit'
            mark.style.padding = '0 2px'
            range.surroundContents(mark)
            lastHighlightRef.current = mark
            break
          }
          acc += len
          node = walker.nextNode()
        }
      }
      utter.onend = () => setIsSpeaking(false)
      utter.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      synth.speak(utter)
    } catch (_e) {
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    try {
      window.speechSynthesis?.cancel()
    } catch (_e) {
      // ignore
    }
    setIsSpeaking(false)
  }

  const summarizeSelection = () => {
    const chapter = tocItems.find((item) => item.href === summarySelection)
    const label = chapter?.label ?? 'Selected chapter'
    setSummaryText(`Summarizing "${label}"...  \n\nKey beats:\n• Atmosphere check and setting recall.\n• Main conflict surfaced.\n• Character intent and pivot point.\n• Cliffhanger for next section.`)
    setShowSummary(true)
  }
  const goToTocItem = async (href) => {
    if (renditionRef.current && href) {
      try {
        await renditionRef.current.display(href)
      } catch (_e) {
        // ignore if dummy href
      }
    }
    closeToc()
  }
  const applyLayoutMode = (mode) => {
    setLayoutMode(mode)
    if (renditionRef.current) {
      const cfg = getLayoutConfig(mode)
      const current = renditionRef.current.currentLocation()
      renditionRef.current.flow(cfg.flow)
      renditionRef.current.spread(cfg.spread)
      if (current?.start?.cfi) {
        renditionRef.current.display(current.start.cfi).then(() => applyReaderStyles())
      } else {
        applyReaderStyles()
      }
    }
  }
  const openSettings = () => setShowSettings(true)
  const closeSettings = () => setShowSettings(false)
  const handleThemeSelect = (val) => setTheme(val)
  const handleFontSlider = (e) => setFontScale(parseInt(e.target.value))
  const clearSelection = () => {
    selectionContentRef.current?.window?.getSelection()?.removeAllRanges()
    setSelectionMenu({ visible: false, left: 0, top: 0, text: '', cfiRange: '' })
  }

  const handleHighlight = () => {
    if (!selectionMenu.cfiRange || !renditionRef.current) return
    try {
      renditionRef.current.annotations.add('highlight', selectionMenu.cfiRange, {}, null, {
        fill: 'rgba(255, 220, 120, 0.6)',
        'fill-opacity': '0.6',
        'mix-blend-mode': 'multiply',
      })
    } catch (e) {
      /* no-op */
    }
    clearSelection()
  }

  const handleCopy = async () => {
    if (!selectionMenu.text) return
    try {
      await navigator.clipboard.writeText(selectionMenu.text)
    } catch (e) {
      /* ignore */
    }
    clearSelection()
  }

  return (
    <section
      style={{
        minHeight: '100vh',
        background: palette.backdrop,
        color: palette.text,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.4rem 1rem',
          background: palette.surface,
          borderBottom: `1px solid ${palette.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 6,
          boxShadow: palette.shadow,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="secondary ghost"
            onClick={() => navigate('/ebooks')}
            aria-label="Back to library"
            style={{ borderRadius: '999px', padding: '0.45rem 0.65rem' }}
          >
            ←
          </button>
          <div>
            <h2 style={{ margin: 0, color: palette.text }}>{title}</h2>
            <p style={{ margin: 0, color: palette.subtext }}>by {author}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Search temporarily disabled; re-enable when needed */}
          <button
            className="secondary ghost"
            aria-label="Table of contents"
            onClick={openToc}
            style={{ borderRadius: '12px', padding: '0.45rem 0.7rem', fontSize: '1rem' }}
          >
            ☰
          </button>
          <button
            className="secondary ghost"
            aria-label="Reader settings"
            onClick={openSettings}
            style={{ borderRadius: '12px', padding: '0.45rem 0.7rem', fontSize: '1rem' }}
          >
            ⚙
          </button>
        </div>
      </div>

      <div style={{ padding: '1.1rem 1.2rem 1.6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <style>{``}</style>
        <div
          style={{
            background: palette.surface,
            borderRadius: '16px',
            padding: '0.6rem',
            boxShadow: palette.shadow,
            border: `1px solid ${palette.border}`,
            position: 'relative',
            overflow: 'hidden',
            minHeight: '80vh',
          }}
        >
          {showTour && (
            <div
              style={{
                position: 'absolute',
                top: '1.2rem',
                left: '1.2rem',
                background: palette.surface,
                color: palette.text,
                padding: '1rem 1.1rem',
                borderRadius: '14px',
                boxShadow: palette.shadow,
                border: `1px solid ${palette.border}`,
                maxWidth: '320px',
                zIndex: 4,
              }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>{tourSlides[tourStep].title}</p>
              <p style={{ margin: '0.25rem 0 0.75rem', color: palette.subtext, lineHeight: 1.5 }}>
                {tourSlides[tourStep].desc}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                <button className="secondary ghost" onClick={() => setShowTour(false)}>
                  Skip
                </button>
                <button className="primary" onClick={nextTour}>
                  {tourStep === tourSlides.length - 1 ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              width: '100%',
              height: 'calc(80vh - 0.5rem)',
              borderRadius: '12px',
              background: palette.surfaceSoft,
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'hidden',
            perspective: 'none',
            transformStyle: 'flat',
            animation: 'none',
            }}
            ref={viewerRef}
          />

          {selectionMenu.visible && (
            <div
              style={{
                position: 'absolute',
                left: selectionMenu.left,
                top: selectionMenu.top,
                transform: `translate(-50%, ${selectionMenu.placeAbove ? '-65%' : '-8%'})`,
                background: palette.surface,
                color: palette.text,
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                boxShadow: palette.shadow,
                padding: '0.3rem 0.4rem',
                display: 'flex',
                gap: '0.35rem',
                alignItems: 'center',
                zIndex: 5,
                pointerEvents: 'auto',
              }}
            >
              <button className="secondary ghost" title="Highlight" onClick={handleHighlight}>
                ★
              </button>
              <button className="secondary ghost" title="Copy" onClick={handleCopy}>
                ⧉
              </button>
              <button className="secondary ghost" title="Clear" onClick={clearSelection}>
                ✕
              </button>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '0.6rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.35rem',
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: '12px',
              padding: '0.35rem 0.45rem',
              boxShadow: palette.shadow,
            }}
          >
            <button className="secondary ghost" onClick={goPrev} aria-label="Previous page">
              ‹
            </button>
            <button className="secondary ghost" onClick={goNext} aria-label="Next page">
              ›
            </button>
          </div>

          {loadError && (
            <div
              style={{
                position: 'absolute',
                inset: '0',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(11, 18, 36, 0.92)',
                padding: '1rem',
                textAlign: 'center',
                color: '#e5edff',
              }}
            >
              <div style={{ maxWidth: '480px', display: 'grid', gap: '0.65rem' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{loadError}</p>
                <iframe
                  title={title}
                  src={pdfSrc}
                  style={{
                    width: '100%',
                    height: '60vh',
                    border: '1px solid #1f2937',
                    borderRadius: '12px',
                    background: '#0b1224',
                  }}
                  frameBorder="0"
                  allowFullScreen={false}
                  sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showToc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 20,
          }}
          role="dialog"
          aria-modal="true"
          onClick={closeToc}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 'min(360px, 90vw)',
              height: '100%',
              background: palette.surface,
              color: palette.text,
              borderLeft: `1px solid ${palette.border}`,
              boxShadow: '-18px 0 28px rgba(0,0,0,0.18)',
              padding: '1rem 1.1rem',
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: '0.8rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Table of contents</h3>
              <button className="secondary ghost" onClick={closeToc} aria-label="Close table of contents">
                ✕
              </button>
            </div>
            <div
              style={{
                overflowY: 'auto',
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                padding: '0.5rem',
                background: palette.surfaceSoft,
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }}>
                {tocItems.map((item) => (
                  <li key={item.href}>
                    <button
                      className="secondary ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '0.5rem 0.65rem',
                      }}
                      onClick={() => goToTocItem(item.href)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 20,
          }}
          role="dialog"
          aria-modal="true"
          onClick={closeSettings}
        >
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: 'min(420px, 95vw)',
              height: '100%',
              background: palette.surface,
              color: palette.text,
              borderLeft: `1px solid ${palette.border}`,
              boxShadow: '-18px 0 28px rgba(0,0,0,0.18)',
              padding: '1rem 1.2rem',
              display: 'grid',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Reader settings</h3>
              <button className="secondary ghost" onClick={closeSettings} aria-label="Close settings">
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>Text size</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 600 }}>A-</span>
                <input
                  type="range"
                  min="80"
                  max="180"
                  step="5"
                  value={fontScale}
                  onChange={handleFontSlider}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 600 }}>A+</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>Themes</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'light', label: 'Light' },
                  { key: 'dark', label: 'Dark' },
                  { key: 'night', label: 'Night' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    className="secondary ghost"
                    onClick={() => handleThemeSelect(opt.key)}
                    style={{
                      padding: '0.55rem 0.9rem',
                      borderColor: theme === opt.key ? '#3b82f6' : palette.border,
                      color: palette.text,
                      background: palette.surfaceSoft,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>Page layout</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'paginated', label: 'Pagination' },
                { key: 'scrolled', label: 'Scroll' },
                { key: 'book', label: 'Book' },
              ].map((opt) => (
                  <button
                    key={opt.key}
                    className="secondary ghost"
                    onClick={() => applyLayoutMode(opt.key)}
                    style={{
                      padding: '0.55rem 0.9rem',
                      borderColor: layoutMode === opt.key ? '#3b82f6' : palette.border,
                      color: palette.text,
                      background: palette.surfaceSoft,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* search UI disabled for now */}

      <div
        style={{
          position: 'fixed',
          right: '1.4rem',
          bottom: '1.4rem',
          zIndex: 15,
          display: 'grid',
          gap: '0.5rem',
          justifyItems: 'end',
        }}
      >
        <button
          className="secondary ghost"
          onClick={isSpeaking ? stopSpeaking : speakCurrentPage}
          aria-label={isSpeaking ? 'Stop reading' : 'Read this page aloud'}
          style={{
            borderRadius: '999px',
            padding: '0.75rem 1rem',
            fontWeight: 700,
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
            width: 'fit-content',
          }}
        >
          {isSpeaking ? '⏸ Stop' : '🔊 Listen'}
        </button>
      </div>

      <div
        style={{
          position: 'fixed',
          left: '1.4rem',
          bottom: '1.4rem',
          zIndex: 15,
        }}
      >
        <button
          className="secondary ghost"
          onClick={() => setShowSummary(true)}
          aria-label="Open summarizer"
          style={{
            borderRadius: '50%',
            padding: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
            width: '56px',
            height: '56px',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.2rem',
          }}
        >
          🧠
        </button>
      </div>

      {showSummary && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 20,
          }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSummary(false)}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '1.4rem',
              left: '1.4rem',
              width: 'min(360px, 90vw)',
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 16px 32px rgba(0,0,0,0.28)',
              borderRadius: '14px',
              padding: '0.9rem',
              display: 'grid',
              gap: '0.6rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Summarizer</h4>
              <button className="secondary ghost" onClick={() => setShowSummary(false)} aria-label="Close summarizer">
                ✕
              </button>
            </div>
            <select
              value={summarySelection}
              onChange={(e) => setSummarySelection(e.target.value)}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '10px',
                border: `1px solid ${palette.border}`,
                background: palette.surfaceSoft,
                color: palette.text,
              }}
            >
              {tocItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
            <button className="primary" onClick={summarizeSelection} style={{ width: 'fit-content' }}>
              Summarize
            </button>
            <div
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: '10px',
                padding: '0.55rem 0.6rem',
                background: palette.surfaceSoft,
                color: palette.text,
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {summaryText}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ReadingRoom


