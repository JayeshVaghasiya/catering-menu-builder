import React, { useState, useEffect, useRef } from 'react'
import BrandingEditor from './components/BrandingEditor'
import MenuEditor from './components/MenuEditor'
import Preview from './components/Preview'
import TemplateGallery from './components/TemplateGallery'
import sampleGanapati from './assets/sample-ganapati.jpg'

const DEFAULT = {
  businessName: 'Your Business Name',
  tagline: 'Tasty catering & events',
  contact: 'Phone / Email / Address',
  logoDataUrl: null,
  ganapatiDataUrl: null,
}

function App() {
  const [brand, setBrand] = useState(() => {
    const s = localStorage.getItem('catering_brand')
    return s ? JSON.parse(s) : { ...DEFAULT, ganapatiDataUrl: sampleGanapati }
  })
  const [mealType, setMealType] = useState('Lunch')
  const [categories, setCategories] = useState(() => {
    const s = localStorage.getItem('catering_categories')
    return s ? JSON.parse(s) : [{ id: Date.now(), name: 'Starters', dishes: ['Paneer Tikka', 'Hara Bhara Kebab'] }]
  })
  const [template, setTemplate] = useState('festival')
  const previewRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('catering_brand', JSON.stringify(brand))
  }, [brand])

  useEffect(() => {
    localStorage.setItem('catering_categories', JSON.stringify(categories))
  }, [categories])

  function updateBrand(patch) {
    setBrand(b => ({ ...b, ...patch }))
  }

  function addCategory() {
    setCategories(c => [...c, { id: Date.now(), name: 'New Category', dishes: ['New Dish'] }])
  }

  function updateCategory(id, patch) {
    setCategories(c => c.map(cat => cat.id === id ? { ...cat, ...patch } : cat))
  }

  function removeCategory(id) {
    setCategories(c => c.filter(cat => cat.id !== id))
  }

  function exportJSON() {
    const data = { brand, mealType, categories, template }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (brand.businessName || 'menu') + '.menu.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file) {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.brand) setBrand(data.brand)
        if (data.categories) setCategories(data.categories)
        if (data.mealType) setMealType(data.mealType)
        if (data.template) setTemplate(data.template)
        alert('Menu imported')
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <BrandingEditor brand={brand} updateBrand={updateBrand} setTemplate={setTemplate} template={template} />
          <div className="mt-4 bg-white p-3 rounded shadow">
            <h3 className="font-semibold mb-2">Save / Load</h3>
            <div className="flex gap-2">
              <button onClick={exportJSON} className="px-3 py-2 bg-blue-600 text-white rounded">Export JSON</button>
              <label className="px-3 py-2 bg-gray-200 rounded cursor-pointer">
                Import JSON
                <input type="file" accept="application/json" onChange={e=>importJSON(e.target.files[0])} className="hidden" />
              </label>
            </div>
          </div>

          <TemplateGallery setTemplate={setTemplate} />
        </div>

        <div className="md:col-span-2">
          <MenuEditor mealType={mealType} setMealType={setMealType} categories={categories} setCategories={setCategories}
            addCategory={addCategory} updateCategory={updateCategory} removeCategory={removeCategory} />
        </div>

        <div className="md:col-span-1">
          <Preview ref={previewRef} brand={brand} mealType={mealType} categories={categories} template={template} />
        </div>
      </div>
    </div>
  )
}

export default App
