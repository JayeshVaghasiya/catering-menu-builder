import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ isSignup = false, onToggleMode, onClose }) {
  const { login, signup, isStorageAvailable } = useAuth()
  const [isSignupMode, setIsSignupMode] = useState(isSignup)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    address: ''
  })

  // Check storage availability on component mount
  useEffect(() => {
    if (!isStorageAvailable) {
      setError('Storage not available. Please enable cookies/local storage in your browser settings.')
      setDebugInfo('This usually happens in private browsing mode or when cookies are disabled.')
    }
  }, [isStorageAvailable])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setDebugInfo('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      // Mobile-specific debugging
      console.log('Form submission started', {
        isSignupMode,
        email: formData.email,
        userAgent: navigator.userAgent,
        storageAvailable: isStorageAvailable
      })

      if (isSignupMode) {
        if (!formData.email || !formData.password || !formData.businessName || !formData.ownerName) {
          throw new Error('Please fill in all required fields')
        }
        console.log('Attempting signup...')
        await signup(formData)
        console.log('Signup successful')
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please enter email and password')
        }
        console.log('Attempting login...')
        await login(formData.email, formData.password)
        console.log('Login successful')
      }
      onClose()
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message)
      
      // Add helpful debug info for mobile users
      if (err.message.includes('Storage not available')) {
        setDebugInfo('Try refreshing the page or enabling cookies in your browser settings. If using iOS Safari, disable Private Browsing mode.')
      } else if (err.message.includes('Invalid email or password')) {
        setDebugInfo('Double-check your email and password. Make sure caps lock is off.')
      } else if (err.message.includes('localStorage')) {
        setDebugInfo('Your browser storage may be full or disabled. Try clearing browser data.')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode)
    setError('')
    setDebugInfo('')
    setFormData({
      email: '',
      password: '',
      businessName: '',
      ownerName: '',
      phone: '',
      address: ''
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isSignupMode ? '🚀 Create Account' : '👋 Welcome Back'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="font-medium">{error}</div>
              {debugInfo && (
                <div className="text-sm mt-2 text-red-600">{debugInfo}</div>
              )}
            </div>
          )}

          {/* Storage warning for mobile */}
          {!isStorageAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="font-medium">⚠️ Storage Issue Detected</div>
              <div className="text-sm mt-1">
                Please enable cookies/storage in your browser or disable private browsing mode to continue.
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📧 Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="your@email.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔒 Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your password"
              autoComplete={isSignupMode ? "new-password" : "current-password"}
              required
            />
          </div>

          {/* Signup specific fields */}
          {isSignupMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏪 Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Your Catering Business"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Business Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  rows="2"
                  placeholder="Your business address"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Please wait...</span>
              </span>
            ) : (
              isSignupMode ? '🚀 Create Account' : '🔓 Sign In'
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={toggleMode}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {isSignupMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
