import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import sampleGanapati from '../assets/sample-ganapati.jpg'

export default function BrandingEditor({ brand, updateBrand, setTemplate, template }) {
  const { updateUserProfile } = useAuth()
  
  function handleImage(field, file) {
    if (!file) return
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    const reader = new FileReader()
    reader.onload = e => {
      const imageDataUrl = e.target.result
      updateBrand({ [field]: imageDataUrl })
      
      // Also update user profile for future use
      if (field === 'logoDataUrl') {
        updateUserProfile({ logoDataUrl: imageDataUrl })
      } else if (field === 'ganapatiDataUrl') {
        updateUserProfile({ ganapatiDataUrl: imageDataUrl })
      }
    }
    reader.onerror = () => {
      alert('Error reading file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  function useSampleGanapati() {
    updateBrand({ ganapatiDataUrl: sampleGanapati })
    updateUserProfile({ ganapatiDataUrl: sampleGanapati })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>🏪</span>
          <span>Brand Settings</span>
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Business Info Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input 
              value={brand.businessName} 
              onChange={e=>updateBrand({ businessName: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your business name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input 
              value={brand.tagline} 
              onChange={e=>updateBrand({ tagline: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Your catchy tagline"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
            <textarea 
              value={brand.contact} 
              onChange={e=>updateBrand({ contact: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              rows="3"
              placeholder="Phone / Email / Address"
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Business Logo</label>
            {brand.logoDataUrl && (
              <div className="mb-3">
                <img 
                  src={brand.logoDataUrl} 
                  alt="Current Logo" 
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-green-600 mt-1">✓ Logo uploaded</p>
              </div>
            )}
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e=>handleImage('logoDataUrl', e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="logo-upload"
              />
              <label 
                htmlFor="logo-upload" 
                className="flex flex-col sm:flex-row items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <span className="text-2xl mb-2 block">📸</span>
                  <span className="text-sm text-gray-600">
                    {brand.logoDataUrl ? 'Change logo' : 'Click to upload logo'}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">JPG, PNG up to 5MB</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Ganapati Image</label>
            {brand.ganapatiDataUrl && (
              <div className="mb-3">
                <img 
                  src={brand.ganapatiDataUrl} 
                  alt="Current Ganapati" 
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-green-600 mt-1">✓ Ganapati image uploaded</p>
              </div>
            )}
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e=>handleImage('ganapatiDataUrl', e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="ganapati-upload"
                />
                <label 
                  htmlFor="ganapati-upload" 
                  className="flex flex-col sm:flex-row items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🕉️</span>
                    <span className="text-sm text-gray-600">
                      {brand.ganapatiDataUrl && brand.ganapatiDataUrl !== sampleGanapati 
                        ? 'Change Ganapati image' 
                        : 'Click to upload Ganapati image'
                      }
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">JPG, PNG up to 5MB</span>
                  </div>
                </label>
              </div>
              <button 
                onClick={useSampleGanapati} 
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 font-medium text-sm"
              >
                🎨 Use Sample Ganapati
              </button>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Design Template</label>
          <select 
            value={template} 
            onChange={e=>setTemplate(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          >
            <option value="festival">🎉 Festival Theme</option>
            <option value="minimalist">✨ Minimalist Theme</option>
            <option value="elegant">💎 Elegant Theme</option>
          </select>
        </div>
      </div>
    </div>
  )
}
