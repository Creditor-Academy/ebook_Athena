import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">Athena eBooks</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/ebooks">eBooks</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  )
}

export default Navbar

