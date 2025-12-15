import { Link } from 'react-router-dom'
import logo from '../assets/logo_ebook.png'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="Athena eBooks logo" />
        <span>Athena eBooks</span>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/ebooks">eBooks</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  )
}

export default Navbar

