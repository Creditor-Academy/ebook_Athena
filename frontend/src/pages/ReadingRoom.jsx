import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ebooks, purchasedEbooks } from '../data/ebooks'

// Inline icons (no external deps)
const IconHighlight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21h6v-2H3v2z" />
    <path d="m6 17 8.5-8.5a1.5 1.5 0 0 1 2.1 0l1.9 1.9a1.5 1.5 0 0 1 0 2.1L10 21H6" />
  </svg>
)

const IconBookmark = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 4h12v16l-6-3-6 3z" />
  </svg>
)

const IconGlobe = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15 15 0 0 0 0 20" />
    <path d="M12 2a15 15 0 0 1 0 20" />
  </svg>
)

const IconCopy = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconClose = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function ReadingRoom({ samplePdfSrc }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const viewerRef = useRef(null)
  const renditionRef = useRef(null)
  const bookRef = useRef(null)
  const lastCfiRef = useRef(null)
  const lastHighlightRef = useRef(null)
  const selectionContentRef = useRef(null)
  const currentUtteranceRef = useRef(null)
  const readingLoopRef = useRef(false)
  const nextSpeakTimeoutRef = useRef(null)
  const isSpeakingRef = useRef(false)
  const selectionMenuRef = useRef(null)
  const highlightPaletteRef = useRef(null)
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadError, setLoadError] = useState('')
  const [theme, setTheme] = useState('light')
  const [fontScale, setFontScale] = useState(100)
  const [layoutMode, setLayoutMode] = useState('book') // paginated | scrolled | book
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
  const [highlights, setHighlights] = useState([])
  const [showHighlights, setShowHighlights] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSpeakChooser, setShowSpeakChooser] = useState(false)
  const [showDefinition, setShowDefinition] = useState(false)
  const [definitionLoading, setDefinitionLoading] = useState(false)
  const [definitionResult, setDefinitionResult] = useState('')
  const [definitionError, setDefinitionError] = useState('')
  const [menuHeight, setMenuHeight] = useState(50)
  // Book flip animation removed
  const [selectionMenu, setSelectionMenu] = useState({
    visible: false,
    left: 0,
    top: 0,
    text: '',
    cfiRange: '',
    placeAbove: true,
  })
  const [highlightPaletteOpen, setHighlightPaletteOpen] = useState(false)

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
    if (selectionMenuRef.current) {
      setMenuHeight(selectionMenuRef.current.offsetHeight || 50)
    }
  }, [selectionMenu.visible, selectionMenu.left, selectionMenu.top])

  useEffect(() => {
    const handleOutside = (e) => {
      if (!selectionMenu.visible) return
      const menuHit = selectionMenuRef.current?.contains(e.target)
      const paletteHit = highlightPaletteRef.current?.contains(e.target)
      if (!menuHit && !paletteHit) {
        clearSelection()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [selectionMenu.visible])

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
            lastCfiRef.current = location.start.cfi
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
            const gutter = 8
            const clampedLeft = Math.min(
              Math.max(centerX, gutter),
              Math.max(gutter, hostRect.width - gutter),
            )
            const desiredTop = rect.top - hostRect.top - 8
            const placeAbove = desiredTop > 12
            const top = placeAbove ? desiredTop : rect.bottom - hostRect.top + 10
            setSelectionMenu({
              visible: true,
              left: clampedLeft,
              top: Math.max(6, top),
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

  const goNext = useCallback(() => {
    renditionRef.current?.next()
  }, [])

  const goPrev = useCallback(() => {
    renditionRef.current?.prev()
  }, [])

  const handleKeyNavigation = useCallback(
    (e) => {
      const active = document.activeElement
      const tag = active?.tagName?.toLowerCase()
      const inInput =
        active?.isContentEditable ||
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        tag === 'button'
      if (inInput) return

      const host = viewerRef.current

      const scrollWithinHost = (delta) => {
        if (!host) return
        host.scrollBy({ top: delta, behavior: 'smooth' })
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'd':
        case 'D': {
          e.preventDefault()
          goNext()
          break
        }
        case 'ArrowLeft':
        case 'PageUp':
        case 'a':
        case 'A': {
          e.preventDefault()
          goPrev()
          break
        }
        case 'ArrowUp':
        case 'w':
        case 'W': {
          e.preventDefault()
          scrollWithinHost(-140)
          break
        }
        case 'ArrowDown':
        case 's':
        case 'S': {
          e.preventDefault()
          scrollWithinHost(140)
          break
        }
        default:
          break
      }
    },
    [goNext, goPrev],
  )

  const waitForRender = useCallback(async () => {
    const rendition = renditionRef.current
    if (!rendition) return
    await new Promise((resolve) => {
      let resolved = false
      const fallback = setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }, 180)
      const handler = () => {
        if (resolved) return
        resolved = true
        clearTimeout(fallback)
        rendition.off?.('rendered', handler)
        resolve()
      }
      rendition.on?.('rendered', handler)
    })
  }, [])

  const syncCurrentDisplay = useCallback(async ({ preferCfi } = {}) => {
    const rendition = renditionRef.current
    if (!rendition) return
    try {
      const storedCfi = (() => {
        try {
          return localStorage.getItem(`epub-cfi-${id}`) || null
        } catch (_e) {
          return null
        }
      })()

      const currentLoc = rendition.currentLocation?.()
      const currentCfi = currentLoc?.start?.cfi
      const targetCfi = preferCfi || currentCfi || storedCfi

      if (targetCfi) {
        lastCfiRef.current = targetCfi
        const res = rendition.display(targetCfi)
        if (res?.then) await res
      }
      await waitForRender()
      viewerRef.current?.scrollTo?.({ top: 0, behavior: 'instant' })
    } catch (_e) {
      /* ignore sync errors */
    }
  }, [waitForRender])

  const goNextAndSync = useCallback(async () => {
    const rendition = renditionRef.current
    if (!rendition) return
    try {
      const res = rendition.next?.()
      if (res?.then) await res
      await waitForRender()
      const currentLoc = rendition.currentLocation?.()
      if (currentLoc?.start?.cfi) {
        lastCfiRef.current = currentLoc.start.cfi
      }
      viewerRef.current?.scrollTo?.({ top: 0, behavior: 'instant' })
    } catch (_e) {
      /* ignore */
    }
  }, [waitForRender])

  useEffect(() => {
    const handler = (e) => handleKeyNavigation(e)

    window.addEventListener('keydown', handler)

    const rendition = renditionRef.current

    // Ensure keyboard works even when focus is inside the EPUB iframe
    const bindIframeKeys = () => {
      if (!rendition) return
      rendition.on?.('keydown', handler)
      rendition.on?.('keyup', handler)
      rendition.on?.('keypress', handler)
      const contents = rendition.getContents?.() || []
      contents.forEach((c) => {
        c.document?.addEventListener('keydown', handler)
      })
      rendition.on?.('rendered', () => {
        const innerContents = rendition.getContents?.() || []
        innerContents.forEach((c) => {
          c.document?.addEventListener('keydown', handler)
        })
      })
    }

    bindIframeKeys()

    return () => {
      window.removeEventListener('keydown', handler)
      if (rendition) {
        rendition.off?.('keydown', handler)
        rendition.off?.('keyup', handler)
        rendition.off?.('keypress', handler)
        const contents = rendition.getContents?.() || []
        contents.forEach((c) => {
          c.document?.removeEventListener('keydown', handler)
        })
      }
    }
  }, [handleKeyNavigation])

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

  const speakCurrentPage = async (opts = { fromChain: false, attempt: 0 }) => {
    // If already speaking and this is a user click, stop instead of stacking
    if (isSpeakingRef.current && !opts.fromChain) {
      stopSpeaking()
      return
    }

    if (!renditionRef.current) {
      console.warn('Rendition not available')
      return
    }

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }

    readingLoopRef.current = true

    const clearNextTimeout = () => {
      if (nextSpeakTimeoutRef.current) {
        clearTimeout(nextSpeakTimeoutRef.current)
        nextSpeakTimeoutRef.current = null
      }
    }

    clearNextTimeout()

    // Keep the visual location in sync with the audio start
    await syncCurrentDisplay({ preferCfi: lastCfiRef.current })

    const extractPageText = () => {
      const contents = renditionRef.current?.getContents?.()
      let text = ''

      // Try to extract text from EPUB contents first
      if (contents && Array.isArray(contents) && contents.length > 0) {
        for (const content of contents) {
          if (content?.document) {
            try {
              const doc = content.document
              // Try multiple methods to get text safely
              const docText = doc.body?.innerText || doc.body?.textContent || doc.innerText || doc.textContent || ''
              if (docText) {
                text += docText + '\n'
              }
            } catch (err) {
              // Skip if we can't access this document (might be sandboxed)
              console.warn('Could not access document content:', err)
            }
          }
        }
      }

      text = text.trim()

      // Fallback: try to get text from the viewer element directly
      if (!text) {
        const viewer = viewerRef.current
        if (viewer) {
          try {
            text = viewer.innerText || viewer.textContent || ''
          } catch (err) {
            console.warn('Could not access viewer text:', err)
          }
        }
      }

      return text.trim()
    }

    const text = extractPageText()

    if (!text) {
      // Move forward to find readable content (max 2 attempts)
      if (opts.attempt < 2) {
        try {
          await renditionRef.current?.next?.()
          const nextLoc = renditionRef.current?.currentLocation?.()
          if (nextLoc?.start?.cfi) {
            lastCfiRef.current = nextLoc.start.cfi
          }
        } catch (_e) {
          // ignore navigation errors
        }
        return speakCurrentPage({ fromChain: true, attempt: opts.attempt + 1 })
      }
      alert('No text content found on this page.')
      readingLoopRef.current = false
      return
    }

    const synth = window.speechSynthesis

    // Cancel any ongoing speech and wait a bit for it to clear
    if (synth.speaking) {
      synth.cancel()
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!synth.speaking) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 50)
      })
    }

    const utter = new SpeechSynthesisUtterance(text)
    currentUtteranceRef.current = utter

    // Set voice properties for better experience
    utter.rate = 1.0
    utter.pitch = 1.0
    utter.volume = 1.0

    // Optional: Try to highlight words (only if we can safely access the DOM)
    utter.onboundary = (e) => {
      if (e.name !== 'word') return
      try {
        // Only try highlighting if we can safely access the document
        const docContent = renditionRef.current?.getContents?.()?.[0]
        if (!docContent?.document) return

        const doc = docContent.document

        // Check if we can safely access the document
        if (!doc.body || !doc.createRange) return

        const charIndex = e.charIndex

        // Clear previous highlight
        if (lastHighlightRef.current) {
          try {
            const prev = lastHighlightRef.current
            const parent = prev.parentNode
            if (parent && parent.replaceChild) {
              parent.replaceChild(doc.createTextNode(prev.textContent ?? ''), prev)
              parent.normalize()
            }
            lastHighlightRef.current = null
          } catch (err) {
            // Ignore errors when clearing highlight
          }
        }

        // Try to highlight current word
        try {
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

              try {
                const range = doc.createRange()
                range.setStart(node, start)
                range.setEnd(node, end)
                const mark = doc.createElement('mark')
                mark.style.background = '#fde68a'
                mark.style.color = 'inherit'
                mark.style.padding = '0 2px'
                range.surroundContents(mark)
                lastHighlightRef.current = mark
              } catch (rangeErr) {
                // Ignore range errors (might be in sandboxed iframe)
              }
              break
            }
            acc += len
            node = walker.nextNode()
          }
        } catch (walkerErr) {
          // Ignore walker errors
        }
      } catch (err) {
        // Silently ignore highlighting errors (common in sandboxed contexts)
      }
    }

    const handleEndOrError = (withError = false, errorObj) => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      currentUtteranceRef.current = null

      // Clear highlight when done
      if (lastHighlightRef.current) {
        try {
          const prev = lastHighlightRef.current
          const parent = prev.parentNode
          if (parent && parent.replaceChild) {
            parent.replaceChild(prev.ownerDocument.createTextNode(prev.textContent ?? ''), prev)
            parent.normalize()
          }
          lastHighlightRef.current = null
        } catch (_err) {
          // Ignore cleanup errors
        }
      }

      if (!readingLoopRef.current) return

      // Automatically move to the next page and keep reading
      nextSpeakTimeoutRef.current = setTimeout(async () => {
        await goNextAndSync()
        // Only continue if user didn't stop in the meantime
        if (readingLoopRef.current) {
          speakCurrentPage({ fromChain: true, attempt: 0 })
        }
      }, withError ? 350 : 120)

      if (withError && errorObj && errorObj.error !== 'interrupted' && errorObj.error !== 'canceled') {
        console.error('Speech synthesis error:', errorObj.error, errorObj)
      }
    }

    utter.onend = () => handleEndOrError(false)

    utter.onerror = (e) => {
      // "interrupted" is not really an error - it just means speech was stopped
      if (e.error === 'interrupted') {
        readingLoopRef.current = false
        return
      }

      handleEndOrError(true, e)
    }

    isSpeakingRef.current = true
    setIsSpeaking(true)
    synth.speak(utter)
  }

  const startSpeakFromBeginning = async () => {
    setShowSpeakChooser(false)
    try {
      stopSpeaking()
      readingLoopRef.current = true
      nextSpeakTimeoutRef.current && clearTimeout(nextSpeakTimeoutRef.current)
      nextSpeakTimeoutRef.current = null
      try {
        localStorage.removeItem(`epub-cfi-${id}`)
      } catch (_e) {
        /* ignore */
      }
      lastCfiRef.current = null
      const rendition = renditionRef.current
      if (rendition) {
        const res = rendition.display()
        if (res?.then) await res
        await waitForRender()
      }
    } catch (_e) {
      /* ignore */
    }
    speakCurrentPage({ fromChain: true, attempt: 0 })
  }

  const startSpeakFromCurrent = () => {
    setShowSpeakChooser(false)
    speakCurrentPage({ fromChain: false, attempt: 0 })
  }

  const stopSpeaking = () => {
    try {
      readingLoopRef.current = false
      if (nextSpeakTimeoutRef.current) {
        clearTimeout(nextSpeakTimeoutRef.current)
        nextSpeakTimeoutRef.current = null
      }
      const synth = window.speechSynthesis
      if (synth) {
        synth.cancel()
      }
      isSpeakingRef.current = false
      setIsSpeaking(false)
      currentUtteranceRef.current = null
      
      // Clear highlight when stopping
      if (lastHighlightRef.current) {
        try {
          const prev = lastHighlightRef.current
          const parent = prev.parentNode
          if (parent && parent.replaceChild && prev.ownerDocument) {
            parent.replaceChild(prev.ownerDocument.createTextNode(prev.textContent ?? ''), prev)
            parent.normalize()
          }
          lastHighlightRef.current = null
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    } catch (_e) {
      // ignore
    }
  }

  const summarizeSelection = () => {
    const chapter = tocItems.find((item) => item.href === summarySelection)
    const label = chapter?.label ?? 'Selected chapter'
    setSummaryText(`Summarizing "${label}"...  \n\nKey beats:\n• Atmosphere check and setting recall.\n• Main conflict surfaced.\n• Character intent and pivot point.\n• Cliffhanger for next section.`)
    setShowSummary(true)
  }
  const handleWebSearch = () => {
    const query = selectionMenu.text?.trim()
    if (!query) return
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    window.open(url, '_blank', 'noopener')
    clearSelection()
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
    setSelectionMenu({ visible: false, left: 0, top: 0, text: '', cfiRange: '', placeAbove: true })
    setHighlightPaletteOpen(false)
  }

  const handleHighlight = (color = 'rgba(255, 220, 120, 0.6)') => {
    if (!selectionMenu.cfiRange || !renditionRef.current) return
    try {
      const highlightId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      renditionRef.current.annotations.add(
        'highlight',
        selectionMenu.cfiRange,
        { id: highlightId },
        null,
        null,
        {
          fill: color,
          'fill-opacity': '0.55',
          'mix-blend-mode': 'multiply',
        },
      )
      setHighlights((prev) => [
        {
          id: highlightId,
          cfiRange: selectionMenu.cfiRange,
          text: selectionMenu.text,
          color,
        },
        ...prev,
      ])
    } catch (e) {
      /* no-op */
    }
    setHighlightPaletteOpen(false)
    clearSelection()
  }

  const handleBookmark = () => {
    if (!selectionMenu.cfiRange || !renditionRef.current) return
    try {
      const bookmarkId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      renditionRef.current.annotations.add('bookmark', selectionMenu.cfiRange)
      setBookmarks((prev) => [
        {
          id: bookmarkId,
          cfiRange: selectionMenu.cfiRange,
          text: selectionMenu.text,
        },
        ...prev,
      ])
    } catch (_e) {
      /* ignore */
    }
    clearSelection()
  }

  const removeHighlight = (id, cfiRange) => {
    try {
      renditionRef.current?.annotations?.remove(cfiRange, 'highlight')
    } catch (_e) {
      /* ignore */
    }
    setHighlights((prev) => prev.filter((h) => h.id !== id))
  }

  const handleCopySelection = async () => {
    const text = selectionMenu.text?.trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch (_e) {
      // ignore clipboard errors
    }
    clearSelection()
  }

  const removeBookmark = (id, cfiRange) => {
    try {
      renditionRef.current?.annotations?.remove(cfiRange, 'bookmark')
    } catch (_e) {
      /* ignore */
    }
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const defineSelection = async () => {
    const raw = selectionMenu.text?.trim()
    if (!raw) return
    const term = raw.split(/\s+/)[0].replace(/[^\w'-]/g, '')
    if (!term) return
    setShowDefinition(true)
    setDefinitionLoading(true)
    setDefinitionResult('')
    setDefinitionError('')
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`)
      if (!res.ok) {
        throw new Error('No definition found.')
      }
      const data = await res.json()
      const first = data?.[0]
      const defs =
        first?.meanings?.flatMap((m) =>
          (m?.definitions || []).map((d) => `• ${d.definition}${d.example ? `\n   e.g., ${d.example}` : ''}`),
        ) || []
      if (!defs.length) {
        throw new Error('No definition found.')
      }
      setDefinitionResult(`${term}\n\n${defs.slice(0, 5).join('\n')}`)
    } catch (err) {
      setDefinitionError(err?.message || 'Unable to fetch definition.')
    } finally {
      setDefinitionLoading(false)
    }
  }

  const flashBookmark = async (cfiRange) => {
    if (!renditionRef.current) return
    try {
      await renditionRef.current.display(cfiRange)
      const flashId = `flash-${Date.now()}`
      renditionRef.current.annotations.add(
        'highlight',
        cfiRange,
        { id: flashId },
        null,
        null,
        {
          fill: 'rgba(59,130,246,0.35)',
          'fill-opacity': '0.8',
          'mix-blend-mode': 'multiply',
        },
      )
      setTimeout(() => {
        try {
          renditionRef.current?.annotations?.remove(cfiRange, 'highlight')
        } catch (_e) {
          /* ignore */
        }
      }, 850)
    } catch (_e) {
      /* ignore */
    }
  }

  const goToBookmark = async (b) => {
    setShowBookmarks(false)
    await flashBookmark(b.cfiRange)
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
          <button
            className="secondary ghost"
            aria-label="Highlights"
            onClick={() => setShowHighlights(true)}
            style={{ borderRadius: '12px', padding: '0.45rem 0.7rem', fontSize: '1rem' }}
          >
            ★
          </button>
          <button
            className="secondary ghost"
            aria-label="Bookmarks"
            onClick={() => setShowBookmarks(true)}
            style={{ borderRadius: '12px', padding: '0.4rem 0.65rem', display: 'grid', placeItems: 'center' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 4h12v16l-6-3-6 3z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '0',
          maxWidth: '100%',
          margin: '0',
        }}
      >
        <style>{`
          .epub-highlight {
            stroke: rgba(0,0,0,0.08);
            stroke-width: 0.5px;
            rx: 3px;
          }
        `}</style>
        <div
          style={{
            background: 'transparent',
            borderRadius: 0,
            padding: 0,
            boxShadow: 'none',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 'calc(100vh - 72px)',
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
              height: 'calc(100vh - 72px)',
              borderRadius: 0,
              background: palette.surface,
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
              ref={selectionMenuRef}
              style={{
                position: 'absolute',
                left: selectionMenu.left,
                top: selectionMenu.top,
                transform: `translate(-50%, ${selectionMenu.placeAbove ? '-10%' : '5%'})`,
                background: 'rgba(255,255,255,0.96)',
                color: palette.text,
                border: `1px solid rgba(15,23,42,0.16)`,
                borderRadius: '16px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                padding: '0.25rem 0.28rem',
                display: 'flex',
                gap: '0.18rem',
                alignItems: 'center',
                zIndex: 5,
                pointerEvents: 'auto',
              }}
            >
              <button
                className="secondary ghost"
                title="Highlight"
                onClick={() => setHighlightPaletteOpen((v) => !v)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '1.05rem',
                }}
              >
                <IconHighlight />
              </button>
              <button
                className="secondary ghost"
                title="Bookmark"
                onClick={handleBookmark}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '1.05rem',
                }}
              >
                <IconBookmark />
              </button>
              <button
                className="secondary ghost"
                title="Search web"
                onClick={handleWebSearch}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '1.05rem',
                }}
              >
                <IconGlobe />
              </button>
              <button
                className="secondary ghost"
                title="Copy"
                onClick={handleCopySelection}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '1.05rem',
                }}
              >
                <IconCopy />
              </button>
              <button
                className="secondary ghost"
                title="Define"
                onClick={defineSelection}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                ?
              </button>
              <button
                className="secondary ghost"
                title="Close"
                onClick={clearSelection}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: 'rgba(15,23,42,0.02)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0',
                  fontSize: '1.05rem',
                }}
              >
                <IconClose />
              </button>
            </div>
          )}

          {highlightPaletteOpen && selectionMenu.visible && (
            <div
              ref={highlightPaletteRef}
              style={{
                position: 'absolute',
                left: selectionMenu.left,
                top: selectionMenu.top + (selectionMenu.placeAbove ? -34 : 34),
                transform: 'translate(-50%, -30%)',
                display: 'flex',
                gap: '0.2rem',
                padding: '0.28rem',
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                boxShadow: palette.shadow,
                zIndex: 6,
                pointerEvents: 'auto',
              }}
            >
              {[
                '#fef08a',
                '#a7f3d0',
                '#fcd34d',
                '#f9a8d4',
                '#9ca3af',
                '#93c5fd',
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => handleHighlight(c)}
                  aria-label={`Highlight ${c}`}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: c,
                    cursor: 'pointer',
                  }}
                />
              ))}
              <button
                className="secondary ghost"
                onClick={() => setHighlightPaletteOpen(false)}
                aria-label="Close palette"
                style={{ borderRadius: '8px', padding: '0.2rem 0.35rem' }}
              >
                ✕
              </button>
            </div>
          )}

          <button
            className="secondary ghost"
            onClick={goPrev}
            aria-label="Previous page"
            style={{
              position: 'absolute',
              left: '0.35rem',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '999px',
              padding: '0.55rem 0.72rem',
              background: theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.3)',
              color: theme === 'light' ? '#111827' : '#ffffff',
              border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.55)'}`,
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              opacity: 0.5,
              transition: 'opacity 120ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
          >
            ‹
          </button>
          <button
            className="secondary ghost"
            onClick={goNext}
            aria-label="Next page"
            style={{
              position: 'absolute',
              right: '0.35rem',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '999px',
              padding: '0.55rem 0.72rem',
              background: theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.3)',
              color: theme === 'light' ? '#111827' : '#ffffff',
              border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.55)'}`,
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              opacity: 0.5,
              transition: 'opacity 120ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
          >
            ›
          </button>

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
                    height: 'calc(100vh - 140px)',
                    border: 'none',
                    borderRadius: 0,
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

      {showHighlights && (
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
          onClick={() => setShowHighlights(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '6%',
              right: '6%',
              width: 'min(420px, 92vw)',
              maxHeight: '88vh',
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 18px 38px rgba(0,0,0,0.22)',
              padding: '1rem 1.1rem',
              display: 'grid',
              gridTemplateRows: 'auto auto 1fr',
              gap: '0.75rem',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Highlights</h3>
              <button className="secondary ghost" onClick={() => setShowHighlights(false)} aria-label="Close highlights">
                ✕
              </button>
            </div>
            <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>
              Tap a highlight to jump or remove it.
            </p>
            <div
              style={{
                overflowY: 'auto',
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                padding: '0.65rem',
                background: palette.surfaceSoft,
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              {highlights.length === 0 ? (
                <p style={{ margin: 0, color: palette.subtext }}>No highlights yet.</p>
              ) : (
                highlights.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.45rem 0.55rem',
                      borderRadius: '10px',
                      background: palette.surface,
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '999px',
                        background: h.color || '#fef08a',
                        border: '1px solid rgba(0,0,0,0.12)',
                        display: 'inline-block',
                      }}
                    />
                    <button
                      className="secondary ghost"
                      style={{ textAlign: 'left', whiteSpace: 'normal', padding: 0 }}
                      onClick={() => renditionRef.current?.display?.(h.cfiRange)}
                    >
                      {h.text || 'Jump to highlight'}
                    </button>
                    <button
                      className="secondary ghost"
                      onClick={() => removeHighlight(h.id, h.cfiRange)}
                      aria-label="Remove highlight"
                      style={{ borderRadius: '8px', padding: '0.3rem 0.55rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showBookmarks && (
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
          onClick={() => setShowBookmarks(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '6%',
              width: 'min(420px, 92vw)',
              maxHeight: '86vh',
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 18px 38px rgba(0,0,0,0.22)',
              padding: '1rem 1.1rem',
              display: 'grid',
              gridTemplateRows: 'auto auto 1fr',
              gap: '0.75rem',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Bookmarks</h3>
              <button className="secondary ghost" onClick={() => setShowBookmarks(false)} aria-label="Close bookmarks">
                ✕
              </button>
            </div>
            <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>
              Tap a bookmark to jump or remove it.
            </p>
            <div
              style={{
                overflowY: 'auto',
                border: `1px solid ${palette.border}`,
                borderRadius: '12px',
                padding: '0.65rem',
                background: palette.surfaceSoft,
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              {bookmarks.length === 0 ? (
                <p style={{ margin: 0, color: palette.subtext }}>No bookmarks yet.</p>
              ) : (
                bookmarks.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.45rem 0.55rem',
                      borderRadius: '10px',
                      background: palette.surface,
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <button
                      className="secondary ghost"
                      style={{ textAlign: 'left', whiteSpace: 'normal', padding: 0 }}
                      onClick={() => goToBookmark(b)}
                    >
                      {b.text || 'Jump to bookmark'}
                    </button>
                    <button
                      className="secondary ghost"
                      onClick={() => removeBookmark(b.id, b.cfiRange)}
                      aria-label="Remove bookmark"
                      style={{ borderRadius: '8px', padding: '0.3rem 0.55rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
          right: '0.3rem',
          bottom: '0.85rem',
          zIndex: 8,
          display: 'grid',
          gap: '0.4rem',
          pointerEvents: 'none',
          opacity: 0.8,
        }}
      >
        <button
          className="secondary ghost"
          onClick={() => setShowSummary(true)}
          aria-label="Open summarizer"
          style={{
            pointerEvents: 'auto',
            borderRadius: '50%',
            padding: '0.6rem',
            width: '46px',
            height: '46px',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.1rem',
            background: theme === 'light' ? 'rgba(15,23,42,0.14)' : 'rgba(15,23,42,0.08)',
            border: `1px solid ${theme === 'light' ? 'rgba(31,41,55,0.35)' : 'rgba(255,255,255,0.25)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.18)',
            transition: 'opacity 120ms ease, transform 120ms ease',
            opacity: 0.85,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.85'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          🧠
        </button>
        <button
          className="secondary ghost"
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking()
            } else {
              setShowSpeakChooser(true)
            }
          }}
          aria-label={isSpeaking ? 'Stop reading' : 'Read aloud options'}
          style={{
            pointerEvents: 'auto',
            borderRadius: '50%',
            padding: '0.6rem',
            width: '46px',
            height: '46px',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.1rem',
            background: theme === 'light' ? 'rgba(15,23,42,0.14)' : 'rgba(15,23,42,0.08)',
            border: `1px solid ${theme === 'light' ? 'rgba(31,41,55,0.35)' : 'rgba(255,255,255,0.25)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.18)',
            transition: 'opacity 120ms ease, transform 120ms ease',
            opacity: 0.85,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.85'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {isSpeaking ? '⏸' : '🔊'}
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

      {showSpeakChooser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 22,
          }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSpeakChooser(false)}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '1.4rem',
              right: '1.4rem',
              width: 'min(340px, 90vw)',
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 16px 32px rgba(0,0,0,0.28)',
              borderRadius: '14px',
              padding: '0.9rem',
              display: 'grid',
              gap: '0.65rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Read aloud</h4>
              <button className="secondary ghost" onClick={() => setShowSpeakChooser(false)} aria-label="Close read aloud">
                ✕
              </button>
            </div>
            <p style={{ margin: 0, color: palette.subtext, fontSize: '0.95rem' }}>
              Choose where to start reading.
            </p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <button className="primary" onClick={startSpeakFromBeginning}>
                Start from beginning
              </button>
              <button className="secondary" onClick={startSpeakFromCurrent}>
                Current page
              </button>
            </div>
          </div>
        </div>
      )}

      {showDefinition && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 23,
          }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDefinition(false)}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '1.4rem',
              right: '1.4rem',
              width: 'min(420px, 92vw)',
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 16px 32px rgba(0,0,0,0.28)',
              borderRadius: '14px',
              padding: '0.9rem',
              display: 'grid',
              gap: '0.65rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Dictionary</h4>
              <button className="secondary ghost" onClick={() => setShowDefinition(false)} aria-label="Close dictionary">
                ✕
              </button>
            </div>
            <div
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: '10px',
                padding: '0.55rem 0.65rem',
                background: palette.surfaceSoft,
                color: palette.text,
                minHeight: '90px',
                maxHeight: '38vh',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {definitionLoading
                ? 'Looking up...'
                : definitionError
                  ? definitionError
                  : definitionResult || 'No definition yet.'}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ReadingRoom


