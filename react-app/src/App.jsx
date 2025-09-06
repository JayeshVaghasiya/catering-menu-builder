import React, { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthModal from './components/AuthModal'
import MenuDashboard from './components/MenuDashboard'
import BrandingEditor from './components/BrandingEditor'
import MenuEditor from './components/MenuEditor'
import Preview from './components/Preview'
import TemplateGallery from './components/TemplateGallery'
import sampleGanapati from './assets/sample-ganapati.jpg'

function MenuCreator({ editingMenu = null, onSave, onCancel }) {
  const { currentUser, saveMenu, updateMenu } = useAuth()
  
  // Add storage cleanup function
  const clearStorage = () => {
    if (confirm('This will clear all stored menus and data. Are you sure?')) {
      localStorage.clear()
      alert('Storage cleared! Please refresh the page and sign in again.')
      window.location.reload()
    }
  }
  
  // Initialize with user's saved brand info or defaults
  const getInitialBrand = () => {
    if (editingMenu?.brand) {
      // Ensure backward compatibility - add services and specialNotes fields if they don't exist
      return {
        ...editingMenu.brand,
        services: editingMenu.brand.services || '',
        specialNotes: editingMenu.brand.specialNotes || ''
      }
    }
    
    if (currentUser) {
      return {
        businessName: currentUser.businessName || 'Your Business Name',
        tagline: currentUser.tagline || 'Tasty catering & events',
        contact: `${currentUser.phone || 'Phone'} / ${currentUser.email} / ${currentUser.address || 'Address'}`,
        services: currentUser.services || '',
        specialNotes: currentUser.specialNotes || '',
        logoDataUrl: currentUser.logoDataUrl || null,
        ganapatiDataUrl: currentUser.ganapatiDataUrl || sampleGanapati,
      }
    }
    
    return {
      businessName: 'Your Business Name',
      tagline: 'Tasty catering & events',
      contact: 'Phone / Email / Address',
      services: '',
      specialNotes: '',
      logoDataUrl: null,
      ganapatiDataUrl: sampleGanapati,
    }
  }

  const [brand, setBrand] = useState(getInitialBrand)
  const [mealTypes, setMealTypes] = useState(editingMenu?.mealTypes || [
    {
      id: Date.now(),
      name: 'Lunch',
      categories: [
        { id: Date.now() + 1, name: 'Starters', dishes: ['Paneer Tikka', 'Hara Bhara Kebab'] }
      ]
    }
  ])
  const [template, setTemplate] = useState(editingMenu?.template || 'festival')
  const [isSaving, setIsSaving] = useState(false)
  const previewRef = useRef(null)

  function updateBrand(patch) {
    console.log('updateBrand called with patch:', patch)
    console.log('Current brand before update:', brand)
    setBrand(b => {
      const newBrand = { ...b, ...patch }
      console.log('New brand after update:', newBrand)
      return newBrand
    })
  }

  function addMealType() {
    const newMealType = {
      id: Date.now(),
      name: 'Breakfast', // Default to first available
      date: '', // Date for this meal type
      occasion: '', // Occasion name for this meal type
      categories: [
        { id: Date.now() + 1, name: 'New Category', dishes: ['New Dish'] }
      ]
    }
    setMealTypes(prev => [newMealType, ...prev]) // Add to the top instead of bottom
  }

  function updateMealType(mealTypeId, updates) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId ? { ...mt, ...updates } : mt
    ))
  }

  function removeMealType(mealTypeId) {
    setMealTypes(prev => prev.filter(mt => mt.id !== mealTypeId))
  }

  function addCategory(mealTypeId) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? { 
            ...mt, 
            categories: [{ // Add new category to the top
              id: Date.now(), 
              name: 'New Category', 
              dishes: ['New Dish'] 
            }, ...mt.categories] 
          }
        : mt
    ))
  }

  function updateCategory(mealTypeId, categoryId, patch) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? {
            ...mt,
            categories: mt.categories.map(cat => 
              cat.id === categoryId ? { ...cat, ...patch } : cat
            )
          }
        : mt
    ))
  }

  function removeCategory(mealTypeId, categoryId) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? {
            ...mt,
            categories: mt.categories.filter(cat => cat.id !== categoryId)
          }
        : mt
    ))
  }

  // Remove unused exportJSON and importJSON functions since buttons are removed

  const handleSaveMenu = async () => {
    setIsSaving(true)
    try {
      console.log('Saving menu with brand:', brand) // Debug log
      const menuData = { brand, mealTypes, template }
      
      if (editingMenu) {
        updateMenu(editingMenu.id, menuData)
      } else {
        saveMenu(menuData)
      }
      
      onSave?.()
    } catch (error) {
      alert('Error saving menu: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile-Responsive Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {editingMenu ? 'Edit Menu' : 'Create Menu'}
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Design beautiful catering menus</p>
                </div>
              </div>
              
              {/* Mobile Cancel Button */}
              <button 
                onClick={onCancel}
                className="lg:hidden px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ←
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleSaveMenu}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>{editingMenu ? 'Update Menu' : 'Save Menu'}</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={clearStorage}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                title="Clear all stored data if experiencing storage issues"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Clear</span>
              </button>
              
              <button 
                onClick={onCancel}
                className="hidden lg:block px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {/* Mobile: Stacked Layout */}
        <div className="lg:hidden space-y-6">
          <BrandingEditor brand={brand} updateBrand={updateBrand} setTemplate={setTemplate} template={template} />
          <TemplateGallery setTemplate={setTemplate} />
          <MenuEditor 
            mealTypes={mealTypes}
            setMealTypes={setMealTypes}
            addMealType={addMealType}
            updateMealType={updateMealType}
            removeMealType={removeMealType}
            addCategory={addCategory}
            updateCategory={updateCategory}
            removeCategory={removeCategory}
          />
          {/* Mobile Preview at Bottom */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>👁️</span>
                <span>Live Preview</span>
              </h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <Preview 
                ref={previewRef} 
                brand={brand} 
                mealTypes={mealTypes} 
                template={template} 
              />
            </div>
          </div>
        </div>

        {/* Mobile Floating Export Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-20">
          <button
            onClick={() => previewRef.current?.exportPdf()}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
          >
            <span className="text-xl">📄</span>
          </button>
        </div>

        {/* Desktop: Vertical Layout with Preview at Bottom */}
        <div className="hidden lg:block space-y-8">
          {/* Top Section: Brand & Menu Editor */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <BrandingEditor brand={brand} updateBrand={updateBrand} setTemplate={setTemplate} template={template} />
              <TemplateGallery setTemplate={setTemplate} />
            </div>

            <div className="lg:col-span-2">
              <MenuEditor 
                mealTypes={mealTypes}
                setMealTypes={setMealTypes}
                addMealType={addMealType}
                updateMealType={updateMealType}
                removeMealType={removeMealType}
                addCategory={addCategory}
                updateCategory={updateCategory}
                removeCategory={removeCategory}
              />
            </div>
          </div>

          {/* Bottom Section: Full Width Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>👁️</span>
                <span>Live Preview & Export</span>
              </h3>
            </div>
            <div className="p-6">
              <Preview 
                ref={previewRef} 
                brand={brand} 
                mealTypes={mealTypes} 
                template={template} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { currentUser } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' or 'creator'
  const [editingMenu, setEditingMenu] = useState(null)

  // Show auth modal if no user is logged in - only on login/logout, not on profile updates
  useEffect(() => {
    if (!currentUser) {
      setShowAuthModal(true)
      setCurrentView('dashboard')
    } else {
      setShowAuthModal(false)
      // Don't force navigation on user profile updates
    }
  }, [currentUser?.id]) // Only depend on user ID, not the entire user object

  const handleCreateNew = () => {
    setEditingMenu(null)
    setCurrentView('creator')
  }

  const handleEditMenu = (menu) => {
    setEditingMenu(menu)
    setCurrentView('creator')
  }

  const handleSaveMenu = () => {
    setCurrentView('dashboard')
    setEditingMenu(null)
  }

  const handleCancelEdit = () => {
    setCurrentView('dashboard')
    setEditingMenu(null)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🍽️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Menu Creator</h1>
          <p className="text-xl text-gray-600 mb-8">Design beautiful catering menus for your business</p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true) }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium"
            >
              <span>🚀</span>
              <span>Get Started</span>
            </button>
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium"
            >
              <span>🔓</span>
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            isSignup={authMode === 'signup'}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </div>
    )
  }

  if (currentView === 'creator') {
    return (
      <MenuCreator
        editingMenu={editingMenu}
        onSave={handleSaveMenu}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <MenuDashboard
      onCreateNew={handleCreateNew}
      onEditMenu={handleEditMenu}
    />
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
