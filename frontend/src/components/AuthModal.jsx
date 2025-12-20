import { useState } from 'react'
import { signup, login, initiateGoogleAuth, verifySigninCode } from '../services/auth'
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa'

function AuthModal({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showVerification, setShowVerification] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [verificationToken, setVerificationToken] = useState('') // Kept for signup flow compatibility
  const [verificationCode, setVerificationCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSigninVerification, setIsSigninVerification] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      let data
      if (isLogin) {
        data = await login(formData.email, formData.password)
        
        // Check if verification is required
        if (data.requiresVerification) {
          setUserEmail(formData.email)
          setIsSigninVerification(true)
          setShowVerification(true)
          setSuccess(data.message || 'Verification code has been sent to your email!')
        } else {
          // Login successful, proceed normally
        onSuccess(data.user)
        onClose()
        }
      } else {
        // For signup, check if verification is required
        data = await signup(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        )
        
        // Check if verification is required (signup now also uses code verification)
        if (data.requiresVerification) {
          setUserEmail(formData.email)
          setIsSigninVerification(false) // This is signup verification, not signin
          setShowVerification(true)
          setSuccess(data.message || 'Verification code has been sent to your email!')
        } else {
          // Signup successful without verification needed
          onSuccess(data.user)
          onClose()
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      return
    }
    
    setVerifying(true)

    try {
      if (isSigninVerification) {
        // This is signin verification - verify code and complete login
        const data = await verifySigninCode(userEmail, verificationCode.trim())
        setSuccess('Login successful!')
        setTimeout(() => {
            onSuccess(data.user)
            onClose()
        }, 1000)
          } else {
        // This is signup verification - also uses code verification now
        const data = await verifySigninCode(userEmail, verificationCode.trim())
        setSuccess('Email verified successfully!')
        setTimeout(() => {
          onSuccess(data.user)
          onClose()
        }, 1000)
        }
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleGoogleAuth = () => {
    initiateGoogleAuth()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.75rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#f1f5f9',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#64748b',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          {showVerification 
            ? (isSigninVerification ? 'Verify Sign-In Code' : 'Verify Your Email')
            : isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
          {showVerification
            ? (isSigninVerification 
                ? `A verification code has been sent to ${userEmail}. Please enter the 6-digit code to complete your sign-in.`
                : `We've sent a verification code to ${userEmail}. Please enter it below.`)
            : isLogin
            ? 'Welcome back! Please login to continue.'
            : 'Create an account to get started.'}
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.625rem 0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '0.625rem 0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FaCheckCircle />
            {success}
          </div>
        )}

        {showVerification ? (
          <form onSubmit={handleVerifyEmail}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#0f172a',
                }}
              >
                Verification Code
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEnvelope style={{ color: '#64748b', fontSize: '1rem' }} />
                <input
                  type={isSigninVerification ? "tel" : "text"}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value
                    // For signin verification, only allow numbers
                    if (isSigninVerification) {
                      const numericValue = value.replace(/\D/g, '')
                      setVerificationCode(numericValue.slice(0, 6))
                    } else {
                      setVerificationCode(value)
                    }
                    setError('')
                  }}
                  placeholder={isSigninVerification ? "Enter 6-digit verification code" : "Enter verification code from email"}
                  maxLength={isSigninVerification ? 6 : undefined}
                  pattern={isSigninVerification ? "[0-9]{6}" : undefined}
                  autoFocus
                  required
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying || !verificationCode}
              style={{
                width: '100%',
                padding: '0.625rem',
                background: verifying || !verificationCode ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: verifying || !verificationCode ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!verifying && verificationCode) e.currentTarget.style.background = '#1d4ed8'
              }}
              onMouseLeave={(e) => {
                if (!verifying && verificationCode) e.currentTarget.style.background = '#2563eb'
              }}
            >
              {verifying ? 'Verifying...' : (isSigninVerification ? 'Verify & Sign In' : 'Verify Email')}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationCode('')
                  setVerificationToken('')
                  setIsSigninVerification(false)
                  setError('')
                  setSuccess('')
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#0f172a',
                  }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#0f172a',
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#0f172a',
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#0f172a',
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.625rem',
              background: loading ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#1d4ed8'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#2563eb'
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        )}

        <div style={{ position: 'relative', margin: '1rem 0', textAlign: 'center' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: '#e2e8f0',
            }}
          />
          <span
            style={{
              position: 'relative',
              background: '#ffffff',
              padding: '0 0.75rem',
              color: '#64748b',
              fontSize: '0.8rem',
            }}
          >
            OR
          </span>
        </div>

        <button
          onClick={handleGoogleAuth}
          style={{
            width: '100%',
            padding: '0.625rem',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
              fill="#4285F4"
            />
            <path
              d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65455 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.57955C10.3218 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65455 3.57955 9 3.57955Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setFormData({ email: '', password: '', firstName: '', lastName: '' })
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal

