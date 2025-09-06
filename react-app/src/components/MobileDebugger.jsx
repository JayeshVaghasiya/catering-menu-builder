import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function MobileDebugger() {
  const { isStorageAvailable } = useAuth()
  const [debugInfo, setDebugInfo] = useState({})
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      storageAvailable: isStorageAvailable,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localStorageTest: testLocalStorage(),
      sessionStorageTest: testSessionStorage(),
      indexedDBTest: testIndexedDB()
    }
    setDebugInfo(info)
  }, [isStorageAvailable])

  const testLocalStorage = () => {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return 'Working ✅'
    } catch (e) {
      return `Error: ${e.message} ❌`
    }
  }

  const testSessionStorage = () => {
    try {
      const test = 'test'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return 'Working ✅'
    } catch (e) {
      return `Error: ${e.message} ❌`
    }
  }

  const testIndexedDB = () => {
    try {
      return window.indexedDB ? 'Available ✅' : 'Not available ❌'
    } catch (e) {
      return `Error: ${e.message} ❌`
    }
  }

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (!isMobile && process.env.NODE_ENV === 'production') {
    return null // Only show on mobile or in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Debug Info"
      >
        🔧
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto text-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Mobile Debug Info</h3>
            <button 
              onClick={() => setShowDebug(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="border-b border-gray-100 pb-1">
                <div className="font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                <div className="text-gray-600 break-all">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                alert('Debug info copied to clipboard!')
              }}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Copy Debug Info
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
