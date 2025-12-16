import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import DashboardOverview from './admin/DashboardOverview'
import UsersPage from './admin/UsersPage'
import AuthorsPage from './admin/AuthorsPage'
import { FaChartLine, FaUsers, FaUserTie } from 'react-icons/fa'

const styles = `
  .admin-dashboard-container {
    display: flex;
    min-height: calc(100vh - 64px);
    background: #f8fafc;
  }

  .admin-dashboard-sidebar {
    width: 250px;
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    padding: 1.5rem;
    position: sticky;
    top: 0;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .sidebar-header {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sidebar-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .sidebar-button:hover {
    background: #f1f5f9;
    color: #2563eb;
  }

  .sidebar-button.active {
    background: #eef3ff;
    color: #2563eb;
    font-weight: 600;
  }

  .sidebar-icon {
    font-size: 1.1rem;
  }

  .admin-dashboard-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .admin-dashboard-container {
      flex-direction: column;
    }

    .admin-dashboard-sidebar {
      width: 100%;
      height: auto;
      position: relative;
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }

    .sidebar-nav {
      flex-direction: row;
      overflow-x: auto;
    }

    .sidebar-button {
      white-space: nowrap;
    }
  }
`

function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (!userData || userData.role !== 'SUPER_ADMIN') {
          navigate('/')
          return
        }
        setUser(userData)
      } catch (error) {
        console.error('Auth check failed:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

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

  return (
    <>
      <style>{styles}</style>
      <div className="admin-dashboard-container">
        {/* Sidebar */}
        <aside className="admin-dashboard-sidebar">
          <h2 className="sidebar-header">Admin Dashboard</h2>
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`sidebar-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <FaChartLine className="sidebar-icon" />
              Overall Insights
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-button ${activeTab === 'users' ? 'active' : ''}`}
            >
              <FaUsers className="sidebar-icon" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`sidebar-button ${activeTab === 'authors' ? 'active' : ''}`}
            >
              <FaUserTie className="sidebar-icon" />
              Authors
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-dashboard-content">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'authors' && <AuthorsPage />}
        </main>
      </div>
    </>
  )
}

export default AdminDashboard
