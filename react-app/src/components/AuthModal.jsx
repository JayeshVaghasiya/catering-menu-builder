import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Global log storage for mobile debugging
window.debugLogs = []
window.addDebugLog = (message, data = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    message,
    data: JSON.stringify(data, null, 2)
  }
  window.debugLogs.push(logEntry)
  console.log(`[${timestamp}] ${message}`, data)
  
  // Keep only last 50 logs to prevent memory issues
  if (window.debugLogs.length > 50) {
    window.debugLogs = window.debugLogs.slice(-50)
  }
}

const AuthModal = ({ isOpen, onClose, type, onToggle }) => {
  const { login, quickLogin, guestLogin, signup, isStorageAvailable, debugShowAllAccounts } = useAuth()
  const [isSignupMode, setIsSignupMode] = useState(type === 'signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [showQuickLogin, setShowQuickLogin] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    address: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      const trimmedData = {
        email: formData.email.trim(),
        password: formData.password.trim(),
        businessName: formData.businessName.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      }

      // Enhanced mobile debugging with global logging
      window.addDebugLog('🔍 FORM SUBMISSION STARTED', {
        isSignupMode,
        email: trimmedData.email,
        emailLength: trimmedData.email.length,
        passwordLength: trimmedData.password.length,
        userAgent: navigator.userAgent,
        domain: window.location.hostname,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        localStorage: {
          users: localStorage.getItem('users'),
          currentUser: localStorage.getItem('currentUser')
        }
      })

      if (isSignupMode) {
        if (!trimmedData.email || !trimmedData.password || !trimmedData.businessName || !trimmedData.ownerName) {
          throw new Error('Please fill in all required fields')
        }
        
        window.addDebugLog('📝 SIGNUP ATTEMPT', trimmedData)
        const result = await signup(trimmedData)
        window.addDebugLog('✅ SIGNUP SUCCESS', result)
        setDebugInfo(`✅ Account created successfully! Welcome ${result.businessName}`)
      } else {
        if (!trimmedData.email || !trimmedData.password) {
          throw new Error('Please enter email and password')
        }
        
        window.addDebugLog('🔐 LOGIN ATTEMPT', {
          email: trimmedData.email,
          emailLength: trimmedData.email.length,
          passwordLength: trimmedData.password.length
        })
        
        const result = await login(trimmedData.email, trimmedData.password)
        window.addDebugLog('✅ LOGIN SUCCESS', result)
        setDebugInfo(`✅ Login successful! Welcome back ${result.businessName || result.email}`)
      }
      
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (err) {
      window.addDebugLog('🚨 AUTH ERROR', {
        message: err.message,
        stack: err.stack,
        formData: {
          email: formData.email,
          emailTrimmed: formData.email.trim(),
          passwordLength: formData.password?.length
        },
        userAgent: navigator.userAgent,
        domain: window.location.hostname
      })
      
      setError(err.message)
      setDebugInfo(`❌ Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode)
    setError('')
    setDebugInfo('')
    setShowQuickLogin(false)
    setFormData({
      email: '',
      password: '',
      businessName: '',
      ownerName: '',
      phone: '',
      address: ''
    })
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    try {
      await guestLogin()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Signup Fields */}
          {isSignupMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  rows="2"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignupMode ? '🚀 Create Account' : '🔓 Sign In')}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              {debugInfo}
            </div>
          )}

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              {isSignupMode 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Create one"}
            </button>
          </div>

          {/* Debug Panel Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowDebugPanel(!showDebugPanel)
                if (!showDebugPanel && debugShowAllAccounts) {
                  debugShowAllAccounts()
                }
              }}
              className="text-gray-500 hover:text-gray-700 text-xs underline"
            >
              {showDebugPanel ? 'Hide Debug Info' : 'Show Debug Info (Troubleshooting)'}
            </button>
          </div>

          {/* Debug Panel */}
          {showDebugPanel && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs">
              <div className="font-medium text-gray-700 mb-2">🔧 Debug Information:</div>
              
              {/* Copy All Logs Button - Most Important for Mobile */}
              <button
                type="button"
                onClick={() => {
                  try {
                    const allLogs = window.debugLogs || []
                    const logText = allLogs.map(log => 
                      `[${log.timestamp}] ${log.message}\n${log.data}\n${'='.repeat(50)}`
                    ).join('\n\n')
                    
                    const fullDebugReport = `
MOBILE DEBUG REPORT - ${new Date().toISOString()}
${'='.repeat(60)}

SYSTEM INFO:
- Domain: ${window.location.hostname}
- User Agent: ${navigator.userAgent}
- Storage Available: ${isStorageAvailable}
- Screen: ${screen.width}x${screen.height}
- Viewport: ${window.innerWidth}x${window.innerHeight}

CURRENT FORM DATA:
- Email: "${formData.email}"
- Email Length: ${formData.email.length}
- Password Length: ${formData.password.length}
- Business Name: "${formData.businessName}"

LOCALSTORAGE:
- Users: ${localStorage.getItem('users')}
- Current User: ${localStorage.getItem('currentUser')}

DEBUG LOGS:
${'='.repeat(60)}
${logText}
                    `.trim()
                    
                    // Try to copy to clipboard
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(fullDebugReport).then(() => {
                        setDebugInfo('📋 All logs copied to clipboard! Paste in a text editor to view.')
                      }).catch(err => {
                        console.error('Clipboard copy failed:', err)
                        alert(fullDebugReport)
                        setDebugInfo('📋 Debug report displayed in alert.')
                      })
                    } else {
                      alert(fullDebugReport)
                      setDebugInfo('📋 Debug report displayed in alert.')
                    }
                    
                    console.log('📋 FULL DEBUG REPORT:', fullDebugReport)
                  } catch (err) {
                    console.error('Failed to copy logs:', err)
                    setDebugInfo('❌ Failed to copy logs. Check console.')
                  }
                }}
                className="w-full bg-red-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-600 transition-colors mb-3"
              >
                📋 COPY ALL LOGS (Mobile Debug)
              </button>

              <div className="space-y-1 text-gray-600">
                <div>Domain: {window.location.hostname}</div>
                <div>Storage Available: {isStorageAvailable ? 'Yes' : 'No'}</div>
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              </div>
            </div>
          )}

          {/* Guest Login */}
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

export default AuthModal
