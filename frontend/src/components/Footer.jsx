import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
        color: '#ffffff',
        padding: '3rem 1.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Company Info */}
          <div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 1rem',
                color: '#ffffff',
              }}
            >
              Athena eBooks
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: '#e0e7ff',
                margin: '0 0 1.5rem',
              }}
            >
              Your gateway to a world of knowledge. Discover, read, and explore thousands of digital books at your fingertips.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                margin: '0 0 1rem',
                color: '#ffffff',
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li>
                <Link
                  to="/ebooks"
                  style={{
                    color: '#e0e7ff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#e0e7ff'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  Browse Books
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  style={{
                    color: '#e0e7ff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#e0e7ff'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  style={{
                    color: '#e0e7ff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#e0e7ff'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  style={{
                    color: '#e0e7ff',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#e0e7ff'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                margin: '0 0 1rem',
                color: '#ffffff',
              }}
            >
              Contact Us
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#e0e7ff',
                  fontSize: '0.95rem',
                }}
              >
                <FaEnvelope style={{ fontSize: '1rem', flexShrink: 0 }} />
                <span>support@ebookathena.com</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#e0e7ff',
                  fontSize: '0.95rem',
                }}
              >
                <FaPhone style={{ fontSize: '1rem', flexShrink: 0 }} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  color: '#e0e7ff',
                  fontSize: '0.95rem',
                }}
              >
                <FaMapMarkerAlt style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.125rem' }} />
                <span>123 Book Street, Knowledge City, KC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '1.5rem',
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#e0e7ff',
            }}
          >
            © {currentYear} Athena eBooks. All rights reserved.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: '#c7d2fe',
            }}
          >
            Crafted for curious minds. Explore the world of digital reading.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
