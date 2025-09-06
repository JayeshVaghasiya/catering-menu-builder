import React, { useRef, useEffect, useState } from 'react'

export default function SecureTextarea({ value, onChange, placeholder, rows = 6, className = "" }) {
  const [internalValue, setInternalValue] = useState(value || '')
  const textareaRef = useRef(null)
  const containerRef = useRef(null)
  
  // Sync external value to internal state
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value || '')
    }
  }, [value])

  // Block ALL events that could trigger navigation
  const blockAllNavigation = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    return false
  }

  const handleSecureChange = (e) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    
    // Use setTimeout to ensure React state updates are complete
    setTimeout(() => {
      if (onChange) {
        onChange(newValue)
      }
    }, 0)
  }

  const handleSecureKeyDown = (e) => {
    // Allow only safe text input keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End'
    ]
    
    // Allow alphanumeric and common punctuation
    const isTextInput = (
      (e.key.length === 1) || 
      allowedKeys.includes(e.key) ||
      (e.ctrlKey && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase()))
    )
    
    if (!isTextInput) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return false
    }
  }

  return (
    <div 
      ref={containerRef}
      style={{
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1000,
        contain: 'layout style paint'
      }}
      onKeyDown={blockAllNavigation}
      onKeyUp={blockAllNavigation}
      onKeyPress={blockAllNavigation}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onSubmit={blockAllNavigation}
    >
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleSecureChange}
        onKeyDown={handleSecureKeyDown}
        onKeyUp={(e) => e.stopPropagation()}
        onKeyPress={(e) => e.stopPropagation()}
        onInput={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
        onBlur={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onSelect={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        placeholder={placeholder}
        rows={rows}
        className={className}
        style={{
          isolation: 'isolate',
          position: 'relative',
          zIndex: 1001,
          contain: 'layout style paint',
          outline: 'none',
          border: '2px solid #d1d5db',
          borderRadius: '8px'
        }}
        autoComplete="off"
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  )
}
