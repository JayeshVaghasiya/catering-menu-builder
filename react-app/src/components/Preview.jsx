import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89

export default forwardRef(function Preview({ brand, mealType, categories, template }, ref) {
  const brandingRef = useRef(null)
  const menuRef = useRef(null)

  useImperativeHandle(ref, () => ({
    exportPdf
  }))

  async function exportPdf() {
    try {
      // Create temporary full-size elements for PDF
      const tempBrandingDiv = document.createElement('div')
      const tempMenuDiv = document.createElement('div')
      
      // Set full A4 size for PDF export
      tempBrandingDiv.style.width = '794px'
      tempBrandingDiv.style.height = '1122px'
      tempBrandingDiv.style.background = colors.brandingBg
      tempBrandingDiv.style.position = 'absolute'
      tempBrandingDiv.style.left = '-9999px'
      tempBrandingDiv.innerHTML = brandingRef.current.innerHTML
      
      tempMenuDiv.style.width = '794px'
      tempMenuDiv.style.minHeight = '1122px'
      tempMenuDiv.style.background = colors.menuBg
      tempMenuDiv.style.position = 'absolute'
      tempMenuDiv.style.left = '-9999px'
      tempMenuDiv.innerHTML = menuRef.current.innerHTML
      
      document.body.appendChild(tempBrandingDiv)
      document.body.appendChild(tempMenuDiv)
      
      const bCanvas = await html2canvas(tempBrandingDiv, { scale: 2 })
      const mCanvas = await html2canvas(tempMenuDiv, { scale: 2 })
      
      // Clean up
      document.body.removeChild(tempBrandingDiv)
      document.body.removeChild(tempMenuDiv)
      
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' })

      const bData = bCanvas.toDataURL('image/png')
      const mData = mCanvas.toDataURL('image/png')

      // Add branding page
      pdf.addImage(bData, 'PNG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
      // Add menu page
      pdf.addPage()
      pdf.addImage(mData, 'PNG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)

      pdf.save((brand.businessName || 'menu') + '.pdf')
    } catch (err) {
      console.error(err)
      alert('Export failed: ' + err.message)
    }
  }

  const getTemplateColors = () => {
    switch (template) {
      case 'festival':
        return {
          brandingBg: 'linear-gradient(135deg, #FFF9E6 0%, #FFE7CC 50%, #FFD1DC 100%)',
          menuBg: '#FFFFFF',
          headerColor: '#D97706',
          categoryColor: '#92400E',
          textColor: '#1F2937'
        }
      case 'minimalist':
        return {
          brandingBg: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          menuBg: '#FFFFFF',
          headerColor: '#374151',
          categoryColor: '#6B7280',
          textColor: '#1F2937'
        }
      case 'elegant':
        return {
          brandingBg: 'linear-gradient(135deg, #FDF7F7 0%, #FFEEF0 50%, #F3E8FF 100%)',
          menuBg: '#FFFFFF',
          headerColor: '#BE185D',
          categoryColor: '#831843',
          textColor: '#1F2937'
        }
      default:
        return {
          brandingBg: 'linear-gradient(135deg, #FFF9E6 0%, #FFE7CC 100%)',
          menuBg: '#FFFFFF',
          headerColor: '#D97706',
          categoryColor: '#92400E',
          textColor: '#1F2937'
        }
    }
  }

  const colors = getTemplateColors()

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Menu Preview</h3>
          <p className="text-sm text-gray-600">Template: {template.charAt(0).toUpperCase() + template.slice(1)}</p>
        </div>
        <button 
          onClick={exportPdf} 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium"
        >
          <span>📄</span>
          <span>Export PDF</span>
        </button>
      </div>

      {/* Preview Container */}
      <div className="space-y-8">
        {/* Branding Page Preview */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
            <span>📄</span>
            <span>Page 1: Branding</span>
          </h4>
          <div className="flex justify-center">
            <div 
              ref={brandingRef} 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{ 
                width: '300px', 
                height: '400px',
                background: colors.brandingBg,
                transform: 'scale(0.8)',
                transformOrigin: 'top center'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                {/* Logo Section */}
                <div className="mb-6">
                  {brand.logoDataUrl ? (
                    <img 
                      src={brand.logoDataUrl} 
                      alt="Business Logo" 
                      className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl text-white">🏪</span>
                    </div>
                  )}
                </div>

                {/* Ganapati Section */}
                <div className="mb-6">
                  {brand.ganapatiDataUrl ? (
                    <img 
                      src={brand.ganapatiDataUrl} 
                      alt="Ganapati" 
                      className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-4xl text-white">🕉️</span>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="space-y-2">
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: colors.headerColor }}
                  >
                    {brand.businessName || 'Your Business Name'}
                  </h1>
                  <p 
                    className="text-lg font-medium"
                    style={{ color: colors.categoryColor }}
                  >
                    {brand.tagline || 'Your tagline here'}
                  </p>
                  <div 
                    className="text-sm leading-relaxed mt-4"
                    style={{ color: colors.textColor }}
                  >
                    {brand.contact?.split('/').map((line, index) => (
                      <div key={index} className="mb-1">{line.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Page Preview */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
            <span>📋</span>
            <span>Page 2: Menu</span>
          </h4>
          <div className="flex justify-center">
            <div 
              ref={menuRef} 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{ 
                width: '300px', 
                minHeight: '400px',
                background: colors.menuBg,
                transform: 'scale(0.8)',
                transformOrigin: 'top center'
              }}
            >
              <div className="p-8">
                {/* Menu Header */}
                <div className="text-center mb-8 pb-4 border-b-2" style={{ borderColor: colors.headerColor }}>
                  <h2 
                    className="text-3xl font-bold mb-2"
                    style={{ color: colors.headerColor }}
                  >
                    {mealType || 'Lunch'} Menu
                  </h2>
                  <p 
                    className="text-lg"
                    style={{ color: colors.categoryColor }}
                  >
                    {brand.businessName || 'Your Business Name'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Menu Categories */}
                <div className="space-y-6">
                  {categories && categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <div key={cat.id || index} className="space-y-3">
                        <h3 
                          className="text-xl font-semibold border-b pb-2"
                          style={{ 
                            color: colors.categoryColor,
                            borderColor: colors.categoryColor + '40'
                          }}
                        >
                          {cat.name || `Category ${index + 1}`}
                        </h3>
                        <div className="space-y-2">
                          {cat.dishes && cat.dishes.length > 0 ? (
                            cat.dishes.map((dish, dishIndex) => (
                              <div 
                                key={dishIndex} 
                                className="flex items-start space-x-3"
                              >
                                <span 
                                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                  style={{ backgroundColor: colors.categoryColor }}
                                ></span>
                                <span 
                                  className="text-base leading-relaxed"
                                  style={{ color: colors.textColor }}
                                >
                                  {dish || `Dish ${dishIndex + 1}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 italic">No dishes added yet</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🍽️</div>
                      <p className="text-gray-400">No categories added yet</p>
                      <p className="text-sm text-gray-500 mt-2">Add categories to see your menu here</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    Thank you for choosing {brand.businessName || 'us'}!
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    Menu created with Menu Creator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
