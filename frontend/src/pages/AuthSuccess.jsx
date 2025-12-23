import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { FaCheckCircle } from 'react-icons/fa'

function AuthSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const error = searchParams.get('error')

  useEffect(() => {
    const handleAuth = async () => {
      if (error) {
        // Handle error case
        console.error('OAuth error:', error)
        setTimeout(() => {
          navigate('/')
        }, 3000)
        return
      }

      if (token) {
        // Store token from OAuth callback
        localStorage.setItem('accessToken', token)
        
        // Fetch user data
        try {
          const userData = await getCurrentUser()
          if (userData) {
            // Success - redirect to home after a brief delay
            setTimeout(() => {
              navigate('/')
            }, 2000)
          } else {
            // Failed to get user - redirect to home
            setTimeout(() => {
              navigate('/')
            }, 2000)
          }
        } catch (err) {
          console.error('Failed to get user:', err)
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } else {
        // No token - redirect to home
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    }

    handleAuth()
  }, [token, error, navigate])

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '1.5rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600 }}>
            Authentication Failed
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            There was an error during Google authentication. Please try again.
          </p>
          <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: '#991b1b' }}>
            Redirecting to home page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaCheckCircle style={{ fontSize: '2rem', color: '#10b981' }} />
          </div>
        </div>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>
          Successfully Signed In!
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
          You have been successfully authenticated with Google.
        </p>
        <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
          Redirecting to home page...
        </p>
      </div>
    </div>
  )
}

export default AuthSuccess

