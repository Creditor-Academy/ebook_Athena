import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/auth'

function SuperAdminDashboard() {
  const [user, setUser] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData && userData.role === 'SUPER_ADMIN') {
          setUser(userData)
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Failed to check user:', error)
      }
    }
    checkUser()
  }, [])

  if (!isVisible || !user) {
    return null
  }

  const handleClick = () => {
    // Navigate to superadmin dashboard
    window.location.href = '/admin/dashboard'
  }

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        border: 'none',
        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)'
      }}
      title="Super Admin Dashboard"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default SuperAdminDashboard

