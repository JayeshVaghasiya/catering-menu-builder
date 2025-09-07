import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API base URL - uses environment variable or localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is already logged in by checking for saved token
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      // Verify token is still valid by calling the API
      fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          throw new Error('Invalid token');
        }
      })
      .then(data => {
        const userWithMenus = {
          ...data.user,
          menus: data.user.menus || []
        };
        setCurrentUser(userWithMenus);
        setToken(savedToken);
      })
      .catch(error => {
        console.error('Error validating token:', error);
        localStorage.removeItem('authToken');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password,
          ownerName: userData.ownerName,
          businessName: userData.businessName,
          phone: userData.phone,
          address: userData.address
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and set user with parsed menus
        setToken(data.token);
        const userWithMenus = {
          ...data.user,
          menus: data.user.menus || []
        };
        setCurrentUser(userWithMenus);
        localStorage.setItem('authToken', data.token);
        return userWithMenus;
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and set user with parsed menus
        setToken(data.token);
        const userWithMenus = {
          ...data.user,
          menus: data.user.menus || []
        };
        setCurrentUser(userWithMenus);
        localStorage.setItem('authToken', data.token);
        return userWithMenus;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local state
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
    }
  };

  const updateUserProfile = (updates) => {
    // For now, just update local state
    // In a full implementation, this would also call an API
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const saveMenu = async (menuData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuData })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with the saved menu
        const updatedUser = {
          ...currentUser,
          menus: [...(currentUser.menus || []), data.menu]
        };
        setCurrentUser(updatedUser);
        return data.menu;
      } else {
        throw new Error(data.error || 'Failed to save menu');
      }
    } catch (error) {
      console.error('Save menu error:', error);
      throw error;
    }
  };

  const updateMenu = async (menuId, menuData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuData })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...currentUser,
          menus: (currentUser.menus || []).map(m => 
            m.id === menuId ? { ...m, ...menuData, updatedAt: new Date().toISOString() } : m
          )
        };
        setCurrentUser(updatedUser);
      } else {
        throw new Error(data.error || 'Failed to update menu');
      }
    } catch (error) {
      console.error('Update menu error:', error);
      throw error;
    }
  };

  const deleteMenu = async (menuId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...currentUser,
          menus: (currentUser.menus || []).filter(menu => menu.id !== menuId)
        };
        setCurrentUser(updatedUser);
      } else {
        throw new Error(data.error || 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Delete menu error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    token,
    updateUserProfile,
    saveMenu,
    updateMenu,
    deleteMenu
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
