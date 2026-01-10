const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Generate speech audio from text using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Blob>} Audio blob (MP3 format)
 */
export async function generateSpeech(text) {
  // Get access token from localStorage (if available)
  const token = localStorage.getItem('accessToken')
  
  // Build headers object
  const headers = {
    'Content-Type': 'application/json',
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/tts`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    // Try to parse error as JSON first
    let errorMessage = 'Failed to generate speech'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorMessage
    } catch {
      // If not JSON, use status text
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  // Check if response is actually audio
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('audio')) {
    console.warn('Unexpected content type:', contentType)
    // Still try to get blob, might work
  }

  // Return the audio blob
  const blob = await response.blob()
  console.log('✅ Audio blob created:', blob.size, 'bytes, type:', blob.type)
  
  // Validate blob
  if (blob.size === 0) {
    throw new Error('Received empty audio blob from server')
  }
  
  if (!blob.type || !blob.type.includes('audio')) {
    console.warn('⚠️ Unexpected blob type:', blob.type, 'Expected audio type')
    // Still return it, might work
  }
  
  return blob
}

/**
 * Play audio from a blob
 * @param {Blob} audioBlob - Audio blob to play
 * @returns {Promise<HTMLAudioElement>} Audio element
 */
export function playAudioBlob(audioBlob) {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    // Set audio properties
    audio.volume = 1.0
    audio.preload = 'auto'
    
    // Set up error handling
    audio.onerror = (error) => {
      console.error('Audio error:', error, audio.error)
      URL.revokeObjectURL(audioUrl)
      const errorMsg = audio.error 
        ? `Audio error code: ${audio.error.code} - ${audio.error.message}`
        : 'Failed to load audio'
      reject(new Error(errorMsg))
    }
    
    // Clean up URL when audio ends
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
    }
    
    // When audio metadata is loaded, try to play
    audio.onloadeddata = async () => {
      console.log('📊 Audio metadata loaded, duration:', audio.duration, 'seconds')
    }
    
    // Handle when audio starts loading
    audio.onloadstart = () => {
      console.log('Audio loading started')
    }
    
    // When audio can play through, try to play
    audio.oncanplaythrough = async () => {
      console.log('✅ Audio ready to play through')
      try {
        // Attempt to play the audio
        await audio.play()
        console.log('✅ Audio playback started successfully')
        resolve(audio)
      } catch (playError) {
        console.error('❌ Failed to play audio:', playError)
        // If play fails due to autoplay policy, still resolve
        // The caller can retry or show a message
        if (playError.name === 'NotAllowedError') {
          console.warn('⚠️ Autoplay blocked by browser, user interaction required')
        }
        resolve(audio) // Resolve anyway so caller can handle
      }
    }
    
    // Load the audio
    audio.load()
  })
}

