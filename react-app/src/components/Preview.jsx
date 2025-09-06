import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89

export default forwardRef(function Preview({ brand, mealTypes, template }, ref) {
  const brandingRef = useRef(null)
  const menuRefs = useRef([])
  const [isExporting, setIsExporting] = useState(false)

  // Component body starts here
  console.log('Preview component - brand data:', brand)
  console.log('Preview component - services:', brand?.services)

  useImperativeHandle(ref, () => ({
    exportPdf
  }))

  async function exportPdf() {
    if (isExporting) return // Prevent multiple clicks
    
    setIsExporting(true)
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
          <div style="background: linear-gradient(135deg, #FDE047 0%, #FB923C 50%, #EF4444 100%); text-align: center; padding: 30px; position: relative;">
            ${brand.ganapatiDataUrl ? `
              <img src="${brand.ganapatiDataUrl}" alt="Ganapati" 
                   style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; 
                          margin: 0 auto; border: 6px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.3);" />
            ` : `
              <div style="width: 120px; height: 120px; background: white; border-radius: 50%; 
                          display: flex; align-items: center; justify-content: center; margin: 0 auto; 
                          border: 6px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-size: 48px;">
                🕉️
              </div>
            `}
            ${brand.logoDataUrl ? `
              <img src="${brand.logoDataUrl}" alt="Logo" 
                   style="position: absolute; top: 15px; right: 15px; width: 60px; height: 60px; 
                          object-fit: cover; border-radius: 50%; border: 3px solid white; 
                          box-shadow: 0 3px 10px rgba(0,0,0,0.2);" />
            ` : ''}
            <div style="margin-top: 15px;">
              <h1 style="color: white; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ${brand.businessName || 'Your Business Name'}
              </h1>
              <p style="color: white; font-size: 18px; font-weight: 500; margin: 8px 0 0 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                ${brand.tagline || 'Your tagline here'}
              </p>
            </div>
          </div>

          <!-- Main Content Area -->
          <div style="flex: 1; padding: 40px; text-align: center;">
            <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 25px; 
                        border: 2px solid #E5E7EB; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
              <h3 style="color: ${colors.headerColor}; font-size: 22px; font-weight: bold; margin: 0 0 15px 0;">
                📞 Contact Information
              </h3>
              <div style="color: ${colors.textColor}; font-size: 16px; line-height: 1.6;">
                ${brand.contact?.split('/').map(line => `<div style="margin-bottom: 6px;">${line.trim()}</div>`).join('') || 'Contact information here'}
              </div>
            </div>

            <!-- Decorative Elements -->
            <div style="margin-top: 25px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 50px; height: 2px; background: linear-gradient(to right, transparent, #FB923C);"></div>
              <span style="margin: 0 15px; font-size: 24px;">🌟</span>
              <div style="width: 50px; height: 2px; background: linear-gradient(to left, transparent, #FB923C);"></div>
            </div>
            
            <p style="color: ${colors.categoryColor}; font-size: 14px; margin-top: 20px; font-style: italic; margin-bottom: 20px;">
              Premium Catering Services for Every Occasion
            </p>

            ${brand.services ? `
              <!-- Detailed Services Information with Beautiful Bullet Points -->
              <div style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%); 
                          border-radius: 15px; padding: 25px; margin: 15px auto; max-width: 600px; 
                          border: 2px solid #FB923C; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: left;">
                <h3 style="color: ${colors.headerColor}; font-size: 20px; font-weight: bold; 
                           margin: 0 0 20px 0; text-align: center; display: flex; align-items: center; 
                           justify-content: center; gap: 10px;">
                  <span style="font-size: 22px;">🍽️</span>
                  <span>Our Specialized Catering Services</span>
                  <span style="font-size: 22px;">✨</span>
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${brand.services.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                      const cleanContent = line.trim().replace(/^[●•\-]\s*/, '').trim()
                      if (cleanContent) {
                        return `
                          <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; 
                                      border-left: 4px solid #FB923C; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                                      display: flex; align-items: flex-start; gap: 10px;">
                            <span style="color: #EA580C; font-size: 16px; font-weight: bold; 
                                         margin-top: 1px;">🔸</span>
                            <div style="flex: 1;">
                              <span style="color: ${colors.textColor}; font-size: 14px; line-height: 1.4; 
                                           font-weight: 500; text-align: left;">
                                ${cleanContent}
                              </span>
                            </div>
                          </div>
                        `
                      }
                      return ''
                    })
                    .join('')}
                </div>
                
                <!-- Decorative Bottom Border -->
                <div style="margin-top: 20px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 1px; background: linear-gradient(to right, transparent, #FB923C);"></div>
                    <span style="font-size: 16px;">🌟</span>
                    <span style="color: ${colors.categoryColor}; font-size: 12px; font-weight: 600;">
                      Premium Quality • Professional Service
                    </span>
                    <span style="font-size: 16px;">🌟</span>
                    <div style="width: 30px; height: 1px; background: linear-gradient(to left, transparent, #FB923C);"></div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `
      
      document.body.appendChild(tempBrandingDiv)
      
      // Add branding page with optimized quality for smaller file size
      const bCanvas = await html2canvas(tempBrandingDiv, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
        removeContainer: true
      })
      const bData = bCanvas.toDataURL('image/jpeg', 0.8)
      pdf.addImage(bData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
      
      document.body.removeChild(tempBrandingDiv)
      
      // Add each meal type as separate pages with automatic pagination
      for (let i = 0; i < mealTypes.length; i++) {
        const mealType = mealTypes[i]
        
        // Split categories into chunks to avoid overcrowding
        const maxCategoriesPerPage = 3 // Maximum 3 categories per page for good quality
        const categoryChunks = []
        
        for (let j = 0; j < mealType.categories.length; j += maxCategoriesPerPage) {
          categoryChunks.push(mealType.categories.slice(j, j + maxCategoriesPerPage))
        }
        
        // If no categories, create one page anyway
        if (categoryChunks.length === 0) {
          categoryChunks.push([])
        }
        
        // Create a page for each chunk of categories
        for (let chunkIndex = 0; chunkIndex < categoryChunks.length; chunkIndex++) {
          const categoriesForThisPage = categoryChunks[chunkIndex]
          const isFirstPageOfMeal = chunkIndex === 0
          const isLastPageOfMeal = chunkIndex === categoryChunks.length - 1
          
          // Create temporary full-size menu element for PDF
          const tempMenuDiv = document.createElement('div')
          tempMenuDiv.style.width = '794px'
          tempMenuDiv.style.minHeight = '1122px'
          tempMenuDiv.style.background = colors.menuBg
          tempMenuDiv.style.position = 'absolute'
          tempMenuDiv.style.left = '-9999px'
          
          // Create menu content for this page
          tempMenuDiv.innerHTML = `
            <div style="min-height: 100vh; background: linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%); 
                       padding: 40px; display: flex; flex-direction: column; box-sizing: border-box;">
              
              <!-- Header (only on first page of each meal type) -->
              ${isFirstPageOfMeal ? `
                <div style="background: linear-gradient(135deg, ${colors.headerColor} 0%, #FB923C 100%); 
                            border-radius: 20px; padding: 40px; text-align: center; position: relative; 
                            margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                  
                  <!-- Corner Food Images -->
                  <div style="position: absolute; top: 15px; left: 15px; width: 90px; height: 90px; 
                              border-radius: 50%; overflow: hidden; border: 3px solid white; 
                              box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                    <img src="/src/assets/sample-1.jpg" alt="Food" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  <div style="position: absolute; top: 15px; right: 15px; width: 90px; height: 90px; 
                              border-radius: 50%; overflow: hidden; border: 3px solid white; 
                              box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                    <img src="/src/assets/sample-2.jpg" alt="Food" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  
                  <h2 style="font-size: 36px; font-weight: bold; color: white; margin: 0; 
                             text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ${mealType.name} Menu
                  </h2>
                  ${mealType.occasion ? `
                    <p style="font-size: 24px; color: white; margin: 8px 0; 
                               text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                      🎉 ${mealType.occasion}
                    </p>
                  ` : ''}
                  <p style="font-size: 20px; color: white; margin: 10px 0; 
                             text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                    ${brand.businessName || 'Your Business Name'}
                  </p>
                  <div style="width: 100px; height: 2px; background: white; margin: 15px auto; border-radius: 1px;"></div>
                  <p style="font-size: 14px; color: rgba(255,255,255,0.9);">
                    ${mealType.date ? `📅 ${new Date(mealType.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}` : new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              ` : `
                <!-- Continuation Header for subsequent pages -->
                <div style="text-align: center; margin-bottom: 30px; padding: 20px; 
                            border-bottom: 3px solid ${colors.categoryColor};">
                  <h2 style="font-size: 28px; font-weight: bold; color: ${colors.categoryColor}; margin: 0;">
                    ${mealType.name} Menu (continued)
                  </h2>
                  <p style="font-size: 16px; color: ${colors.textColor}; margin: 8px 0;">
                    ${brand.businessName || 'Your Business Name'}
                  </p>
                </div>
              `}
              
              <!-- Menu Categories Container - Spacious Layout -->
              <div style="flex: 1; display: flex; flex-direction: column;">
                ${categoriesForThisPage.map((cat, catIndex) => `
                  <div style="background: white; border-radius: 15px; padding: 35px; margin-bottom: 30px; 
                              box-shadow: 0 5px 20px rgba(0,0,0,0.08); border-left: 5px solid ${colors.categoryColor};">
                    
                    <!-- Category Header with more space -->
                    <div style="display: flex; align-items: center; margin-bottom: 25px;">
                      <div style="width: 45px; height: 45px; background: ${colors.categoryColor}; 
                                  border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                  margin-right: 20px;">
                        <span style="font-size: 22px; color: white;">${catIndex === 0 ? '🍛' : catIndex === 1 ? '🥘' : catIndex === 2 ? '🍚' : '🍽️'}</span>
                      </div>
                      <h3 style="font-size: 26px; font-weight: 600; color: ${colors.categoryColor}; margin: 0;">
                        ${cat.name || 'Category'}
                      </h3>
                    </div>
                    
                    <!-- Dishes List with better spacing -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
                      ${cat.dishes.map(dish => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0;">
                          <div style="width: 10px; height: 10px; background: ${colors.categoryColor}; 
                                      border-radius: 50%; flex-shrink: 0;"></div>
                          <span style="font-size: 18px; line-height: 1.5; color: ${colors.textColor}; font-weight: 400;">
                            ${dish || 'Dish'}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
                
                ${categoriesForThisPage.length === 0 ? `
                  <div style="text-align: center; padding: 60px; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🍽️</div>
                    <h3 style="font-size: 24px; color: ${colors.categoryColor};">No categories in ${mealType.name}</h3>
                    <p style="font-size: 16px; margin-top: 10px;">Add categories to see items here</p>
                  </div>
                ` : ''}
              </div>
              
              <!-- Footer (only on last page of each meal type) -->
              ${isLastPageOfMeal ? `
                <div style="background: linear-gradient(135deg, #F8F9FA 0%, white 100%); 
                            border-radius: 15px; padding: 25px; text-align: center; margin-top: auto; 
                            border: 1px solid #E5E7EB; position: relative;">
                  
                  <!-- Bottom Corner Images -->
                  <div style="position: absolute; bottom: 15px; left: 15px; width: 50px; height: 50px; 
                              border-radius: 50%; overflow: hidden; border: 2px solid ${colors.categoryColor};">
                    <img src="/src/assets/sample-3.jpg" alt="Food" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  <div style="position: absolute; bottom: 15px; right: 15px; width: 50px; height: 50px; 
                              border-radius: 50%; overflow: hidden; border: 2px solid ${colors.categoryColor};">
                    <img src="/src/assets/sample-5.jpg" alt="Food" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  
                  <h4 style="font-size: 16px; font-weight: 500; color: ${colors.categoryColor}; margin: 0 0 8px 0;">
                    Thank you for choosing ${brand.businessName || 'us'}!
                  </h4>
                  <p style="font-size: 12px; color: ${colors.textColor}; margin: 0;">
                    Authentic flavors for your special occasions
                  </p>
                </div>
              ` : ''}
            </div>
          `
          
          document.body.appendChild(tempMenuDiv)
          
          // Add new page for menu content (always add a page after branding, and for subsequent pages)
          if (i === 0 && chunkIndex === 0) {
            // First meal page after branding - always add a new page
            pdf.addPage()
          } else if (i > 0 || chunkIndex > 0) {
            // Subsequent meal types or chunk pages
            pdf.addPage()
          }
          
          // Higher quality canvas settings for better text rendering (since pages have less content now)
          const mCanvas = await html2canvas(tempMenuDiv, { 
            scale: 2.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            removeContainer: true
          })
          
          // Use JPEG with high quality for smaller file size
          const mData = mCanvas.toDataURL('image/jpeg', 0.8)
          pdf.addImage(mData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
          
          document.body.removeChild(tempMenuDiv)
        }
      }

      // Add Special Notes Page if there are special notes
      if (brand.specialNotes && brand.specialNotes.trim()) {
        pdf.addPage()
        
        const tempNotesDiv = document.createElement('div')
        tempNotesDiv.style.width = A4_WIDTH_PT + 'px'
        tempNotesDiv.style.height = A4_HEIGHT_PT + 'px'
        tempNotesDiv.style.background = 'linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%)'
        tempNotesDiv.style.position = 'absolute'
        tempNotesDiv.style.left = '-9999px'
        
        // Create special notes content
        tempNotesDiv.innerHTML = `
          <div style="padding: 60px; min-height: 100vh; display: flex; flex-direction: column;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 50px;">
              <h2 style="color: ${colors.headerColor}; font-size: 36px; font-weight: bold; margin: 0 0 20px 0;">
                📝 Special Notes & Terms
              </h2>
              <p style="color: ${colors.categoryColor}; font-size: 20px; margin: 0;">
                ${brand.businessName || 'Your Business Name'}
              </p>
              <div style="width: 120px; height: 3px; background: linear-gradient(135deg, ${colors.headerColor}, #FB923C); 
                          margin: 20px auto; border-radius: 2px;"></div>
            </div>
            
            <!-- Special Notes with Beautiful Bullet Points -->
            <div style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%); 
                        border-radius: 20px; padding: 40px; flex: 1; 
                        border: 3px solid #FB923C; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
              <div style="display: flex; flex-direction: column; gap: 15px;">
                ${brand.specialNotes.split('\n')
                  .filter(line => line.trim())
                  .map(line => {
                    const cleanContent = line.trim().replace(/^[●•\-]\s*/, '').trim()
                    if (cleanContent) {
                      return `
                        <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 20px; 
                                    border-left: 5px solid #FB923C; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                    display: flex; align-items: flex-start; gap: 15px;">
                          <span style="color: #EA580C; font-size: 24px; font-weight: bold; 
                                       margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">🔸</span>
                          <div style="flex: 1;">
                            <span style="color: ${colors.textColor}; font-size: 18px; line-height: 1.6; 
                                         font-weight: 500; text-align: left;">
                              ${cleanContent}
                            </span>
                          </div>
                        </div>
                      `
                    }
                    return ''
                  })
                  .join('')}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px;">
              <div style="display: inline-flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 2px; background: linear-gradient(to right, transparent, #FB923C);"></div>
                <span style="font-size: 20px;">⭐</span>
                <span style="color: ${colors.categoryColor}; font-size: 16px; font-weight: 600;">
                  Thank you for choosing ${brand.businessName || 'us'}
                </span>
                <span style="font-size: 20px;">⭐</span>
                <div style="width: 40px; height: 2px; background: linear-gradient(to left, transparent, #FB923C);"></div>
              </div>
            </div>
          </div>
        `
        
        document.body.appendChild(tempNotesDiv)
        
        // Optimized canvas settings for special notes page
        const notesCanvas = await html2canvas(tempNotesDiv, { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          removeContainer: true
        })
        const notesData = notesCanvas.toDataURL('image/jpeg', 0.8)
        pdf.addImage(notesData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT)
        
        document.body.removeChild(tempNotesDiv)
      }

      pdf.save((brand.businessName || 'menu') + '.pdf')
    } catch (err) {
      console.error(err)
      alert('Export failed: ' + err.message)
    } finally {
      setIsExporting(false) // Re-enable button after export completes
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
            Auto-pagination for quality (max 3 categories per page)
          </p>
        </div>
        <button 
          onClick={exportPdf} 
          disabled={isExporting}
          className={`px-6 py-3 bg-gradient-to-r ${isExporting 
            ? 'from-gray-400 to-gray-500 cursor-not-allowed' 
            : 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          } text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium disabled:opacity-70`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Export PDF</span>
            </>
          )}
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
                width: '600px', 
                height: '800px',
                background: colors.brandingBg,
                transformOrigin: 'top center'
              }}
            >
              {/* Business Profile Page Layout */}
              <div className="h-full flex flex-col">
                {/* Top Header with Ganapati */}
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-center py-8 relative">
                  {brand.ganapatiDataUrl ? (
                    <img 
                      src={brand.ganapatiDataUrl} 
                      alt="Ganapati" 
                      className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                      <span className="text-5xl">🕉️</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {brand.logoDataUrl && (
                      <img 
                        src={brand.logoDataUrl} 
                        alt="Logo" 
                        className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="flex-1 p-8 text-center space-y-6">
                  <div>
                    <h1 
                      className="text-3xl font-bold leading-tight"
                      style={{ color: colors.headerColor }}
                    >
                      {brand.businessName || 'Your Business Name'}
                    </h1>
                    <p 
                      className="text-lg font-medium mt-2"
                      style={{ color: colors.categoryColor }}
                    >
                      {brand.tagline || 'Your tagline here'}
                    </p>
                  </div>

                  {/* Services Section - Always show for debugging */}
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-6 border-2 border-orange-200 shadow-sm">
                    <h3 
                      className="text-lg font-bold mb-4 text-center flex items-center justify-center space-x-2"
                      style={{ color: colors.headerColor }}
                    >
                      <span className="text-xl">🍽️</span>
                      <span>Our Specialized Services</span>
                      <span className="text-xl">✨</span>
                    </h3>
                    <div className="space-y-3">
                      {brand.services ? (
                        brand.services.split('\n').filter(line => line.trim()).map((line, index) => {
                          // Remove existing bullet symbols if present and use our own
                          const cleanContent = line.trim().replace(/^[●•\-]\s*/, '').trim()
                          
                          if (cleanContent) {
                            return (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-white bg-opacity-60 rounded-md">
                                <span className="text-orange-500 font-bold text-lg mt-0.5">🔸</span>
                                <span 
                                  className="text-sm leading-relaxed flex-1"
                                  style={{ color: colors.textColor }}
                                >
                                  {cleanContent}
                                </span>
                              </div>
                            )
                          }
                          return null
                        })
                      ) : (
                        <div className="text-center py-4">
                          <span className="text-xs text-gray-400 italic">
                            No services added yet. Add services in Brand Settings to see them here.
                          </span>
                        </div>
                      )}
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
                className="shadow-lg rounded-lg overflow-hidden flex flex-col"
                style={{ 
                  width: '600px', 
                  minHeight: '800px',
                  background: 'linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%)',
                  transformOrigin: 'top center'
                }}
              >
                {/* Clean Header with Sample Images */}
                <div 
                  className="text-center p-10 relative"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.headerColor} 0%, #FB923C 100%)`,
                    borderRadius: '20px 20px 0 0'
                  }}
                >
                  {/* Corner Food Images */}
                  <div className="absolute top-4 left-4 w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img src="/src/assets/sample-1.jpg" alt="Food" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img src="/src/assets/sample-2.jpg" alt="Food" className="w-full h-full object-cover" />
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-3 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    {mealType.name} Menu
                  </h2>
                  {mealType.occasion && (
                    <p className="text-2xl text-white mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                      🎉 {mealType.occasion}
                    </p>
                  )}
                  <p className="text-xl text-white mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    {brand.businessName || 'Your Business Name'}
                  </p>
                  <div className="w-24 h-0.5 bg-white mx-auto rounded mb-3"></div>
                  {mealType.date ? (
                    <p className="text-sm text-white opacity-90">
                      📅 {new Date(mealType.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-white opacity-90">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>

                {/* Clean Menu Categories */}
                <div className="p-10 space-y-6">
                  {mealType.categories && mealType.categories.length > 0 ? (
                    mealType.categories.map((cat, catIndex) => (
                      <div key={cat.id || catIndex} className="bg-white rounded-2xl p-8 shadow-md" style={{ borderLeft: `5px solid ${colors.categoryColor}` }}>
                        {/* Category Header */}
                        <div className="flex items-center mb-5">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-4 text-white text-xl"
                            style={{ backgroundColor: colors.categoryColor }}
                          >
                            {catIndex === 0 ? '🍛' : catIndex === 1 ? '🥘' : catIndex === 2 ? '🍚' : '🍽️'}
                          </div>
                          <h3 className="text-2xl font-semibold" style={{ color: colors.categoryColor }}>
                            {cat.name || `Category ${catIndex + 1}`}
                          </h3>
                        </div>
                        
                        {/* Simple Dishes Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {cat.dishes && cat.dishes.length > 0 ? (
                            cat.dishes.map((dish, dishIndex) => (
                              <div key={dishIndex} className="flex items-center gap-3 py-2">
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors.categoryColor }}
                                ></div>
                                <span className="text-base leading-relaxed" style={{ color: colors.textColor }}>
                                  {dish || `Dish ${dishIndex + 1}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 italic text-lg col-span-2">No dishes added yet</p>
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
                  
                  {/* Simple Footer with Sample Images - Moved to Bottom */}
                </div>
                
                {/* Footer at Bottom of Page */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-200 relative mt-auto">
                  {/* Bottom Corner Images */}
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: colors.categoryColor }}>
                    <img src="/src/assets/sample-3.jpg" alt="Food" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: colors.categoryColor }}>
                    <img src="/src/assets/sample-5.jpg" alt="Food" className="w-full h-full object-cover" />
                  </div>
                  
                  <h4 className="text-base font-medium mb-2" style={{ color: colors.categoryColor }}>
                    Thank you for choosing {brand.businessName || 'us'}!
                  </h4>
                  <p className="text-xs" style={{ color: colors.textColor }}>
                    Authentic flavors for your special occasions
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Special Notes Page Preview */}
        {brand.specialNotes && brand.specialNotes.trim() && (
          <div className="bg-gray-100 p-6 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
              <span>📝</span>
              <span>Page {mealTypes.length + 2}: Special Notes & Terms</span>
            </h4>
            <div className="flex justify-center">
              <div 
                className="shadow-lg rounded-lg overflow-hidden"
                style={{ 
                  width: '600px', 
                  minHeight: '800px',
                  background: 'linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%)',
                  transformOrigin: 'top center'
                }}
              >
                {/* Header */}
                <div className="text-center p-12">
                  <h2 className="text-4xl font-bold mb-5" style={{ color: colors.headerColor }}>
                    📝 Special Notes & Terms
                  </h2>
                  <p className="text-xl mb-5" style={{ color: colors.categoryColor }}>
                    {brand.businessName || 'Your Business Name'}
                  </p>
                  <div className="w-24 h-1 mx-auto rounded" style={{ background: `linear-gradient(135deg, ${colors.headerColor}, #FB923C)` }}></div>
                </div>
                
                {/* Special Notes */}
                <div className="px-10 pb-10">
                  <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 rounded-2xl p-8 border-2 border-orange-300 shadow-xl">
                    <div className="space-y-4">
                      {brand.specialNotes.split('\n').filter(line => line.trim()).map((line, index) => {
                        const cleanContent = line.trim().replace(/^[●•\-]\s*/, '').trim()
                        
                        if (cleanContent) {
                          return (
                            <div key={index} className="bg-white/80 rounded-xl p-5 border-l-4 border-orange-500 shadow-md flex items-start gap-4">
                              <span className="text-orange-600 text-xl font-bold mt-1">🔸</span>
                              <span className="text-gray-700 text-lg leading-relaxed font-medium flex-1">
                                {cleanContent}
                              </span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
                        <span className="text-xl">⭐</span>
                        <span className="text-orange-700 text-base font-semibold">
                          Thank you for choosing {brand.businessName || 'us'}
                        </span>
                        <span className="text-xl">⭐</span>
                        <div className="w-10 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
