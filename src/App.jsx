import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Ebooks from './pages/Ebooks'
import Profile from './pages/Profile'
import Reader from './pages/Reader'
import { ebooks, purchasedEbooks } from './data/ebooks'
import samplePdf from './assets/sample.pdf'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ebooks" element={<Ebooks ebooks={ebooks} />} />
          <Route path="/profile" element={<Profile purchasedEbooks={purchasedEbooks} />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
