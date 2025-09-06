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
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Menu</h3>
      <label className="block text-sm">Meal Type</label>
      <select value={mealType} onChange={e=>setMealType(e.target.value)} className="w-full p-2 border rounded mt-1">
        <option>Breakfast</option>
        <option>Lunch</option>
        <option>Dinner</option>
        <option>Late Night Dinner</option>
      </select>

      <div className="mt-3">
        <button onClick={addCategory} className="px-3 py-2 bg-green-600 text-white rounded">+ Add Category</button>
      </div>

      <div className="mt-4 space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="border p-3 rounded">
            <div className="flex items-center justify-between">
              <input value={cat.name} onChange={e=>updateCategory(cat.id, { name: e.target.value })} className="p-2 border rounded w-2/3" />
              <div>
                <button onClick={()=>removeCategory(cat.id)} className="px-2 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            </div>
            <div className="mt-2">
              {cat.dishes.map((d,i)=>(
                <div key={i} className="flex gap-2 items-center mt-2">
                  <input value={d} onChange={e=>updateDish(cat.id, i, e.target.value)} className="flex-1 p-2 border rounded" />
                  <button onClick={()=>removeDish(cat.id, i)} className="px-2 py-1 bg-red-500 text-white rounded">x</button>
                </div>
              ))}
              <button onClick={()=>addDish(cat.id)} className="mt-2 px-2 py-1 bg-gray-200 rounded">+ Dish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
