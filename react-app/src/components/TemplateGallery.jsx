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
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center space-x-2">
          <span>🎨</span>
          <span>Choose Template</span>
        </h3>
      </div>
      
      <div className="p-3 sm:p-6">
        <div className="grid gap-2 sm:gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 w-full"
            >
              <div className={`bg-gradient-to-r ${template.gradient} p-3 sm:p-4 text-white`}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{template.icon}</span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base">{template.name}</div>
                    <div className="text-xs sm:text-sm opacity-90 truncate">{template.description}</div>
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
