import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import EbookCard from '../components/EbookCard'
import { FaBook, FaArrowRight, FaCamera, FaEdit, FaCheck, FaTimes, FaUser, FaEnvelope } from 'react-icons/fa'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [purchasedBooks, setPurchasedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', image: '' })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          navigate('/')
          return
        }
        setUser(currentUser)
        setEditForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          image: currentUser.image || '',
        })
        await fetchPurchasedBooks()
      } catch (error) {
        console.error('Error fetching user data:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [navigate])

  const fetchPurchasedBooks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_URL}/purchases/my-books`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPurchasedBooks(data.books || [])
      } else {
        setPurchasedBooks([])
      }
    } catch (error) {
      console.error('Error fetching purchased books:', error)
      setPurchasedBooks([])
    }
  }

  const handleImageUrlChange = (url) => {
    // Validate URL format
    try {
      if (url && url.trim() !== '') {
        new URL(url)
        setEditForm((prev) => ({ ...prev, image: url.trim() }))
        setError('')
      } else {
        setEditForm((prev) => ({ ...prev, image: '' }))
      }
    } catch (e) {
      setError('Please enter a valid URL (e.g., https://example.com/avatar.jpg)')
      setEditForm((prev) => ({ ...prev, image: url }))
    }
  }

  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')
    
    // Validate image URL if provided
    if (editForm.image && editForm.image.trim() !== '') {
      try {
        new URL(editForm.image.trim())
      } catch (e) {
        setError('Please enter a valid image URL')
        return
      }
    }

    setUploading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const updateData = {}
      if (editForm.firstName) updateData.firstName = editForm.firstName
      if (editForm.lastName) updateData.lastName = editForm.lastName
      if (editForm.image && editForm.image.trim() !== '') {
        updateData.image = editForm.image.trim()
      } else if (editForm.image === '') {
        updateData.image = null
      }
      
      const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update profile')
      }

      setUser(data.user)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      image: user.image || '',
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleRead = (book) => {
    navigate(`/reading-room/${book.id}`)
  }

  const handleExploreBooks = () => {
    navigate('/ebooks')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      <section>
        <header className="section-header" style={{ marginBottom: '2rem' }}>
          <h2>Your Profile</h2>
          <p>Welcome back, here is a peek at your library.</p>
        </header>

        {/* User Profile Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: user.image
                    ? 'transparent'
                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '2rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  border: '3px solid #e2e8f0',
                }}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    // Focus on URL input for avatar
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                  title="Add avatar URL"
                >
                  <FaCamera />
                </button>
              )}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          marginBottom: '0.5rem',
                        }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editForm.image}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: error ? '1px solid #dc2626' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {error && (
                      <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.5rem' }}>{error}</div>
                    )}
                  </div>

                  {success && (
                    <div
                      style={{
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    >
                      {success}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={uploading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: uploading ? '#94a3b8' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={uploading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#ffffff',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                        {displayName}
                      </h3>
                      <p className="muted" style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <FaEdit />
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Books Section */}
        {purchasedBooks.length > 0 ? (
          <>
            <div className="subsection-header">
              <h3>My Purchased eBooks</h3>
              <p className="muted">Jump back into your recent reads.</p>
            </div>

            <div className="card-grid">
              {purchasedBooks.map((book) => (
                <EbookCard
                  key={book.id}
                  book={book}
                  actionLabel="Read"
                  onAction={handleRead}
                  variant="read"
                />
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#ffffff',
                fontSize: '2rem',
              }}
            >
              <FaBook />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>
              No Books Yet
            </h3>
            <p
              style={{
                fontSize: '1rem',
                color: '#64748b',
                margin: '0 0 2rem',
                maxWidth: '500px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              You haven't purchased any books yet. Start exploring our collection to find your next great read!
            </p>
            <button
              onClick={handleExploreBooks}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Explore Books
              <FaArrowRight />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Profile
