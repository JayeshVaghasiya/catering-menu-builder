import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function MenuDashboard({ onCreateNew, onEditMenu }) {
  const { currentUser, deleteMenu, logout } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const handleDeleteMenu = (menuId) => {
    deleteMenu(menuId)
    setShowDeleteConfirm(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍽️</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome, {currentUser?.ownerName || 'User'}!
                </h1>
                <p className="text-sm text-gray-600">{currentUser?.businessName}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium"
              >
                <span>➕</span>
                <span>Create New Menu</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Menus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentUser?.menus?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏪</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business</p>
                <p className="text-xl font-bold text-gray-900 truncate">
                  {currentUser?.businessName || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(currentUser?.createdAt).split(',')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menus Grid */}
        {currentUser?.menus?.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Menus</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUser.menus.map((menu) => (
                <div key={menu.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {menu.brand?.businessName || 'Untitled Menu'}
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {menu.mealTypes?.map(mt => mt.name).join(', ') || menu.mealType || 'Menu'}
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Meal Types:</span> {
                        menu.mealTypes?.length || (menu.mealType ? 1 : 0)
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Categories:</span> {
                        menu.mealTypes?.reduce((total, mt) => total + (mt.categories?.length || 0), 0) || 
                        menu.categories?.length || 0
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Template:</span> {menu.template || 'Festival'}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {menu.mealTypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {menu.mealTypes.map((mt, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {mt.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(menu.createdAt)}
                    </p>
                    {menu.updatedAt && menu.updatedAt !== menu.createdAt && (
                      <p className="text-xs text-gray-500">
                        Updated: {formatDate(menu.updatedAt)}
                      </p>
                    )}
                  </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => onEditMenu(menu)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(menu.id)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No menus yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start creating beautiful menus for your catering business. Your first menu is just a click away!
            </p>
            <button
              onClick={onCreateNew}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-3 shadow-lg font-medium mx-auto"
            >
              <span>🚀</span>
              <span>Create Your First Menu</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Menu?</h3>
                <p className="text-gray-600">
                  This action cannot be undone. Are you sure you want to delete this menu?
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMenu(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                >
                  Delete Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
