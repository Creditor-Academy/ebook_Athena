import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import Home from './pages/Home'
import Ebooks from './pages/Ebooks'
import Profile from './pages/Profile'
import Reader from './pages/Reader'
import ReadingRoom from './pages/ReadingRoom'
import VideoPage from './pages/Video'
import BuyModal from './pages/BuyModal'
import AdminDashboard from './pages/AdminDashboard'
import AuthorPortal from './pages/AuthorPortal'
import BookDetails from './pages/BookDetails'
import UserCartPage from './pages/UserCartPage'
import UserWishlist from './pages/UserWishlist'
import { ebooks, purchasedEbooks } from './data/ebooks'
import samplePdf from './assets/sample.pdf'
import './App.css'

function App() {
  const location = useLocation()
  const isFullReader = location.pathname.startsWith('/reading-room')

  return (
    <div className="app">
      {!isFullReader && <Navbar />}
      <main className="content" style={isFullReader ? { padding: 0, maxWidth: '100%' } : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ebooks" element={<Ebooks />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/reader/:id"
            element={
              <Reader
                ebooks={ebooks}
                purchasedEbooks={purchasedEbooks}
                samplePdfSrc={samplePdf}
              />
            }
          />
          <Route path="/reading-room/:id" element={<ReadingRoom samplePdfSrc={samplePdf} />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/buy-modal" element={<BuyModal />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/author-portal" element={<AuthorPortal />} />
          <Route path="/upload" element={<AuthorPortal />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/cart" element={<UserCartPage />} />
          <Route path="/wishlist" element={<UserWishlist />} />
        </Routes>
      </main>
      {!isFullReader && <Footer />}
      <SuperAdminDashboard />
    </div>
  )
}

export default App
