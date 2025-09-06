import React from 'react'

export default function TemplateGallery({ setTemplate }) {
  const templates = [
    {
      id: 'festival',
      name: 'Festival',
      icon: '🎉',
      description: 'Vibrant colors for celebrations',
      gradient: 'from-yellow-400 via-pink-400 to-red-400'
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      icon: '✨',
      description: 'Clean and modern design',
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      icon: '💎',
      description: 'Sophisticated and classy',
      gradient: 'from-rose-400 to-pink-600'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>🎨</span>
          <span>Choose Template</span>
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${template.gradient} p-4 text-white`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-sm opacity-90">{template.description}</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
