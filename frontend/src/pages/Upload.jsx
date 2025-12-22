import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'
import { uploadBook } from '../services/bookUpload'
import uploadBookImage from '../assets/Uploadbook.png'

function Upload() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    recommended: false,
  })
  const [epubFile, setEpubFile] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [epubPreview, setEpubPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Steps configuration
  const steps = [
    { id: 1, title: 'Book Information', description: 'Enter book details' },
    { id: 2, title: 'Upload Files', description: 'Add EPUB and cover' },
    { id: 3, title: 'Review & Submit', description: 'Finalize upload' },
  ]

  // Navigation functions
  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.title || !formData.author) {
        setError('Please fill in Title and Author before proceeding')
        return
      }
    } else if (currentStep === 2) {
      // Validate step 2
      if (!epubFile) {
        setError('Please upload an EPUB file before proceeding')
        return
      }
    }
    setError('')
    setSuccess('') // Clear success message when moving to next step
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleUploadMore = () => {
    // Reset everything and go back to step 1
    setUploadSuccess(false)
    setSuccess('')
    setError('')
    setCurrentStep(1)
    setFormData({
      title: '',
      author: '',
      description: '',
      shortDescription: '',
      price: '',
      category: '',
      recommended: false,
    })
    setEpubFile(null)
    setCoverImage(null)
    setEpubPreview(null)
    setCoverPreview(null)
  }

  const handlePrevious = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
          navigate('/')
          return
        }
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEpubChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/epub+zip' && !file.name.endsWith('.epub')) {
        setError('Please upload a valid EPUB file (.epub)')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError('EPUB file size must be less than 50MB')
        return
      }
      setEpubFile(file)
      setEpubPreview(file.name)
      setError('')
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError('Cover image size must be less than 5MB')
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.title || !formData.author || !epubFile) {
      setError('Please fill in all required fields (Title, Author, and EPUB file)')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('author', formData.author)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('shortDescription', formData.shortDescription)
      uploadFormData.append('price', formData.price)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('recommended', formData.recommended)
      uploadFormData.append('epub', epubFile)
      if (coverImage) {
        uploadFormData.append('cover', coverImage)
      }

      // Use the bookUpload service
      await uploadBook(uploadFormData)

      setSuccess('eBook uploaded successfully!')
      setUploadSuccess(true)
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        shortDescription: '',
        price: '',
        category: '',
        recommended: false,
      })
      setEpubFile(null)
      setCoverImage(null)
      setEpubPreview(null)
      setCoverPreview(null)
      setCurrentStep(1) // Reset to step 1
      e.target.reset()
    } catch (err) {
      setError(err.message || 'Failed to upload ebook. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Container with image and form */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Image at top */}
        <div
          style={{
            width: '100%',
            height: '300px',
            overflow: 'hidden',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={uploadBookImage}
            alt="Upload eBook"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

         {/* Form content */}
         <div style={{ padding: '2rem' }}>
           <h1
             style={{
               fontSize: '2.5rem',
               marginBottom: '1rem',
               color: '#0f172a',
               fontWeight: 700,
             }}
           >
             Upload eBook
           </h1>

           {/* Timeline/Stepper */}
           <div
             style={{
               marginBottom: '2.5rem',
               padding: '1.5rem',
               background: '#f8fafc',
               borderRadius: '12px',
               border: '1px solid #e2e8f0',
             }}
           >
             <div
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 position: 'relative',
               }}
             >
               {/* Progress line */}
               <div
                 style={{
                   position: 'absolute',
                   top: '24px',
                   left: '24px',
                   right: '24px',
                   height: '2px',
                   background: '#e2e8f0',
                   zIndex: 0,
                 }}
               >
                 <div
                   style={{
                     height: '100%',
                     background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                     width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                     transition: 'width 0.3s ease',
                   }}
                 />
               </div>

               {/* Steps */}
               {steps.map((step) => {
                 const isCompleted = step.id < currentStep
                 const isCurrent = step.id === currentStep

                 return (
                   <div
                     key={step.id}
                     style={{
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       flex: 1,
                       position: 'relative',
                       zIndex: 1,
                     }}
                   >
                     {/* Step circle */}
                     <div
                       style={{
                         width: '48px',
                         height: '48px',
                         borderRadius: '50%',
                         background: isCompleted
                           ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                           : isCurrent
                             ? '#ffffff'
                             : '#e2e8f0',
                         border: isCurrent ? '3px solid #2563eb' : 'none',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginBottom: '0.5rem',
                         boxShadow: isCurrent
                           ? '0 4px 12px rgba(37, 99, 235, 0.3)'
                           : isCompleted
                             ? '0 2px 8px rgba(37, 99, 235, 0.2)'
                             : 'none',
                         transition: 'all 0.3s ease',
                       }}
                     >
                       {isCompleted ? (
                         <svg
                           width="24"
                           height="24"
                           viewBox="0 0 24 24"
                           fill="none"
                           style={{ color: '#ffffff' }}
                         >
                           <path
                             d="M20 6L9 17l-5-5"
                             stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                           />
                         </svg>
                       ) : (
                         <span
                           style={{
                             fontSize: '1rem',
                             fontWeight: 600,
                             color: isCurrent ? '#2563eb' : '#94a3b8',
                           }}
                         >
                           {step.id}
                         </span>
                       )}
                     </div>

                     {/* Step title and data */}
                     <div
                       style={{
                         textAlign: 'center',
                         maxWidth: '180px',
                         width: '100%',
                       }}
                     >
                       <div
                         style={{
                           fontSize: '0.875rem',
                           fontWeight: isCurrent ? 600 : 500,
                           color: isCompleted || isCurrent ? '#0f172a' : '#94a3b8',
                           marginBottom: '0.25rem',
                           transition: 'all 0.3s ease',
                         }}
                       >
                         {step.title}
                       </div>
                       <div
                         style={{
                           fontSize: '0.75rem',
                           color: isCompleted || isCurrent ? '#64748b' : '#cbd5e1',
                           transition: 'all 0.3s ease',
                           minHeight: '32px',
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '0.25rem',
                           alignItems: 'center',
                           justifyContent: 'center',
                         }}
                       >
                         {/* Step 1: Book Information */}
                         {step.id === 1 && (
                           <>
                             {formData.title ? (
                               <div
                                 style={{
                                   fontWeight: 500,
                                   color: isCompleted || isCurrent ? '#2563eb' : '#94a3b8',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                   maxWidth: '100%',
                                 }}
                                 title={formData.title}
                               >
                                 {formData.title}
                               </div>
                             ) : (
                               <div>{step.description}</div>
                             )}
                             {formData.author && (
                               <div
                                 style={{
                                   fontSize: '0.7rem',
                                   color: isCompleted || isCurrent ? '#64748b' : '#cbd5e1',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                   maxWidth: '100%',
                                 }}
                                 title={formData.author}
                               >
                                 by {formData.author}
                               </div>
                             )}
                           </>
                         )}

                         {/* Step 2: Upload Files */}
                         {step.id === 2 && (
                           <>
                             {epubFile ? (
                               <div
                                 style={{
                                   fontWeight: 500,
                                   color: isCompleted || isCurrent ? '#2563eb' : '#94a3b8',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                   maxWidth: '100%',
                                 }}
                                 title={epubPreview || epubFile.name}
                               >
                                 {epubPreview || epubFile.name}
                               </div>
                             ) : (
                               <div>{step.description}</div>
                             )}
                             {coverImage && (
                               <div
                                 style={{
                                   fontSize: '0.7rem',
                                   color: isCompleted || isCurrent ? '#64748b' : '#cbd5e1',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                   maxWidth: '100%',
                                 }}
                                 title={coverImage.name}
                               >
                                 Cover: {coverImage.name}
                               </div>
                             )}
                           </>
                         )}

                         {/* Step 3: Review & Submit */}
                         {step.id === 3 && (
                           <>
                             {formData.title && epubFile ? (
                               <div
                                 style={{
                                   fontWeight: 500,
                                   color: isCompleted || isCurrent ? '#2563eb' : '#94a3b8',
                                 }}
                               >
                                 Ready to upload
                               </div>
                             ) : (
                               <div>{step.description}</div>
                             )}
                             {formData.title && epubFile && (
                               <div
                                 style={{
                                   fontSize: '0.7rem',
                                   color: isCompleted || isCurrent ? '#64748b' : '#cbd5e1',
                                 }}
                               >
                                 {formData.category && `${formData.category} • `}
                                 {formData.price || 'Free'}
                               </div>
                             )}
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                 )
               })}
             </div>
           </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          {success && uploadSuccess && (
            <div
              style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '2px solid #10b981',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                ✓ {success}
              </div>
              <button
                type="button"
                onClick={handleUploadMore}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2563eb'
                }}
              >
                Upload More
              </button>
            </div>
          )}

          {success && !uploadSuccess && (
            <div
              style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #a7f3d0',
              }}
            >
              {success}
            </div>
          )}

          {!uploadSuccess && (
            <form onSubmit={handleSubmit}>
            {/* Step 1: Book Information */}
            {currentStep === 1 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Left Column */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
            {/* Title */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
                placeholder="Enter ebook title"
              />
            </div>

            {/* Author */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Author <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
                placeholder="Enter author name"
              />
            </div>

            {/* Category */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                <option value="">Select a category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Price
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
                placeholder="e.g., $14.99"
              />
            </div>

            {/* Recommended Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <input
                type="checkbox"
                name="recommended"
                id="recommended"
                checked={formData.recommended}
                onChange={handleInputChange}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <label
                htmlFor="recommended"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                Mark as Recommended
              </label>
            </div>
          </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                    }}
                  >
                    {/* Short Description */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        Short Description
                      </label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#2563eb'
                          e.currentTarget.style.outline = 'none'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }}
                        placeholder="Brief description (for cards/listings)"
                      />
                    </div>

                    {/* Full Description */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        Full Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="5"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#2563eb'
                          e.currentTarget.style.outline = 'none'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }}
                        placeholder="Detailed description of the ebook"
                      />
                    </div>
                  </div>
                </div>
              )}

            {/* Step 2: Upload Files */}
            {currentStep === 2 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                  marginBottom: '2rem',
                }}
              >
                {/* EPUB File Upload */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                EPUB File <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: epubFile ? '#f8fafc' : '#ffffff',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.background = '#eef3ff'
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = epubFile ? '#f8fafc' : '#ffffff'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    const event = { target: { files: [file] } }
                    handleEpubChange(event)
                  }
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = epubFile ? '#f8fafc' : '#ffffff'
                }}
              >
                <input
                  type="file"
                  accept=".epub,application/epub+zip"
                  onChange={handleEpubChange}
                  required
                  style={{ display: 'none' }}
                  id="epub-upload"
                />
                <label
                  htmlFor="epub-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: '#64748b' }}
                  >
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="17 8 12 3 7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="3"
                      x2="12"
                      y2="15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {epubPreview || 'Click to upload or drag and drop EPUB file'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    EPUB files only (Max 50MB)
                  </span>
                </label>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                Cover Image (Optional)
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: coverImage ? '#f8fafc' : '#ffffff',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.background = '#eef3ff'
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = coverImage ? '#f8fafc' : '#ffffff'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    const event = { target: { files: [file] } }
                    handleCoverChange(event)
                  }
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = coverImage ? '#f8fafc' : '#ffffff'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                  }}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '120px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#64748b' }}
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                        <polyline
                          points="21 15 16 10 5 21"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Click to upload or drag and drop cover image
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        Images only (Max 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '1.5rem',
                  }}
                >
                  Review Your eBook
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#64748b',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Book Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Title:</span>{' '}
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.title}</span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Author:</span>{' '}
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.author}</span>
                      </div>
                      {formData.category && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Category:</span>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.category}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Price:</span>{' '}
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.price || 'Free'}</span>
                      </div>
                      {formData.recommended && (
                        <div>
                          <span style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>
                            ✓ Recommended
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#64748b',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Files
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>EPUB:</span>{' '}
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>
                          {epubFile?.name || 'Not uploaded'}
                        </span>
                      </div>
                      {coverImage && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cover:</span>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 500 }}>{coverImage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {formData.description && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#64748b',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Description
                    </h3>
                    <p style={{ color: '#0f172a', lineHeight: '1.6' }}>{formData.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'space-between',
                marginTop: '2rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1'
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/ebooks')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.background = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Cancel
                </button>
              </div>
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1d4ed8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#2563eb'
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: uploading ? '#94a3b8' : '#2563eb',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.background = '#1d4ed8'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.background = '#2563eb'
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload eBook'}
                  </button>
                )}
              </div>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Upload

