import React from 'react'
import sampleGanapati from '../assets/sample-ganapati.jpg'

export default function BrandingEditor({ brand, updateBrand, setTemplate, template }) {
  function handleImage(field, file) {
    if (!file) return
    const r = new FileReader()
    r.onload = e => updateBrand({ [field]: e.target.result })
    r.readAsDataURL(file)
  }

  function useSampleGanapati() {
    updateBrand({ ganapatiDataUrl: sampleGanapati })
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Branding</h3>
      <label className="block text-sm">Business Name</label>
      <input value={brand.businessName} onChange={e=>updateBrand({ businessName: e.target.value })} className="w-full p-2 border rounded mt-1" />
      <label className="block text-sm mt-2">Tagline</label>
      <input value={brand.tagline} onChange={e=>updateBrand({ tagline: e.target.value })} className="w-full p-2 border rounded mt-1" />
      <label className="block text-sm mt-2">Contact</label>
      <input value={brand.contact} onChange={e=>updateBrand({ contact: e.target.value })} className="w-full p-2 border rounded mt-1" />

      <label className="block text-sm mt-3">Upload Logo</label>
      <input type="file" accept="image/*" onChange={e=>handleImage('logoDataUrl', e.target.files[0])} className="mt-1" />

      <label className="block text-sm mt-3">Upload Ganapati Image</label>
      <input type="file" accept="image/*" onChange={e=>handleImage('ganapatiDataUrl', e.target.files[0])} className="mt-1" />
      <div className="mt-2 flex gap-2">
        <button onClick={useSampleGanapati} className="px-2 py-1 bg-yellow-500 rounded">Use sample Ganapati</button>
      </div>

      <label className="block text-sm mt-3">Template</label>
      <select value={template} onChange={e=>setTemplate(e.target.value)} className="w-full p-2 border rounded mt-1">
        <option value="festival">Festival</option>
        <option value="minimalist">Minimalist</option>
        <option value="elegant">Elegant</option>
      </select>
    </div>
  )
}
