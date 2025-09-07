import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ isSignup = false, onToggleMode, onClose }) {
  const { login, quickLogin, guestLogin, signup, isStorageAvailable } = useAuth()
  const [isSignupMode, setIsSignupMode] = useState(isSignup)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [showQuickLogin, setShowQuickLogin] = useState(false)
  
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
    
    // DO NOT automatically show quick login for Android
    // This was causing users to accidentally create test accounts
    // const isAndroid = /Android/i.test(navigator.userAgent)
    // if (isAndroid) {
    //   setShowQuickLogin(true)
    // }
  }, [isStorageAvailable])

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      console.log('Using guest login...')
      await guestLogin()
      console.log('Guest login successful')
      onClose()
    } catch (err) {
      console.error('Guest login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      // Trim inputs for quick login too
      const trimmedEmail = formData.email.trim()
      const trimmedPassword = formData.password.trim()
      
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Please enter email and password for quick login')
      }
      
      console.log('⚡ QUICK LOGIN ATTEMPT - Sending to auth layer:', {
        email: trimmedEmail,
        emailLength: trimmedEmail.length,
        passwordLength: trimmedPassword.length,
        timestamp: new Date().toISOString()
      })
      
      const result = await quickLogin(trimmedEmail, trimmedPassword)
      console.log('✅ QUICK LOGIN SUCCESS RESPONSE:', result)
      setDebugInfo(`✅ Quick login successful! Welcome ${result.businessName || result.email}`)
      
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error('🚨 QUICK LOGIN ERROR:', {
        message: err.message,
        email: formData.email.trim(),
        timestamp: new Date().toISOString()
      })
      
      setError(err.message)
      setDebugInfo(`🔍 Quick Login Debug: ${err.message} | Email: "${formData.email.trim()}" | Time: ${new Date().toLocaleTimeString()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    // Don't trim during typing - only trim email/password fields to preserve spaces in names
    const value = e.target.value
    const fieldName = e.target.name
    
    // Only trim email and password fields during typing to prevent leading/trailing spaces
    // but preserve spaces in business names, owner names, etc.
    const processedValue = (fieldName === 'email' || fieldName === 'password') 
      ? value.trim() 
      : value
    
    setFormData({
      ...formData,
      [fieldName]: processedValue
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
      // Trim only email and password to prevent login issues, preserve spaces in names/addresses
      const trimmedData = {
        email: formData.email.trim(),
        password: formData.password.trim(),
        businessName: formData.businessName.trim(), // Trim only leading/trailing spaces
        ownerName: formData.ownerName.trim(), // Trim only leading/trailing spaces  
        phone: formData.phone.trim(),
        address: formData.address.trim()
      }

      // Mobile-specific debugging
      console.log('🔍 FORM SUBMISSION DEBUG:', {
        isSignupMode,
        originalEmail: formData.email,
        trimmedEmail: trimmedData.email,
        originalBusinessName: formData.businessName,
        trimmedBusinessName: trimmedData.businessName,
        emailLength: trimmedData.email.length,
        passwordLength: trimmedData.password.length,
        userAgent: navigator.userAgent,
        storageAvailable: isStorageAvailable,
        timestamp: new Date().toISOString()
      })

      if (isSignupMode) {
        if (!trimmedData.email || !trimmedData.password || !trimmedData.businessName || !trimmedData.ownerName) {
          throw new Error('Please fill in all required fields')
        }
        
        console.log('📝 SIGNUP ATTEMPT - Sending to auth layer:', {
          email: trimmedData.email,
          businessName: trimmedData.businessName,
          ownerName: trimmedData.ownerName
        })
        
        const result = await signup(trimmedData)
        console.log('✅ SIGNUP SUCCESS RESPONSE:', result)
        setDebugInfo(`✅ Account created successfully! Welcome ${result.businessName}`)
      } else {
        if (!trimmedData.email || !trimmedData.password) {
          throw new Error('Please enter email and password')
        }
        
        console.log('🔐 LOGIN ATTEMPT - Sending to auth layer:', {
          email: trimmedData.email,
          emailLength: trimmedData.email.length,
          passwordLength: trimmedData.password.length,
          hasEmail: !!trimmedData.email,
          hasPassword: !!trimmedData.password
        })
        
        const result = await login(trimmedData.email, trimmedData.password)
        console.log('✅ LOGIN SUCCESS RESPONSE:', result)
        setDebugInfo(`✅ Login successful! Welcome back ${result.businessName || result.email}`)
      }
      
      // Show success message briefly before closing
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (err) {
      console.error('🚨 AUTH ERROR DETAILS:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        timestamp: new Date().toISOString(),
        email: formData.email.trim(),
        userAgent: navigator.userAgent
      })
      
      setError(err.message)
      
      // Display server response debug info for mobile debugging
      setDebugInfo(`🔍 Debug Info: ${err.message} | Email: "${formData.email.trim()}" | Length: ${formData.email.trim().length} | Time: ${new Date().toLocaleTimeString()}`)
      
      // Add helpful debug info for mobile users
      if (err.message.includes('Storage not available')) {
        setDebugInfo('Try refreshing the page or enabling cookies in your browser settings. If using iOS Safari, disable Private Browsing mode.')
      } else if (err.message.includes('Invalid credentials')) {
        setDebugInfo(`❌ Login failed for "${formData.email.trim()}" - Check email/password. Email length: ${formData.email.trim().length}, Has spaces: ${formData.email !== formData.email.trim()}`)
        
        // Only show Quick Login as last resort after failed login
        const isAndroid = /Android/i.test(navigator.userAgent)
        if (isAndroid) {
          setShowQuickLogin(true)
        }
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
    setShowQuickLogin(false) // Reset quick login display
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
                <div className="text-xs mt-2 text-red-600 bg-red-100 p-2 rounded border font-mono">
                  <strong>Debug Info:</strong> {debugInfo}
                </div>
              )}
            </div>
          )}

          {/* Success message display */}
          {!error && debugInfo && debugInfo.includes('✅') && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="font-medium">{debugInfo}</div>
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
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
                  autoComplete="organization"
                  autoCapitalize="words"
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
                  autoComplete="name"
                  autoCapitalize="words"
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

          {/* Emergency Login for Android users having trouble - ONLY show after failed login */}
          {showQuickLogin && !isSignupMode && (
            <>
              <div className="text-center text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                ⚠️ <strong>Emergency Login:</strong> Only use this if normal login keeps failing. 
                This may create a new account instead of using your existing one.
              </div>
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={loading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '⚡ Emergency Login (Last Resort)'}
              </button>
            </>
          )}

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

          {/* Guest Login - Ultimate fallback */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-sm underline disabled:opacity-50"
            >
              Continue as Guest (No account needed)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
