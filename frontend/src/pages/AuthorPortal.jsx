import { useState } from 'react'
import Upload from './Upload'
import Insights from './Insights'
import { FaUpload, FaChartLine } from 'react-icons/fa'

function AuthorPortal() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <>
      <style>
        {`
          @media (max-width: 968px) {
            .author-portal-container {
              grid-template-columns: 1fr !important;
            }
            .author-portal-sidebar {
              position: static !important;
              margin-bottom: 1.5rem;
            }
          }
        `}
      </style>
      <div
        className="author-portal-container"
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '2rem',
          minHeight: 'calc(100vh - 200px)',
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '2rem',
        }}
      >
      {/* Sidebar */}
      <div
        className="author-portal-sidebar"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          height: 'fit-content',
          position: 'sticky',
          top: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          Author Portal
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'upload' ? 'linear-gradient(120deg, #2563eb, #1d4ed8)' : 'transparent',
              color: activeTab === 'upload' ? '#ffffff' : '#64748b',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'upload') {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.color = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'upload') {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#64748b'
              }
            }}
          >
            <FaUpload style={{ fontSize: '1.1rem' }} />
            <span>Upload Book</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'insights' ? 'linear-gradient(120deg, #2563eb, #1d4ed8)' : 'transparent',
              color: activeTab === 'insights' ? '#ffffff' : '#64748b',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'insights') {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.color = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'insights') {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#64748b'
              }
            }}
          >
            <FaChartLine style={{ fontSize: '1.1rem' }} />
            <span>View Insights</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'upload' && <Upload />}
        {activeTab === 'insights' && <Insights />}
      </div>
    </div>
    </>
  )
}

export default AuthorPortal
