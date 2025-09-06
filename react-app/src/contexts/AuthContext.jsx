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

  const saveMenu = (menuData) => {
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
  }

  const updateMenu = (menuId, menuData) => {
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
