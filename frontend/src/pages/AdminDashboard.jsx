import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalBooks: 0,
    totalPurchases: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (!userData || userData.role !== 'SUPER_ADMIN') {
          navigate('/')
          return
        }
        setUser(userData)
        fetchAnalytics()
      } catch (error) {
        console.error('Auth check failed:', error)
        navigate('/')
      }
    }
    checkAuth()
  }, [navigate])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Fetch user statistics
      const usersResponse = await fetch(`${API_URL}/users/stats`, {
        credentials: 'include',
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setStats(usersData)
      } else {
        // If stats endpoint doesn't exist yet, use default values
        console.warn('Stats endpoint not available, using default values')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: '✅',
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      title: 'New Users Today',
      value: stats.newUsersToday,
      icon: '🆕',
      color: '#ea580c',
      bgColor: '#ffedd5',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: '📚',
      color: '#9333ea',
      bgColor: '#f3e8ff',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: '🛒',
      color: '#0891b2',
      bgColor: '#cffafe',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: '💰',
      color: '#ca8a04',
      bgColor: '#fef9c3',
    },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {statCards.map((card, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: card.color }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Analysis Section */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Analytics & Insights
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* User Growth Analysis */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #cbd5e1',
                }}
              >
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  User Growth
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Users</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      {stats.totalUsers}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>New Today</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>
                      {stats.newUsersToday}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Active (30 days)</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ea580c' }}>
                      {stats.activeUsers}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  Growth Chart
                </div>
              </div>

              {/* User Distribution */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #bbf7d0',
                }}
              >
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  User Distribution
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Regular Users</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>
                      {stats.totalUsers - stats.totalAdmins}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Admins</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9333ea' }}>
                      {stats.totalAdmins}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${((stats.totalUsers - stats.totalAdmins) / stats.totalUsers) * 100}%`,
                        background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    border: '1px dashed #bbf7d0',
                  }}
                >
                  Distribution Chart
                </div>
              </div>

              {/* Activity Overview */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #fcd34d',
                }}
              >
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  Activity Overview
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Active Users</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
                      {stats.activeUsers}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>New Today</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ea580c' }}>
                      {stats.newUsersToday}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Engagement Rate</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0891b2' }}>
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    border: '1px dashed #fcd34d',
                  }}
                >
                  Activity Chart
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Activity
            </h2>
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '12px',
              }}
            >
              Activity log will appear here
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard

