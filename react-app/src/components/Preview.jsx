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
    // Render branding and menu separately
    try {
      const bCanvas = await html2canvas(brandingRef.current, { scale: 2 })
      const mCanvas = await html2canvas(menuRef.current, { scale: 2 })
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

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Preview & Export</h3>
      <div className="space-y-3">
        <div ref={brandingRef} className="p-6" style={{ width: '794px', height: '1122px', background: template==='festival' ? 'linear-gradient(135deg,#FFFBEB,#FFF1F2)' : template==='minimalist' ? '#fff' : '#FCF7FF' }}>
          <div className="flex flex-col items-center justify-center h-full">
            {brand.ganapatiDataUrl ? <img src={brand.ganapatiDataUrl} alt="ganapati" style={{ width: 180, height:180, objectFit:'cover', borderRadius: 90 }} /> : <div style={{width:180,height:180, borderRadius:90, background:'#FFE7C1'}} />}
            <h1 className="text-4xl mt-4">{brand.businessName}</h1>
            <p className="mt-2">{brand.tagline}</p>
            <p className="mt-1">{brand.contact}</p>
          </div>
        </div>

        <div ref={menuRef} className="p-6" style={{ width: '794px', minHeight: '1122px', background: template==='festival' ? '#fff' : '#fff' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{mealType} Menu</h2>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
            {categories.map(cat => (
              <div key={cat.id} className="mb-4">
                <h3 className="text-xl font-semibold">{cat.name}</h3>
                <ul className="list-disc pl-6">
                  {cat.dishes.map((d,i)=>(<li key={i} className="mb-1">{d}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={exportPdf} className="px-3 py-2 bg-indigo-600 text-white rounded">Export 2-page PDF</button>
        </div>
      </div>
    </div>
  )
})
