import React, { useState, useEffect } from 'react'

export default function MobileHelper() {
  const [screenInfo, setScreenInfo] = useState({})
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        touchSupport: 'ontouchstart' in window,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight
      })
      
      setIsMobile(window.innerWidth <= 768)
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
    window.addEventListener('orientationchange', updateScreenInfo)

    return () => {
      window.removeEventListener('resize', updateScreenInfo)
      window.removeEventListener('orientationchange', updateScreenInfo)
    }
  }, [])

  // Only show on mobile devices for debugging
  if (!isMobile) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-xs p-2 opacity-75">
      <div className="flex justify-between items-center">
        <span>📱 {screenInfo.width}×{screenInfo.height}</span>
        <span>{screenInfo.orientation}</span>
        <span>{screenInfo.touchSupport ? '👆 Touch' : '🖱️ Mouse'}</span>
      </div>
    </div>
  )
}
