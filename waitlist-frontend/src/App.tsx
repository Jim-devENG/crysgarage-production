import { useState } from 'react'
import './styles.css'

interface FormData {
  name: string
  location: string
  phone: string
  email: string
  category: string
}

const categories = [
  'Artist',
  'Content Creator', 
  'Sound Engineer',
  'Radio Presenter',
  'Podcaster',
  'DJ',
  'Producer',
  'Other'
]

const API_BASE = 'https://crysgarage.studio/waitlist-api'

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    phone: '',
    email: '',
    category: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/api/waitlist/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Redirect to WhatsApp group after 2 seconds
        setTimeout(() => {
          window.location.href = 'https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3?mode=ems_share_t'
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-brand mb-4">Welcome to the Waitlist!</h2>
          <p className="text-white/70 mb-4">
            You've been successfully registered. Redirecting you to our WhatsApp group...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the CrysGarage Waitlist
          </h1>
          <p className="text-xl text-white/90">
            Be the first to know when we launch our revolutionary audio mastering platform
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Get Early Access
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-white/70 text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                className={`input ${errors.location ? 'border-red-500' : ''}`}
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-white/70 text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-white/70 text-sm font-medium mb-2">
                Category *
              </label>
              <select
                id="category"
                className={`input ${errors.category ? 'border-red-500' : ''}`}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select your category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-brand w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
            </button>
          </form>

          <div className="mt-6 text-center text-white/60 text-sm">
            By joining, you agree to be added to our WhatsApp group for updates
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-white/60">
          <p>&copy; 2025 CrysGarage. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default App
