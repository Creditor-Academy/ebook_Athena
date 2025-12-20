import { useState, useEffect } from 'react'
import { FaUsers, FaCheckCircle, FaPlus, FaBook, FaShoppingCart, FaDollarSign } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const styles = `
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .analytics-grid {
      grid-template-columns: 1fr !important;
    }
  }
`

function DashboardOverview() {
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

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('[DashboardOverview] Fetching analytics...')
      
      // Fetch user stats
      const usersResponse = await fetch(`${API_URL}/users/stats`, {
        credentials: 'include',
      })
      
      let usersData = {}
      if (usersResponse.ok) {
        usersData = await usersResponse.json()
        console.log(' [DashboardOverview] User stats:', usersData)
      } else {
        console.warn(' [DashboardOverview] Stats endpoint not available')
      }
      
      // Fetch all books to calculate total books and revenue
      const booksResponse = await fetch(`${API_URL}/books?limit=1000`, {
        credentials: 'include',
      })
      
      let totalBooks = 0
      let totalRevenue = 0
      
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const allBooks = booksData.books || []
        totalBooks = allBooks.length
        
        // Calculate total revenue: sum of (price * downloads) for all books
        totalRevenue = allBooks.reduce((sum, book) => {
          const price = parseFloat(book.price || 0)
          const downloads = book.downloads || 0
          return sum + (price * downloads)
        }, 0)
        
        console.log('[DashboardOverview] Books stats:', { totalBooks, totalRevenue })
      } else {
        console.warn(' [DashboardOverview] Failed to fetch books')
      }
      
      setStats({
        ...usersData,
        totalBooks,
        revenue: totalRevenue,
      })
      
      console.log('[DashboardOverview] Final stats:', {
        ...usersData,
        totalBooks,
        revenue: totalRevenue,
      })
    } catch (error) {
      console.error(' [DashboardOverview] Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: FaCheckCircle,
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      title: 'New Users Today',
      value: stats.newUsersToday,
      icon: FaPlus,
      color: '#ea580c',
      bgColor: '#ffedd5',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: FaBook,
      color: '#9333ea',
      bgColor: '#f3e8ff',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: FaShoppingCart,
      color: '#0891b2',
      bgColor: '#cffafe',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: FaDollarSign,
      color: '#ca8a04',
      bgColor: '#fef9c3',
    },
  ]

  return (
    <>
      <style>{styles}</style>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
            Overall Insights
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Overview of your platform's performance
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
            className="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {statCards.map((card, index) => {
              const IconComponent = card.icon
              const backgroundImages = [
                'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232563eb\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(5, 150, 105, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2316a34a\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                'linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(217, 70, 6, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ea580c\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M30 20l4 8h8l-6 6 2 8-8-6-8 6 2-8-6-6h8z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(124, 58, 237, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239333ea\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M20 20h20v20H20z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                'linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(6, 95, 130, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230891b2\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M30 15c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                'linear-gradient(135deg, rgba(202, 138, 4, 0.1), rgba(161, 98, 7, 0.05)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ca8a04\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M30 10L35 25l15 2-11 10 3 15-17-9-17 9 3-15L5 27l15-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              ]
              
              return (
                <div
                  key={index}
                  style={{
                    background: backgroundImages[index],
                    backgroundSize: 'cover, 60px 60px',
                    backgroundPosition: 'center, 0 0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
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
                  {/* Decorative corner element */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${card.color}20, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
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
                          color: card.color,
                          boxShadow: `0 2px 8px ${card.color}30`,
                        }}
                      >
                        <IconComponent />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: 500, flex: 1 }}>
                        {card.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: card.color, whiteSpace: 'nowrap' }}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
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
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                }}
              >
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  User Growth
                </h3>
                
                {/* Bar Chart */}
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', padding: '0.75rem 0', position: 'relative' }}>
                  {/* Background grid lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.15, pointerEvents: 'none' }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ height: '1px', background: '#cbd5e1', width: '100%' }} />
                    ))}
                  </div>
                  
                  {[
                    { label: 'Total', value: stats.totalUsers, color: '#2563eb', fullLabel: 'Total Users' },
                    { label: 'Active', value: stats.activeUsers, color: '#16a34a', fullLabel: 'Active Users' },
                    { label: 'New', value: stats.newUsersToday, color: '#ea580c', fullLabel: 'New Today' },
                  ].map((item, index) => {
                    const maxValue = Math.max(stats.totalUsers, stats.activeUsers, stats.newUsersToday, 1)
                    const height = (item.value / maxValue) * 85
                    return (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(height, 8)}%`,
                            background: `linear-gradient(180deg, ${item.color}, ${item.color}cc)`,
                            borderRadius: '6px 6px 0 0',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 2px 8px ${item.color}40`,
                            position: 'relative',
                          }}
                          title={item.fullLabel}
                        >
                          <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.875rem', fontWeight: 700, color: item.color, whiteSpace: 'nowrap' }}>
                            {item.value}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* User Distribution */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                }}
              >
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  User Distribution
                </h3>
                
                {/* Pie Chart with Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '140px' }}>
                  {/* Pie Chart */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                      />
                      {stats.totalUsers > 0 && (
                        <>
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="12"
                            strokeDasharray={`${((stats.totalUsers - stats.totalAdmins) / stats.totalUsers) * 263.9} 263.9`}
                            strokeLinecap="round"
                          />
                          {stats.totalAdmins > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="#9333ea"
                              strokeWidth="12"
                              strokeDasharray={`${(stats.totalAdmins / stats.totalUsers) * 263.9} 263.9`}
                              strokeDashoffset={`-${((stats.totalUsers - stats.totalAdmins) / stats.totalUsers) * 263.9}`}
                              strokeLinecap="round"
                            />
                          )}
                        </>
                      )}
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{stats.totalUsers}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Total</div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Regular Users</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>
                          {stats.totalUsers - stats.totalAdmins}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9333ea', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Admins</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9333ea' }}>
                          {stats.totalAdmins}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Overview */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                }}
              >
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  Activity Overview
                </h3>
                
                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Active Users', value: stats.activeUsers, color: '#16a34a' },
                    { label: 'New Today', value: stats.newUsersToday, color: '#ea580c' },
                    { label: 'Engagement', value: stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0, color: '#0891b2', suffix: '%' },
                  ].map((item, index) => (
                    <div key={index} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{item.label}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>
                        {item.value}{item.suffix || ''}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Bar Chart */}
                <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', padding: '0.5rem 0', position: 'relative' }}>
                  {/* Background grid lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.15, pointerEvents: 'none' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} style={{ height: '1px', background: '#cbd5e1', width: '100%' }} />
                    ))}
                  </div>
                  
                  {[
                    { label: 'Active', value: stats.activeUsers, color: '#16a34a', maxValue: Math.max(stats.activeUsers, stats.newUsersToday, 1) },
                    { label: 'New', value: stats.newUsersToday, color: '#ea580c', maxValue: Math.max(stats.activeUsers, stats.newUsersToday, 1) },
                    { label: 'Engage', value: stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0, color: '#0891b2', maxValue: 100, isPercent: true },
                  ].map((item, index) => {
                    const height = item.isPercent ? item.value : (item.value / item.maxValue) * 100
                    return (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(height, 8)}%`,
                            background: `linear-gradient(180deg, ${item.color}, ${item.color}cc)`,
                            borderRadius: '6px 6px 0 0',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 2px 6px ${item.color}40`,
                            position: 'relative',
                          }}
                        >
                          <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700, color: item.color, whiteSpace: 'nowrap' }}>
                            {item.value}{item.isPercent ? '%' : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  )
}

export default DashboardOverview

