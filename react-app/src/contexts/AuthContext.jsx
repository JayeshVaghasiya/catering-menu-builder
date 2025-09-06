import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if localStorage is available (mobile Safari private mode issues)
  const isStorageAvailable = () => {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  // Safe localStorage operations with fallbacks
  const safeSetItem = (key, value) => {
    try {
      if (isStorageAvailable()) {
        localStorage.setItem(key, value)
        return true
      } else {
        console.warn('localStorage not available, data will not persist')
        return false
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  const safeGetItem = (key, defaultValue = null) => {
    try {
      if (isStorageAvailable()) {
        const item = localStorage.getItem(key)
        return item !== null ? item : defaultValue
      }
      return defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  }

  useEffect(() => {
    // Check if user is logged in on app start with mobile-safe storage access
    const loadUser = async () => {
      try {
        // Test localStorage availability (can fail on mobile in private mode)
        if (!isStorageAvailable()) {
          console.warn('localStorage not available - using session storage')
          setLoading(false)
          return
        }

        const userData = safeGetItem('currentUser')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          // Validate user data structure
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setCurrentUser(parsedUser)
          } else {
            // Clean up corrupted user data
            if (isStorageAvailable()) {
              localStorage.removeItem('currentUser')
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        // Clean up on parse error
        try {
          if (isStorageAvailable()) {
            localStorage.removeItem('currentUser')
          }
        } catch (e) {
          console.error('Cannot access localStorage:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signup = async (userData) => {
    try {
      console.log('Signup attempt for:', userData.email) // Debug log
      
      if (!isStorageAvailable()) {
        throw new Error('Storage not available. Please enable cookies and try again.')
      }

      // Normalize email
      const normalizedEmail = (userData.email || '').trim().toLowerCase()
      
      if (!normalizedEmail) {
        throw new Error('Please enter a valid email address')
      }

      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      
      // Check if user already exists with normalized email comparison
      const existingUser = users.find(u => {
        const userEmail = (u.email || '').trim().toLowerCase()
        return userEmail === normalizedEmail
      })
      
      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        email: normalizedEmail, // Store normalized email
        createdAt: new Date().toISOString(),
        menus: []
      }

      const updatedUsers = [...users, newUser]
      const usersString = JSON.stringify(updatedUsers)
      const userString = JSON.stringify(newUser)
      
      // Save with error handling
      const usersSaved = safeSetItem('users', usersString)
      const currentUserSaved = safeSetItem('currentUser', userString)
      
      if (!usersSaved || !currentUserSaved) {
        throw new Error('Unable to create account. Please check your browser settings.')
      }
      
      setCurrentUser(newUser)
      console.log('Signup successful') // Debug log
      return newUser
    } catch (error) {
      console.error('Signup error:', error) // Debug log
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===')
      console.log('Raw email:', `"${email}"`)
      console.log('Raw password length:', password.length)
      
      if (!isStorageAvailable()) {
        throw new Error('Storage not available. Please enable cookies and try again.')
      }

      // Extra careful normalization
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const normalizedPassword = String(password || '').trim()
      
      console.log('Normalized email:', `"${normalizedEmail}"`)
      console.log('Normalized password length:', normalizedPassword.length)
      
      if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Please enter both email and password')
      }

      const usersData = safeGetItem('users', '[]')
      console.log('Users data from storage:', usersData)
      
      let users = []
      try {
        users = JSON.parse(usersData)
        console.log('Parsed users array length:', users.length)
      } catch (parseError) {
        console.error('Failed to parse users data:', parseError)
        // Reset corrupted data
        safeSetItem('users', '[]')
        users = []
      }
      
      // Log all users for debugging
      users.forEach((user, index) => {
        console.log(`User ${index}:`, {
          email: `"${user.email}"`,
          emailLength: user.email?.length,
          hasPassword: !!user.password,
          passwordLength: user.password?.length
        })
      })
      
      // FIRST: Try to find existing user with exact matching
      let foundUser = null
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const userEmail = String(user.email || '').trim().toLowerCase()
        const userPassword = String(user.password || '').trim()
        
        console.log(`Checking user ${i}:`)
        console.log(`  Stored email: "${userEmail}"`)
        console.log(`  Input email: "${normalizedEmail}"`)
        console.log(`  Email match: ${userEmail === normalizedEmail}`)
        console.log(`  Password match: ${userPassword === normalizedPassword}`)
        
        if (userEmail === normalizedEmail && userPassword === normalizedPassword) {
          foundUser = user
          console.log('EXISTING USER FOUND!')
          break
        }
      }
      
      // SECOND: If no user found, throw error (don't auto-create)
      if (!foundUser) {
        console.log('=== NO MATCHING USER FOUND ===')
        console.log('Available emails in storage:', users.map(u => `"${u.email}"`))
        throw new Error('Invalid email or password. Please check your credentials or create a new account.')
      }

      console.log('Login successful for existing user:', foundUser.email)
      
      // Set user with retry mechanism
      const userString = JSON.stringify(foundUser)
      const saveSuccess = safeSetItem('currentUser', userString)
      
      if (!saveSuccess) {
        throw new Error('Unable to save session. Please check your browser settings.')
      }
      
      setCurrentUser(foundUser)
      console.log('=== LOGIN SUCCESSFUL ===')
      return foundUser
    } catch (error) {
      console.error('=== LOGIN ERROR ===', error)
      throw error
    }
  }

  const logout = () => {
    try {
      if (isStorageAvailable()) {
        localStorage.removeItem('currentUser')
      }
      setCurrentUser(null)
      console.log('Logout successful') // Debug log
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if localStorage fails
      setCurrentUser(null)
    }
  }

  // Validate current session
  const validateSession = () => {
    try {
      if (!currentUser) return false
      
      const userData = safeGetItem('currentUser')
      if (!userData) {
        setCurrentUser(null)
        return false
      }
      
      const parsedUser = JSON.parse(userData)
      if (!parsedUser || parsedUser.id !== currentUser.id) {
        setCurrentUser(null)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Session validation error:', error)
      setCurrentUser(null)
      return false
    }
  }

  const updateUserProfile = (updates) => {
    try {
      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? { ...u, ...updates } : u
      )
      
      const updatedUser = { ...currentUser, ...updates }
      const usersString = JSON.stringify(updatedUsers)
      const userString = JSON.stringify(updatedUser)
      
      safeSetItem('users', usersString)
      safeSetItem('currentUser', userString)
      setCurrentUser(updatedUser)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Unable to update profile. Please try again.')
    }
  }

  // Storage management utility
  const getStorageSize = () => {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  const cleanupOldMenus = (userId, forceCleanup = false) => {
    try {
      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      const user = users.find(u => u.id === userId)
    
    if (user && user.menus && user.menus.length > 0) {
      let menusToKeep = 10
      
      // If forced cleanup due to storage issues, be more aggressive
      if (forceCleanup) {
        menusToKeep = Math.max(3, Math.floor(user.menus.length / 2))
      }
      
      // Keep only the most recent menus
      if (user.menus.length > menusToKeep) {
        const sortedMenus = user.menus
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, menusToKeep)
        
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, menus: sortedMenus } : u
        )
        
        localStorage.setItem('users', JSON.stringify(updatedUsers))
        
        if (currentUser.id === userId) {
          const updatedCurrentUser = { ...currentUser, menus: sortedMenus }
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser))
          setCurrentUser(updatedCurrentUser)
        }
        
        return true // Cleanup performed
      }
    }
    return false // No cleanup needed
    } catch (error) {
      console.error('Error cleaning up old menus:', error)
      return false
    }
  }

  // Emergency storage cleanup - remove all old data
  const emergencyCleanup = () => {
    try {
      // Keep only current user data and clear everything else
      const currentUserData = safeGetItem('currentUser')
      const usersData = safeGetItem('users', '[]')
      
      // Clear all localStorage
      if (isStorageAvailable()) {
        localStorage.clear()
      }
      
      // Only restore current user with minimal data
      if (currentUserData) {
        const user = JSON.parse(currentUserData)
        const minimalUser = {
          id: user.id,
          email: user.email,
          businessName: user.businessName || '',
          address: user.address || '',
          phone: user.phone || '',
          menus: [] // Start fresh with no menus
        }
        
        safeSetItem('users', JSON.stringify([minimalUser]))
        safeSetItem('currentUser', JSON.stringify(minimalUser))
        setCurrentUser(minimalUser)
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  const saveMenu = (menuData) => {
    try {
      // First, let's try to save normally
      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      const menuWithId = {
        id: Date.now().toString(),
        ...menuData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { ...u, menus: [...(u.menus || []), menuWithId] }
          : u
      )
      
      const updatedUser = {
        ...currentUser,
        menus: [...(currentUser.menus || []), menuWithId]
      }
      
      const usersString = JSON.stringify(updatedUsers)
      const userString = JSON.stringify(updatedUser)
      
      safeSetItem('users', usersString)
      safeSetItem('currentUser', userString)
      setCurrentUser(updatedUser)
      
      return menuWithId
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Try emergency cleanup first
        const cleanupSuccess = emergencyCleanup()
        
        if (!cleanupSuccess) {
          throw new Error('Unable to save menu. Please clear your browser data and try again.')
        }
        
        // Try to save again after emergency cleanup
        try {
          const menuWithId = {
            id: Date.now().toString(),
            ...menuData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          const users = [{ ...currentUser, menus: [menuWithId] }]
          const updatedUser = { ...currentUser, menus: [menuWithId] }
          
          const usersString = JSON.stringify(users)
          const userString = JSON.stringify(updatedUser)
          
          safeSetItem('users', usersString)
          safeSetItem('currentUser', userString)
          setCurrentUser(updatedUser)
          
          alert('Storage was full. We\'ve cleared old data and saved your new menu.')
          return menuWithId
        } catch (retryError) {
          throw new Error('Storage quota exceeded. Please clear your browser data (Settings > Clear browsing data) and try again.')
        }
      }
      throw error
    }
  }

  const updateMenu = (menuId, menuData) => {
    try {
      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      const updatedMenuData = {
        ...menuData,
        updatedAt: new Date().toISOString()
      }
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { 
              ...u, 
              menus: u.menus.map(m => 
                m.id === menuId ? { ...m, ...updatedMenuData } : m
              )
            }
          : u
      )
      
      const updatedUser = {
        ...currentUser,
        menus: currentUser.menus.map(m => 
          m.id === menuId ? { ...m, ...updatedMenuData } : m
        )
      }
      
      const usersString = JSON.stringify(updatedUsers)
      const userString = JSON.stringify(updatedUser)
      
      safeSetItem('users', usersString)
      safeSetItem('currentUser', userString)
      setCurrentUser(updatedUser)
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some old menus to free up space.')
      }
      throw error
    }
  }

  const deleteMenu = (menuId) => {
    try {
      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { ...u, menus: u.menus.filter(m => m.id !== menuId) }
          : u
      )
      
      const updatedUser = {
        ...currentUser,
        menus: currentUser.menus.filter(m => m.id !== menuId)
      }
      
      const usersString = JSON.stringify(updatedUsers)
      const userString = JSON.stringify(updatedUser)
      
      safeSetItem('users', usersString)
      safeSetItem('currentUser', userString)
      setCurrentUser(updatedUser)
    } catch (error) {
      console.error('Error deleting menu:', error)
      throw new Error('Unable to delete menu. Please try again.')
    }
  }

  // Debug function to create a test account for troubleshooting
  const createTestAccount = () => {
    try {
      const testUser = {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        password: '123456',
        businessName: 'Test Business',
        ownerName: 'Test Owner',
        phone: '123-456-7890',
        address: 'Test Address',
        createdAt: new Date().toISOString(),
        menus: []
      }

      const usersData = safeGetItem('users', '[]')
      const users = JSON.parse(usersData)
      
      // Remove any existing test user
      const filteredUsers = users.filter(u => u.email !== 'test@example.com')
      const updatedUsers = [...filteredUsers, testUser]
      
      const usersString = JSON.stringify(updatedUsers)
      safeSetItem('users', usersString)
      
      console.log('Test account created:', testUser)
      return testUser
    } catch (error) {
      console.error('Error creating test account:', error)
      return null
    }
  }

  // Quick login that bypasses validation issues
  const quickLogin = async (email, password) => {
    try {
      console.log('=== QUICK LOGIN ATTEMPT ===')
      
      // Normalize credentials
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const normalizedPassword = String(password || '').trim()
      
      console.log('Quick login - normalized email:', `"${normalizedEmail}"`)
      
      // Get existing users
      const usersData = safeGetItem('users', '[]')
      let users = []
      try {
        users = JSON.parse(usersData)
      } catch (parseError) {
        console.error('Quick login - failed to parse users data:', parseError)
        users = []
      }
      
      // FIRST: Try to find existing user
      let foundUser = null
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const userEmail = String(user.email || '').trim().toLowerCase()
        const userPassword = String(user.password || '').trim()
        
        if (userEmail === normalizedEmail && userPassword === normalizedPassword) {
          foundUser = user
          console.log('Quick login - found existing user:', foundUser.email)
          break
        }
      }
      
      // If existing user found, use that
      if (foundUser) {
        safeSetItem('currentUser', JSON.stringify(foundUser))
        setCurrentUser(foundUser)
        console.log('Quick login successful with existing user')
        return foundUser
      }
      
      // ONLY if no existing user found, create new one
      console.log('Quick login - no existing user found, creating new one')
      const quickUser = {
        id: 'quick-' + Date.now(),
        email: normalizedEmail,
        password: normalizedPassword,
        businessName: normalizedEmail.split('@')[0] + "'s Business",
        ownerName: normalizedEmail.split('@')[0],
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        menus: []
      }
      
      // Add new user to storage
      const updatedUsers = [...users, quickUser]
      
      safeSetItem('users', JSON.stringify(updatedUsers))
      safeSetItem('currentUser', JSON.stringify(quickUser))
      
      setCurrentUser(quickUser)
      console.log('Quick login successful with new user')
      return quickUser
    } catch (error) {
      console.error('Quick login error:', error)
      throw error
    }
  }

  // Guest login for immediate access
  const guestLogin = async () => {
    try {
      const guestUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@menubuilder.app',
        password: 'guest123',
        businessName: 'Guest Business',
        ownerName: 'Guest User',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        menus: []
      }
      
      safeSetItem('currentUser', JSON.stringify(guestUser))
      setCurrentUser(guestUser)
      console.log('Guest login successful')
      return guestUser
    } catch (error) {
      console.error('Guest login error:', error)
      throw error
    }
  }

  const value = {
    currentUser,
    login,
    quickLogin,
    guestLogin,
    signup,
    logout,
    updateUserProfile,
    saveMenu,
    updateMenu,
    deleteMenu,
    validateSession,
    createTestAccount,
    isStorageAvailable: isStorageAvailable()
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
