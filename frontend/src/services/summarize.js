const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Generate summary for a chapter/lesson
 * @param {string} bookId - Book ID
 * @param {string} chapterHref - Chapter href identifier
 * @returns {Promise<Object>} Summary data
 */
export async function summarizeChapter(bookId, chapterHref) {
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

  const response = await fetch(`${API_URL}/summarize`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify({ bookId, chapterHref }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate summary')
  }

  return data
}

