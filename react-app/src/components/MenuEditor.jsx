import React from 'react'

export default function MenuEditor({ mealType, setMealType, categories, setCategories, addCategory, updateCategory, removeCategory }) {
  function addDish(catId) {
    setCategories(c => c.map(cat => cat.id === catId ? { ...cat, dishes: [...cat.dishes, 'New Dish'] } : cat))
  }
  function updateDish(catId, index, value) {
    setCategories(c => c.map(cat => {
      if (cat.id !== catId) return cat
      const dishes = [...cat.dishes]
      dishes[index] = value
      return { ...cat, dishes }
    }))
  }
  function removeDish(catId, index) {
    setCategories(c => c.map(cat => cat.id === catId ? { ...cat, dishes: cat.dishes.filter((_,i)=>i!==index) } : cat))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>📋</span>
          <span>Menu Builder</span>
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Meal Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Meal Type (Currently: {mealType})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Breakfast', 'Lunch', 'Dinner', 'Late Night Dinner'].map(meal => (
              <button
                key={meal}
                onClick={() => {
                  console.log('Setting meal type to:', meal)
                  setMealType(meal)
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-left ${
                  mealType === meal 
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {meal === 'Breakfast' && '🌅'} 
                    {meal === 'Lunch' && '☀️'} 
                    {meal === 'Dinner' && '🌙'} 
                    {meal === 'Late Night Dinner' && '⭐'}
                  </span>
                  <span>{meal}</span>
                  {mealType === meal && (
                    <span className="ml-auto text-green-600">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Category Button */}
        <div className="flex justify-center">
          <button 
            onClick={addCategory} 
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium"
          >
            <span>➕</span>
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((cat, index) => (
            <div key={cat.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-white text-lg font-bold">#{index + 1}</span>
                    <input 
                      value={cat.name} 
                      onChange={e=>updateCategory(cat.id, { name: e.target.value })} 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-medium"
                      placeholder="Category name"
                    />
                  </div>
                  <button 
                    onClick={()=>removeCategory(cat.id)} 
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {cat.dishes.map((dish, dishIndex) => (
                  <div key={dishIndex} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-medium text-sm">{dishIndex + 1}</span>
                    </div>
                    <input 
                      value={dish} 
                      onChange={e=>updateDish(cat.id, dishIndex, e.target.value)} 
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Dish name"
                    />
                    <button 
                      onClick={()=>removeDish(cat.id, dishIndex)} 
                      className="px-3 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex-shrink-0"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={()=>addDish(cat.id)} 
                  className="w-full mt-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-green-600"
                >
                  <span>➕</span>
                  <span>Add Dish</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-6">Start building your menu by adding your first category</p>
            <button 
              onClick={addCategory} 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium mx-auto"
            >
              <span>➕</span>
              <span>Add First Category</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
