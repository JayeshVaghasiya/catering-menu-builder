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

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const signup = async (userData) => {
    try {
      // In a real app, this would be an API call
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        throw new Error('User already exists with this email')
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        menus: []
      }

      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      setCurrentUser(newUser)
      
      return newUser
    } catch (error) {
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find(u => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }

      localStorage.setItem('currentUser', JSON.stringify(user))
      setCurrentUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  const updateUserProfile = (updates) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, ...updates } : u
    )
    
    const updatedUser = { ...currentUser, ...updates }
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
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
    const users = JSON.parse(localStorage.getItem('users') || '[]')
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
  }

  // Emergency storage cleanup - remove all old data
  const emergencyCleanup = () => {
    try {
      // Keep only current user data and clear everything else
      const currentUserData = localStorage.getItem('currentUser')
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // Clear all localStorage
      localStorage.clear()
      
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
        
        localStorage.setItem('users', JSON.stringify([minimalUser]))
        localStorage.setItem('currentUser', JSON.stringify(minimalUser))
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
      const users = JSON.parse(localStorage.getItem('users') || '[]')
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
      
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
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
          
          localStorage.setItem('users', JSON.stringify(users))
          localStorage.setItem('currentUser', JSON.stringify(updatedUser))
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
      const users = JSON.parse(localStorage.getItem('users') || '[]')
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
      
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some old menus to free up space.')
      }
      throw error
    }
  }

  const deleteMenu = (menuId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, menus: u.menus.filter(m => m.id !== menuId) }
        : u
    )
    
    const updatedUser = {
      ...currentUser,
      menus: currentUser.menus.filter(m => m.id !== menuId)
    }
    
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateUserProfile,
    saveMenu,
    updateMenu,
    deleteMenu
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
