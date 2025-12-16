import { useState } from 'react'
import { FaUser, FaEnvelope, FaBook, FaComment, FaCheckCircle, FaArrowRight } from 'react-icons/fa'

const styles = `
.contact-section {
  margin-top: 2.8rem;
  padding: 3.5rem 1.8rem;
  background: linear-gradient(135deg, #f9fbff 0%, #f0f4ff 50%, #fafbff 100%);
  border-radius: 24px;
  border: 1px solid #e1e9ff;
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.12);
  position: relative;
  overflow: hidden;
}

.contact-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.08), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(56, 189, 248, 0.06), transparent 45%);
  z-index: 0;
}

.contact-section::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.1), transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.contact-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-info .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  color: #4f6df5;
  margin-bottom: 0.5rem;
  display: block;
}

.contact-info h2 {
  margin: 0.3rem 0 0.8rem;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: #0f172a;
  line-height: 1.2;
  font-weight: 700;
}

.contact-info .description {
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.info-features {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid #e4ebff;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #c7d2fe;
  transform: translateX(4px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border-radius: 10px;
  font-size: 1.1rem;
}

.feature-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.feature-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.contact-form-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(30, 64, 175, 0.08);
  border: 1px solid #e4ebff;
  position: sticky;
  top: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group label .icon-wrapper {
  color: #2563eb;
  font-size: 1rem;
}

.form-group label .required {
  color: #dc2626;
  margin-left: 0.25rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
  min-height: 140px;
  resize: vertical;
  font-family: inherit;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem 2rem;
  background: linear-gradient(120deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.32);
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.38);
  background: linear-gradient(120deg, #1d4ed8, #1e40af);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button-icon {
  transition: transform 0.2s ease;
}

.submit-button:hover:not(:disabled) .submit-button-icon {
  transform: translateX(3px);
}

.success-message {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
  animation: slideDown 0.3s ease;
}

.success-icon {
  font-size: 1.25rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  border: 1px solid #fecaca;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */
@media (max-width: 968px) {
  .contact-wrapper {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  
  .contact-form-container {
    position: static;
  }
  
  .contact-info {
    text-align: center;
  }
  
  .feature-item {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .contact-section {
    padding: 2.5rem 1.5rem;
  }
  
  .contact-form-container {
    padding: 2rem 1.5rem;
  }
  
  .contact-info .description {
    font-size: 0.95rem;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
}
`

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bookTitle: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear status when user starts typing again
    if (submitStatus) setSubmitStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit contact form')
      }

      setIsSubmitting(false)
      setSubmitStatus('success')
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        bookTitle: '',
        message: '',
      })

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (error) {
      console.error('Contact form submission error:', error)
      setIsSubmitting(false)
      setSubmitStatus('error')
      
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <section className="contact-section">
        <div className="contact-wrapper">
          {/* Left Side - Information */}
          <div className="contact-info">
            <div>
              <span className="eyebrow">Publish With Us</span>
              <h2>Want Your Book to Go Live?</h2>
              <p className="description">
                Are you an author looking to publish your work? We're here to help you bring your book to life and reach readers worldwide through our platform.
              </p>
            </div>

            <div className="info-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <div className="feature-content">
                  <h3>Easy Publishing</h3>
                  <p>Submit your manuscript and we'll handle the technical aspects of getting it online.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FaUser />
                </div>
                <div className="feature-content">
                  <h3>Author Support</h3>
                  <p>Get dedicated support throughout the publishing process from our experienced team.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FaEnvelope />
                </div>
                <div className="feature-content">
                  <h3>Quick Response</h3>
                  <p>We'll get back to you within 24-48 hours to discuss your publishing needs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="contact-form-container">
            {submitStatus === 'success' && (
              <div className="success-message">
                <FaCheckCircle className="success-icon" />
                <span>Thank you! We've received your message and will contact you soon.</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message">
                Something went wrong. Please try again later or contact us directly.
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  <FaUser className="icon-wrapper" />
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope className="icon-wrapper" />
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookTitle">
                  <FaBook className="icon-wrapper" />
                  Book Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleChange}
                  placeholder="The title of your book"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <FaComment className="icon-wrapper" />
                  Tell us about your book <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details about your book, your publishing goals, or any questions you have..."
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Your Request'}
                {!isSubmitting && <FaArrowRight className="submit-button-icon" />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactSection
