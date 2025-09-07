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
      console.warn('localStorage not available:', e)
      return false
    }
  }

  // Safe localStorage operations
  const safeGetItem = (key, defaultValue = null) => {
    try {
      if (!isStorageAvailable()) return defaultValue
      const item = localStorage.getItem(key)
      
      // Mobile-specific debugging for localStorage
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile && key === 'users') {
        console.log('� MOBILE localStorage GET:', {
          key,
          itemExists: !!item,
          itemLength: item?.length,
          itemPreview: item?.substring(0, 100),
          defaultValue,
          returning: item || defaultValue,
          userAgent: navigator.userAgent,
          localStorage_length: localStorage.length,
          storageQuota: navigator.storage ? 'available' : 'not_available'
        })
      }
      
      return item || defaultValue
    } catch (error) {
      console.warn(`Error getting ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  const safeSetItem = (key, value) => {
    try {
      if (!isStorageAvailable()) return false
      
      // Mobile-specific debugging for localStorage
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile && key === 'users') {
        console.log('� MOBILE localStorage SET:', {
          key,
          valueLength: value?.length,
          valuePreview: value?.substring(0, 100),
          valueType: typeof value,
          userAgent: navigator.userAgent
        })
      }
      
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Error setting ${key} in localStorage:`, error)
      return false
    }
  }

  const safeRemoveItem = (key) => {
    try {
      if (!isStorageAvailable()) return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }

  // Fix corrupted user data structure
  const fixCorruptedUserData = () => {
    try {
      console.log('🔧 FIXING CORRUPTED USER DATA')
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN FIX:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN FIX:', parseError, { usersData })
        users = []
      }
      
      let fixedCount = 0
      const fixedUsers = Array.isArray(users) ? users.map(user => {
        // Check if email field is an object instead of string
        if (user.email && typeof user.email === 'object' && user.email.email) {
          console.log('🔧 Fixing corrupted user data:', {
            id: user.id,
            oldEmail: user.email,
            newEmail: user.email.email
          })
          
          // Extract the correct fields from the nested object
          const fixedUser = {
            id: user.id,
            email: user.email.email, // Extract email string from object
            password: user.email.password || user.password,
            businessName: user.email.businessName || user.businessName || '',
            ownerName: user.email.ownerName || user.ownerName || '',
            phone: user.email.phone || user.phone || '',
            address: user.email.address || user.address || '',
            createdAt: user.createdAt || new Date().toISOString(),
            menus: user.menus || []
          }
          
          fixedCount++
          return fixedUser
        }
        
        return user
      }) : []
      
      if (fixedCount > 0) {
        safeSetItem('users', JSON.stringify(fixedUsers))
        console.log(`✅ DATA FIX COMPLETE: Fixed ${fixedCount} corrupted user records`)
      } else {
        console.log('✅ DATA FIX COMPLETE: No corrupted records found')
      }
      
      return { fixed: fixedCount, total: fixedUsers.length }
    } catch (error) {
      console.error('🚨 DATA FIX ERROR:', error)
      return { error: error.message }
    }
  }

  // Check session on mount
  useEffect(() => {
    const validateSession = () => {
      try {
        // Fix any corrupted user data first
        fixCorruptedUserData()
        
        const userData = safeGetItem('currentUser')
        const usersData = safeGetItem('users', '[]')
        let users = []
        
        try {
          users = JSON.parse(usersData) || []
          if (!Array.isArray(users)) {
            users = []
          }
        } catch (parseError) {
          console.warn('⚠️ USERS PARSE ERROR IN VALIDATION:', parseError)
          users = []
        }
        
        // Debug deployment state
        console.log('🌐 DEPLOYMENT DEBUG:', {
          domain: window.location.hostname,
          currentUser: userData ? 'exists' : 'none',
          totalUsers: users.length,
          userEmails: Array.isArray(users) ? users.map(u => u.email) : 'NOT_ARRAY',
          isProduction: window.location.hostname !== 'localhost'
        })
        
        if (userData) {
          const user = JSON.parse(userData)
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Session validation error:', error)
        // Clear corrupted data
        safeRemoveItem('currentUser')
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  const login = async (email, password) => {
    try {
      // Browser and device detection
      const isFirefox = /Firefox/.test(navigator.userAgent)
      const isChromiumBased = /Chrome|Chromium|Edge/.test(navigator.userAgent)
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isEdge = /Edg/.test(navigator.userAgent)
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isDesktop = !isMobile // Desktop is opposite of mobile
      
      console.log('🔐 LOGIN ATTEMPT - BROWSER ENGINE ANALYSIS:', { 
        email,
        emailLength: email?.length,
        passwordLength: password?.length,
        hasEmail: !!email,
        hasPassword: !!password,
        emailType: typeof email,
        passwordType: typeof password,
        // Browser engine debugging
        browserEngine: isFirefox ? 'Firefox/SpiderMonkey' : isChromiumBased ? 'Chromium/V8' : 'Other',
        isFirefox,
        isChromiumBased,
        isChrome,
        isEdge,
        isSafari,
        isMobile,
        userAgent: navigator.userAgent,
        // JavaScript engine tests
        v8Version: window.chrome?.runtime ? 'V8 detected' : 'No V8',
        firefoxVersion: isFirefox ? navigator.userAgent.match(/Firefox\/(\d+)/)?.[1] : null,
        chromeVersion: isChrome ? navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] : null,
        edgeVersion: isEdge ? navigator.userAgent.match(/Edg\/(\d+)/)?.[1] : null,
        // Input value debugging - comparing engines
        emailCharCodes: email ? Array.from(email).map(c => c.charCodeAt(0)) : [],
        passwordCharCodes: password ? Array.from(password).map(c => c.charCodeAt(0)) : [],
        emailBytes: new TextEncoder().encode(email || '').length,
        passwordBytes: new TextEncoder().encode(password || '').length,
        // Object/String handling tests
        jsonStringifyTest: JSON.stringify({test: email}),
        objectCreateTest: Object.create(null).constructor === undefined,
        domain: window.location.hostname
      })
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        // Ensure users is always an array
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR:', parseError, { usersData })
        users = []
      }
      
      console.log('📊 USER STORAGE DEBUG:', {
        totalUsers: users.length,
        userEmails: Array.isArray(users) ? users.map(u => u.email) : 'NOT_ARRAY',
        searchingFor: email,
        usersType: typeof users,
        isArray: Array.isArray(users),
        // Device-specific localStorage debugging
        deviceType: isMobile ? 'Mobile' : 'Desktop',
        localStorageLength: localStorage.length,
        usersDataRaw: usersData,
        usersDataLength: usersData?.length,
        isMobile,
        isDesktop
      })
      
      // Mobile-specific email/password comparison debugging
      if (isMobile && Array.isArray(users) && users.length > 0) {
        console.log('� MOBILE-SPECIFIC USER COMPARISON:', {
          searchEmail: email,
          searchEmailCharCodes: Array.from(email).map(c => c.charCodeAt(0)),
          searchEmailHex: Array.from(email).map(c => c.charCodeAt(0).toString(16)),
          searchPassword: password,
          searchPasswordCharCodes: Array.from(password).map(c => c.charCodeAt(0)),
          searchPasswordHex: Array.from(password).map(c => c.charCodeAt(0).toString(16)),
          users: users.map(u => ({
            storedEmail: u.email,
            storedEmailCharCodes: Array.from(u.email).map(c => c.charCodeAt(0)),
            storedEmailHex: Array.from(u.email).map(c => c.charCodeAt(0).toString(16)),
            storedPassword: u.password,
            storedPasswordCharCodes: Array.from(u.password).map(c => c.charCodeAt(0)),
            storedPasswordHex: Array.from(u.password).map(c => c.charCodeAt(0).toString(16)),
            emailEquality: u.email === email,
            passwordEquality: u.password === password,
            emailStrictEquality: Object.is(u.email, email),
            passwordStrictEquality: Object.is(u.password, password),
            emailTrimmedEquality: u.email.trim() === email.trim(),
            passwordTrimmedEquality: u.password.trim() === password.trim(),
            emailLength: u.email?.length,
            passwordLength: u.password?.length,
            searchEmailLength: email?.length,
            searchPasswordLength: password?.length,
            // Mobile keyboard detection
            hasHiddenChars: /[\u200B-\u200D\uFEFF]/.test(email) || /[\u200B-\u200D\uFEFF]/.test(password),
            emailNormalized: email.normalize('NFC'),
            passwordNormalized: password.normalize('NFC'),
            storedEmailNormalized: u.email.normalize('NFC'),
            storedPasswordNormalized: u.password.normalize('NFC')
          }))
        })
      }
      
      // Desktop comparison for reference (when on desktop)
      if (isDesktop && Array.isArray(users) && users.length > 0) {
        console.log('💻 DESKTOP USER COMPARISON:', {
          searchEmail: email,
          searchPassword: password,
          users: users.map(u => ({
            storedEmail: u.email,
            storedPassword: u.password,
            emailEquality: u.email === email,
            passwordEquality: u.password === password
          }))
        })
      }

      const user = Array.isArray(users) ? users.find(u => u.email === email && u.password === password) : null
      
      if (user) {
        console.log('✅ LOGIN SUCCESS:', { email, userId: user.id, businessName: user.businessName })
        
        // Fix any corrupted user data first
        fixCorruptedUserData()
        
        // Clean up any test accounts when real user logs in successfully
        cleanupTestAccounts()
        
        safeSetItem('currentUser', JSON.stringify(user))
        setCurrentUser(user)
        return user
      } else {
        console.log('❌ LOGIN FAILED - DETAILED DEBUG:', {
          searchEmail: email,
          searchPassword: password,
          searchEmailBytes: new TextEncoder().encode(email || '').length,
          searchPasswordBytes: new TextEncoder().encode(password || '').length,
          isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          usersIsArray: Array.isArray(users),
          usersLength: users?.length || 0,
          availableUsers: Array.isArray(users) ? users.map(u => ({
            email: u.email,
            emailMatch: u.email === email,
            passwordMatch: u.password === password,
            bothMatch: u.email === email && u.password === password,
            emailBytes: new TextEncoder().encode(u.email).length,
            passwordBytes: new TextEncoder().encode(u.password).length,
            // Character comparison for mobile debugging
            emailCharCodes: Array.from(u.email).map(c => c.charCodeAt(0)),
            passwordCharCodes: Array.from(u.password).map(c => c.charCodeAt(0)),
            searchEmailCharCodes: Array.from(email || '').map(c => c.charCodeAt(0)),
            searchPasswordCharCodes: Array.from(password || '').map(c => c.charCodeAt(0))
          })) : 'USERS_NOT_ARRAY'
        })
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('🚨 LOGIN ERROR:', error)
      throw error
    }
  }

  const signup = async (email, password, businessName) => {
    try {
      console.log('📝 SIGNUP ATTEMPT:', { email, businessName })
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          users = []
        }
      } catch (parseError) {
        console.warn('⚠️ USERS PARSE ERROR IN SIGNUP:', parseError)
        users = []
      }
      
      // Check if user already exists
      if (Array.isArray(users) && users.find(u => u.email === email)) {
        console.log('❌ SIGNUP FAILED: User already exists', email)
        throw new Error('User already exists')
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        businessName,
        createdAt: new Date().toISOString(),
        menus: []
      }

      users.push(newUser)
      safeSetItem('users', JSON.stringify(users))
      safeSetItem('currentUser', JSON.stringify(newUser))
      setCurrentUser(newUser)
      
      console.log('✅ SIGNUP SUCCESS:', { email, userId: newUser.id })
      return newUser
    } catch (error) {
      console.error('🚨 SIGNUP ERROR:', error)
      throw error
    }
  }

  // Enhanced quickLogin with comprehensive debugging and safeguards
  const quickLogin = async () => {
    try {
      console.log('🚀 QUICK LOGIN ATTEMPT - Enhanced Debug Mode')
      
      // Prevent quick login on production domains
      const isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1' &&
                          !window.location.hostname.includes('192.168')
      
      if (isProduction) {
        console.log('🚫 QUICK LOGIN BLOCKED: Production environment detected')
        throw new Error('Quick login not available on production. Please use regular login or signup.')
      }
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN QUICKLOGIN:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN QUICKLOGIN:', parseError, { usersData })
        users = []
      }
      
      console.log('📊 STORAGE STATE:')
      console.log('- Total users in storage:', users.length)
      console.log('- Current user in storage:', safeGetItem('currentUser'))
      console.log('- Domain:', window.location.hostname)
      
      // Check if there are any real (non-test) accounts
      const realUsers = Array.isArray(users) ? users.filter(user => {
        const isTest = user.email === 'test@example.com' || 
                      user.id?.startsWith('test-user-') ||
                      user.id?.startsWith('quick-') ||
                      user.businessName?.includes('Test')
        return !isTest
      }) : []
      
      console.log('🔍 ACCOUNT ANALYSIS:')
      console.log('- Real accounts found:', realUsers.length)
      console.log('- Test accounts found:', users.length - realUsers.length)
      
      if (realUsers.length > 0) {
        console.log('⚠️ PREVENTING QUICK LOGIN: Real accounts exist!')
        console.log('Real accounts:', Array.isArray(realUsers) ? realUsers.map(u => ({ 
          email: u.email, 
          businessName: u.businessName,
          id: u.id
        })) : 'REAL_USERS_NOT_ARRAY')
        throw new Error('Real accounts exist - please use regular login')
      }
      
      // Only create test account if no real accounts exist AND on development
      console.log('✅ CREATING TEST ACCOUNT: No real accounts found')
      
      const testUser = {
        id: `quick-${Date.now()}`,
        email: 'test@example.com',
        password: 'test123',
        businessName: 'Test Business',
        createdAt: new Date().toISOString(),
        menus: []
      }

      users.push(testUser)
      safeSetItem('users', JSON.stringify(users))
      safeSetItem('currentUser', JSON.stringify(testUser))
      setCurrentUser(testUser)
      
      console.log('✅ QUICK LOGIN SUCCESS - Test account created')
      return testUser
    } catch (error) {
      console.error('🚨 QUICK LOGIN ERROR:', error)
      throw error
    }
  }

  // Create a test account for emergency access
  const createTestAccount = async () => {
    try {
      console.log('🆘 CREATING EMERGENCY TEST ACCOUNT')
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN CREATE TEST:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN CREATE TEST:', parseError, { usersData })
        users = []
      }
      
      // Remove any existing test accounts first
      const filteredUsers = Array.isArray(users) ? users.filter(user => 
        user.email !== 'test@example.com' && 
        !user.id?.startsWith('test-user-') &&
        !user.id?.startsWith('quick-')
      ) : []
      
      const testUser = {
        id: `test-user-${Date.now()}`,
        email: 'test@example.com',
        password: 'test123',
        businessName: 'Emergency Test Account',
        createdAt: new Date().toISOString(),
        menus: []
      }

      filteredUsers.push(testUser)
      safeSetItem('users', JSON.stringify(filteredUsers))
      safeSetItem('currentUser', JSON.stringify(testUser))
      setCurrentUser(testUser)
      
      console.log('✅ EMERGENCY TEST ACCOUNT CREATED')
      return testUser
    } catch (error) {
      console.error('🚨 ERROR CREATING EMERGENCY ACCOUNT:', error)
      throw error
    }
  }

  // Clean up test accounts and force fresh login
  const cleanupTestAccounts = () => {
    try {
      console.log('🧹 CLEANING UP TEST ACCOUNTS')
      
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN CLEANUP:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN CLEANUP:', parseError, { usersData })
        users = []
      }
      
      const beforeCount = users.length
      
      // Remove test accounts
      const cleanUsers = Array.isArray(users) ? users.filter(user => {
        const isTest = user.email === 'test@example.com' || 
                      user.id?.startsWith('test-user-') ||
                      user.id?.startsWith('quick-') ||
                      user.businessName?.includes('Test')
        
        if (isTest) {
          console.log('🗑️ Removing test account:', {
            email: user.email,
            id: user.id,
            businessName: user.businessName
          })
        }
        
        return !isTest
      }) : []
      
      const afterCount = cleanUsers.length
      const removedCount = beforeCount - afterCount
      
      if (removedCount > 0) {
        safeSetItem('users', JSON.stringify(cleanUsers))
        console.log(`✅ CLEANUP COMPLETE: Removed ${removedCount} test accounts`)
      } else {
        console.log('✅ CLEANUP COMPLETE: No test accounts to remove')
      }
      
      return { removed: removedCount, remaining: afterCount }
    } catch (error) {
      console.error('🚨 CLEANUP ERROR:', error)
      return { error: error.message }
    }
  }

  // Debug function to show all accounts
  const debugShowAllAccounts = () => {
    try {
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN DEBUG:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN DEBUG:', parseError, { usersData })
        users = []
      }
      
      console.log('=== ALL ACCOUNTS DEBUG ===')
      console.log('Total accounts:', users.length)
      
      if (Array.isArray(users)) {
        users.forEach((user, index) => {
          const isTest = user.email === 'test@example.com' || 
                        user.id?.startsWith('test-user-') ||
                        user.id?.startsWith('quick-') ||
                        user.businessName?.includes('Test')
          
          console.log(`Account ${index + 1}:`, {
            email: user.email,
            id: user.id,
            businessName: user.businessName,
            password: user.password, // Show password for debugging
            isTest: isTest ? '⚠️ TEST ACCOUNT' : '✅ REAL ACCOUNT',
            createdAt: user.createdAt
          })
        })
      } else {
        console.log('⚠️ Users is not an array, cannot display accounts')
      }
      
      const currentUserData = safeGetItem('currentUser', '{}')
      const currentUser = JSON.parse(currentUserData)
      console.log('Current logged in user:', {
        email: currentUser.email,
        id: currentUser.id,
        businessName: currentUser.businessName
      })
      
      return { totalAccounts: users.length, accounts: users, currentUser }
    } catch (error) {
      console.error('Error in debugShowAllAccounts:', error)
      return { error: error.message }
    }
  }

  const guestLogin = async () => {
    try {
      const guestUser = {
        id: `guest-${Date.now()}`,
        email: 'guest@catering.app',
        businessName: 'Guest User',
        isGuest: true,
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

  const logout = () => {
    safeRemoveItem('currentUser')
    setCurrentUser(null)
  }

  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in')

      const updatedUser = { ...currentUser, ...updates }
      
      // Update in users array
      const usersData = safeGetItem('users', '[]')
      let users = []
      
      try {
        users = JSON.parse(usersData) || []
        if (!Array.isArray(users)) {
          console.warn('⚠️ USERS DATA NOT ARRAY IN UPDATE PROFILE:', { usersData, type: typeof users })
          users = []
        }
      } catch (parseError) {
        console.error('💥 USERS PARSE ERROR IN UPDATE PROFILE:', parseError, { usersData })
        users = []
      }
      
      const userIndex = Array.isArray(users) ? users.findIndex(u => u.id === currentUser.id) : -1
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        safeSetItem('users', JSON.stringify(users))
      }
      
      // Update current user
      safeSetItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
      
      return updatedUser
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const saveMenu = async (menuData) => {
    try {
      if (!currentUser) throw new Error('No user logged in')

      const newMenu = {
        ...menuData,
        id: Date.now().toString(),
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedUser = {
        ...currentUser,
        menus: [...(currentUser.menus || []), newMenu]
      }

      await updateUserProfile({ menus: updatedUser.menus })
      return newMenu
    } catch (error) {
      console.error('Error saving menu:', error)
      throw error
    }
  }

  const updateMenu = async (menuId, menuData) => {
    try {
      if (!currentUser) throw new Error('No user logged in')

      const updatedMenus = (currentUser.menus || []).map(menu =>
        menu.id === menuId
          ? { ...menu, ...menuData, updatedAt: new Date().toISOString() }
          : menu
      )

      await updateUserProfile({ menus: updatedMenus })
      return updatedMenus.find(m => m.id === menuId)
    } catch (error) {
      console.error('Error updating menu:', error)
      throw error
    }
  }

  const deleteMenu = async (menuId) => {
    try {
      if (!currentUser) throw new Error('No user logged in')

      const updatedMenus = (currentUser.menus || []).filter(menu => menu.id !== menuId)
      await updateUserProfile({ menus: updatedMenus })
      return true
    } catch (error) {
      console.error('Error deleting menu:', error)
      throw error
    }
  }

  const validateSession = () => {
    try {
      const userData = safeGetItem('currentUser')
      if (userData) {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        return user
      }
      return null
    } catch (error) {
      console.error('Session validation error:', error)
      safeRemoveItem('currentUser')
      return null
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
    cleanupTestAccounts,
    fixCorruptedUserData,
    debugShowAllAccounts,
    isStorageAvailable: isStorageAvailable()
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
