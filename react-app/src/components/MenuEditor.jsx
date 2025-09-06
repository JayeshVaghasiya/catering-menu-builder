import React from 'react'

export default function MenuEditor({ 
  mealTypes, 
  setMealTypes, 
  addMealType, 
  updateMealType, 
  removeMealType, 
  addCategory, 
  updateCategory, 
  removeCategory 
}) {
  const availableMealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Tea Time', 'Dinner', 'Late Night Dinner', 'Supper']

  function addDish(mealTypeId, catId) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? {
            ...mt,
            categories: mt.categories.map(cat => 
              cat.id === catId 
                ? { ...cat, dishes: [...cat.dishes, 'New Dish'] }
                : cat
            )
          }
        : mt
    ))
  }

  function updateDish(mealTypeId, catId, index, value) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? {
            ...mt,
            categories: mt.categories.map(cat => {
              if (cat.id !== catId) return cat
              const dishes = [...cat.dishes]
              dishes[index] = value
              return { ...cat, dishes }
            })
          }
        : mt
    ))
  }

  function removeDish(mealTypeId, catId, index) {
    setMealTypes(prev => prev.map(mt => 
      mt.id === mealTypeId 
        ? {
            ...mt,
            categories: mt.categories.map(cat => 
              cat.id === catId 
                ? { ...cat, dishes: cat.dishes.filter((_, i) => i !== index) }
                : cat
            )
          }
        : mt
    ))
  }

  const getMealTypeIcon = (mealType) => {
    const icons = {
      'Breakfast': '🌅',
      'Brunch': '🥐',
      'Lunch': '☀️',
      'Tea Time': '🫖',
      'Dinner': '🌙',
      'Late Night Dinner': '⭐',
      'Supper': '🌃'
    }
    return icons[mealType] || '🍽️'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-3">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center space-x-2">
          <span>📋</span>
          <span>Menu Builder</span>
        </h3>
        <p className="text-green-100 text-xs sm:text-sm mt-1">
          Add multiple meal types with their own categories and dishes
        </p>
      </div>
      
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Add Meal Type Button */}
        <div className="flex justify-center">
          <button 
            onClick={addMealType} 
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium text-sm sm:text-base"
          >
            <span>➕</span>
            <span>Add Meal Type</span>
          </button>
        </div>

        {/* Meal Types */}
        <div className="space-y-4 sm:space-y-8">
          {mealTypes.map((mealType, mealIndex) => (
            <div key={mealType.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-gray-200 overflow-hidden">
              {/* Meal Type Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{getMealTypeIcon(mealType.name)}</span>
                    <select
                      value={mealType.name}
                      onChange={e => updateMealType(mealType.id, { name: e.target.value })}
                      className="flex-1 min-w-0 px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium bg-white text-sm sm:text-base"
                    >
                      {availableMealTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <button 
                      onClick={() => addCategory(mealType.id)} 
                      className="flex-1 sm:flex-none px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 font-medium text-xs sm:text-sm"
                    >
                      <span>➕</span>
                      <span>Category</span>
                    </button>
                    {mealTypes.length > 1 && (
                      <button 
                        onClick={() => removeMealType(mealType.id)} 
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm flex-shrink-0"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Date and Occasion Fields */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      📅 Date for {mealType.name}
                    </label>
                    <input
                      type="date"
                      value={mealType.date || ''}
                      onChange={e => updateMealType(mealType.id, { date: e.target.value })}
                      className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      🎉 Occasion Name
                    </label>
                    <input
                      type="text"
                      value={mealType.occasion || ''}
                      onChange={e => updateMealType(mealType.id, { occasion: e.target.value })}
                      placeholder="e.g., Wedding, Birthday"
                      className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
              
              {/* Categories for this Meal Type */}
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
                {mealType.categories.map((cat, catIndex) => (
                  <div key={cat.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <span className="text-white text-sm sm:text-lg font-bold flex-shrink-0">#{catIndex + 1}</span>
                          <input 
                            value={cat.name} 
                            onChange={e => updateCategory(mealType.id, cat.id, { name: e.target.value })} 
                            className="flex-1 min-w-0 px-2 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium text-sm sm:text-base"
                            placeholder="Category name"
                          />
                        </div>
                        <button 
                          onClick={() => removeCategory(mealType.id, cat.id)} 
                          className="w-full sm:w-auto px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                      {cat.dishes.map((dish, dishIndex) => (
                        <div key={dishIndex} className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-medium text-xs sm:text-sm">{dishIndex + 1}</span>
                          </div>
                          <input 
                            value={dish} 
                            onChange={e => updateDish(mealType.id, cat.id, dishIndex, e.target.value)} 
                            className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
                            placeholder="Dish name"
                          />
                          <button 
                            onClick={() => removeDish(mealType.id, cat.id, dishIndex)} 
                            className="p-2 sm:p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex-shrink-0 text-xs sm:text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => addDish(mealType.id, cat.id)} 
                        className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-green-600 text-xs sm:text-sm"
                      >
                        <span>➕</span>
                        <span>Add Dish</span>
                      </button>
                    </div>
                  </div>
                ))}

                {mealType.categories.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No categories in {mealType.name}</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Add your first category to start building this meal menu</p>
                    <button 
                      onClick={() => addCategory(mealType.id)} 
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium mx-auto text-sm sm:text-base"
                    >
                      <span>➕</span>
                      <span>Add First Category</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {mealTypes.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🍽️</div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No meal types yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start building your menu by adding your first meal type</p>
            <button 
              onClick={addMealType} 
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium mx-auto text-sm sm:text-base"
            >
              <span>➕</span>
              <span>Add First Meal Type</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
