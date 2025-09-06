import React from 'react'

export default function TemplateGallery({ setTemplate }) {
  return (
    <div className="mt-4 bg-white p-3 rounded shadow">
      <h3 className="font-semibold mb-2">Templates</h3>
      <div className="flex gap-2">
        <button onClick={()=>setTemplate('festival')} className="px-2 py-1 bg-gradient-to-br from-yellow-200 to-pink-200 rounded">Festival</button>
        <button onClick={()=>setTemplate('minimalist')} className="px-2 py-1 bg-gray-100 rounded">Minimalist</button>
        <button onClick={()=>setTemplate('elegant')} className="px-2 py-1 bg-rose-50 rounded">Elegant</button>
      </div>
    </div>
  )
}
