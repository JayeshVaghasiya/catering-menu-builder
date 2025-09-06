import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89

export default forwardRef(function Preview({ brand, mealTypes, template }, ref) {
  const brandingRef = useRef(null)
  const menuRefs = useRef([])

  // Debug log to check brand data
  console.log('Preview component - brand data:', brand)
  console.log('Preview component - services:', brand?.services)

  useImperativeHandle(ref, () => ({
    exportPdf
  }))

  async function exportPdf() {
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
      
      // Create temporary full-size branding element for PDF
      const tempBrandingDiv = document.createElement('div')
      tempBrandingDiv.style.width = '794px'
      tempBrandingDiv.style.height = '1122px'
      tempBrandingDiv.style.background = colors.brandingBg
      tempBrandingDiv.style.position = 'absolute'
      tempBrandingDiv.style.left = '-9999px'
      
      // Enhanced business profile layout for PDF
      tempBrandingDiv.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; font-family: Arial, sans-serif;">
          <!-- Top Header with Large Ganapati -->
          <div style="background: linear-gradient(135deg, #FDE047 0%, #FB923C 50%, #EF4444 100%); text-align: center; padding: 50px; position: relative;">
            ${brand.ganapatiDataUrl ? `
              <img src="${brand.ganapatiDataUrl}" alt="Ganapati" 
                   style="width: 160px; height: 160px; object-fit: cover; border-radius: 50%; 
                          margin: 0 auto; border: 8px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.3);" />
            ` : `
              <div style="width: 160px; height: 160px; background: white; border-radius: 50%; 
                          display: flex; align-items: center; justify-content: center; margin: 0 auto; 
                          border: 8px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.3); font-size: 64px;">
                🕉️
              </div>
            `}
            ${brand.logoDataUrl ? `
              <img src="${brand.logoDataUrl}" alt="Logo" 
                   style="position: absolute; top: 20px; right: 20px; width: 80px; height: 80px; 
                          object-fit: cover; border-radius: 50%; border: 4px solid white; 
                          box-shadow: 0 5px 15px rgba(0,0,0,0.2);" />
            ` : ''}
            <div style="margin-top: 20px;">
              <h1 style="color: white; font-size: 42px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ${brand.businessName || 'Your Business Name'}
              </h1>
              <p style="color: white; font-size: 24px; font-weight: 500; margin: 10px 0 0 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                ${brand.tagline || 'Your tagline here'}
              </p>
            </div>
          </div>

          <!-- Main Content Area -->
          <div style="flex: 1; padding: 60px; text-align: center;">
            ${brand.services ? `
              <div style="background: rgba(255,255,255,0.9); border-radius: 20px; padding: 40px; 
                          margin-bottom: 40px; border: 2px solid #E5E7EB; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <h3 style="color: ${colors.headerColor}; font-size: 28px; font-weight: bold; margin: 0 0 20px 0;">
                  🍽️ Our Catering Services
                </h3>
                <p style="color: ${colors.textColor}; font-size: 18px; line-height: 1.6; margin: 0;">
                  ${brand.services}
                </p>
              </div>
            ` : ''}

            <div style="background: rgba(255,255,255,0.9); border-radius: 20px; padding: 40px; 
                        border: 2px solid #E5E7EB; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              <h3 style="color: ${colors.headerColor}; font-size: 28px; font-weight: bold; margin: 0 0 20px 0;">
                📞 Contact Information
              </h3>
              <div style="color: ${colors.textColor}; font-size: 18px; line-height: 1.8;">
                ${brand.contact?.split('/').map(line => `<div style="margin-bottom: 8px;">${line.trim()}</div>`).join('') || 'Contact information here'}
              </div>
            </div>

            <!-- Decorative Elements -->
            <div style="margin-top: 40px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 60px; height: 3px; background: linear-gradient(to right, transparent, #FB923C);"></div>
              <span style="margin: 0 20px; font-size: 32px;">🌟</span>
              <div style="width: 60px; height: 3px; background: linear-gradient(to left, transparent, #FB923C);"></div>
            </div>
            
            <p style="color: ${colors.categoryColor}; font-size: 16px; margin-top: 30px; font-style: italic; margin-bottom: 30px;">
              Premium Catering Services for Every Occasion
            </p>

            ${brand.services ? `
              <!-- Detailed Services Information -->
              <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; 
                          margin: 20px auto; max-width: 600px; border: 2px solid #E5E7EB; 
                          box-shadow: 0 8px 25px rgba(0,0,0,0.1); text-align: left;">
                <h3 style="color: ${colors.headerColor}; font-size: 22px; font-weight: bold; 
                           margin: 0 0 20px 0; text-align: center; border-bottom: 2px solid ${colors.headerColor}; 
                           padding-bottom: 10px;">
                  🍽️ Our Specialized Services
                </h3>
                <div style="color: ${colors.textColor}; font-size: 16px; line-height: 1.8; 
                            white-space: pre-wrap; text-align: left;">
                  ${brand.services.replace(/\n/g, '<br>')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `
      
      document.body.appendChild(tempBrandingDiv)
      
      // Add branding page
      const bCanvas = await html2canvas(tempBrandingDiv, { scale: 2 })
      const bData = bCanvas.toDataURL('image/png')
      pdf.addImage(bData, 'PNG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
      
      document.body.removeChild(tempBrandingDiv)
      
      // Add each meal type as a separate page
      for (let i = 0; i < mealTypes.length; i++) {
        const mealType = mealTypes[i]
        
        // Create temporary full-size menu element for PDF
        const tempMenuDiv = document.createElement('div')
        tempMenuDiv.style.width = '794px'
        tempMenuDiv.style.minHeight = '1122px'
        tempMenuDiv.style.background = colors.menuBg
        tempMenuDiv.style.position = 'absolute'
        tempMenuDiv.style.left = '-9999px'
        
        // Create menu content for this meal type
        tempMenuDiv.innerHTML = `
          <div style="padding: 48px;">
            <div style="text-center; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid ${colors.headerColor};">
              <h2 style="font-size: 36px; font-weight: bold; color: ${colors.headerColor}; margin-bottom: 12px;">
                ${mealType.name} Menu
              </h2>
              <p style="font-size: 20px; color: ${colors.categoryColor};">
                ${brand.businessName || 'Your Business Name'}
              </p>
              <p style="font-size: 14px; color: #6B7280; margin-top: 12px;">
                ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 32px;">
              ${mealType.categories.map(cat => `
                <div style="margin-bottom: 32px;">
                  <h3 style="font-size: 24px; font-weight: 600; color: ${colors.categoryColor}; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid ${colors.categoryColor}40;">
                    ${cat.name || 'Category'}
                  </h3>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${cat.dishes.map(dish => `
                      <div style="display: flex; align-items: flex-start; gap: 16px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colors.categoryColor}; margin-top: 8px; flex-shrink: 0;"></span>
                        <span style="font-size: 16px; line-height: 1.6; color: ${colors.textColor};">
                          ${dish || 'Dish'}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="font-size: 14px; color: #6B7280;">
                Thank you for choosing ${brand.businessName || 'us'}!
              </p>
              <div style="margin-top: 8px; font-size: 12px; color: #9CA3AF;">
                Menu created with Menu Creator
              </div>
            </div>
          </div>
        `
        
        document.body.appendChild(tempMenuDiv)
        
        // Add new page for each meal type
        if (i > 0 || true) { // Always add a new page (even for first meal type after branding)
          pdf.addPage()
        }
        
        const mCanvas = await html2canvas(tempMenuDiv, { scale: 2 })
        const mData = mCanvas.toDataURL('image/png')
        pdf.addImage(mData, 'PNG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
        
        document.body.removeChild(tempMenuDiv)
      }

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
          <p className="text-sm text-gray-600">
            Template: {template.charAt(0).toUpperCase() + template.slice(1)} • 
            {mealTypes.length} meal type{mealTypes.length !== 1 ? 's' : ''} • 
            {mealTypes.length + 1} page{mealTypes.length !== 0 ? 's' : ''} (1 branding + {mealTypes.length} menu)
          </p>
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
        <div className="bg-gray-100 p-6 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
            <span>📄</span>
            <span>Page 1: Business Profile</span>
          </h4>
          <div className="flex justify-center">
            <div 
              ref={brandingRef} 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{ 
                width: '320px', 
                height: '450px',
                background: colors.brandingBg,
                transform: 'scale(0.85)',
                transformOrigin: 'top center'
              }}
            >
              {/* Business Profile Page Layout */}
              <div className="h-full flex flex-col">
                {/* Top Header with Ganapati */}
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-center py-6 relative">
                  {brand.ganapatiDataUrl ? (
                    <img 
                      src={brand.ganapatiDataUrl} 
                      alt="Ganapati" 
                      className="w-28 h-28 object-cover rounded-full mx-auto border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                      <span className="text-4xl">🕉️</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {brand.logoDataUrl && (
                      <img 
                        src={brand.logoDataUrl} 
                        alt="Logo" 
                        className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="flex-1 p-6 text-center space-y-4">
                  <div>
                    <h1 
                      className="text-2xl font-bold leading-tight"
                      style={{ color: colors.headerColor }}
                    >
                      {brand.businessName || 'Your Business Name'}
                    </h1>
                    <p 
                      className="text-base font-medium mt-1"
                      style={{ color: colors.categoryColor }}
                    >
                      {brand.tagline || 'Your tagline here'}
                    </p>
                  </div>

                  {/* Services Section - Always show for debugging */}
                  <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h3 
                      className="text-sm font-semibold mb-3 text-center"
                      style={{ color: colors.headerColor }}
                    >
                      🍽️ Our Specialized Services
                    </h3>
                    <div 
                      className="text-xs leading-relaxed text-left"
                      style={{ 
                        color: colors.textColor,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {brand.services || 'No services added yet. Add services in Brand Settings to see them here.'}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 border border-gray-200">
                    <h3 
                      className="text-sm font-semibold mb-2"
                      style={{ color: colors.headerColor }}
                    >
                      📞 Contact Us
                    </h3>
                    <div 
                      className="text-xs leading-relaxed"
                      style={{ color: colors.textColor }}
                    >
                      {brand.contact?.split('/').map((line, index) => (
                        <div key={index} className="mb-1">{line.trim()}</div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative Footer */}
                  <div className="flex justify-center items-center space-x-2 pt-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-orange-400"></div>
                    <span className="text-lg">🌟</span>
                    <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-orange-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Pages Preview */}
        {mealTypes.map((mealType, index) => (
          <div key={mealType.id} className="bg-gray-100 p-6 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
              <span>📋</span>
              <span>Page {index + 2}: {mealType.name} Menu</span>
            </h4>
            <div className="flex justify-center">
              <div 
                ref={el => menuRefs.current[index] = el}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
                style={{ 
                  width: '320px', 
                  minHeight: '450px',
                  background: colors.menuBg,
                  transform: 'scale(0.85)',
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
                      {mealType.name} Menu
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
                    {mealType.categories && mealType.categories.length > 0 ? (
                      mealType.categories.map((cat, catIndex) => (
                        <div key={cat.id || catIndex} className="space-y-3">
                          <h3 
                            className="text-xl font-semibold border-b pb-2"
                            style={{ 
                              color: colors.categoryColor,
                              borderColor: colors.categoryColor + '40'
                            }}
                          >
                            {cat.name || `Category ${catIndex + 1}`}
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
                        <p className="text-gray-400">No categories in {mealType.name}</p>
                        <p className="text-sm text-gray-500 mt-2">Add categories to see items here</p>
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
        ))}

        {mealTypes.length === 0 && (
          <div className="bg-gray-100 p-4 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
              <span>📋</span>
              <span>Menu Pages</span>
            </h4>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meal types added</h3>
              <p className="text-gray-600">Add meal types to see menu pages here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
