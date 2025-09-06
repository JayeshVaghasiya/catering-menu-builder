import React, { useRef, useEffect } from 'react'

export default function IsolatedTextarea({ value, onChange, placeholder, rows = 6, className = "" }) {
  const textareaRef = useRef(null)
  
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== (value || '')) {
      textareaRef.current.value = value || ''
    }
  }, [value])

  const handleChange = (e) => {
    // Completely isolate the change event
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    console.log('Services text changed:', e.target.value) // Debug log
    
    if (onChange) {
      // Call onChange with the actual value
      onChange(e.target.value)
    }
  }

  const preventBubbling = (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  const handleKeyDown = (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    // Only prevent specific navigation keys, allow all text input
    if (e.key === 'Escape' || (e.ctrlKey && e.key === 'Enter')) {
      e.preventDefault()
    }
  }

  return (
    <div 
      style={{ 
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1
      }}
      onClick={preventBubbling}
      onMouseDown={preventBubbling}
      onMouseUp={preventBubbling}
      onKeyDown={preventBubbling}
      onKeyUp={preventBubbling}
    >
      <textarea
        ref={textareaRef}
        defaultValue={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={preventBubbling}
        onKeyPress={preventBubbling}
        onInput={preventBubbling}
        onCopy={preventBubbling}
        onCut={preventBubbling}
        onPaste={preventBubbling}
        onSelect={preventBubbling}
        onFocus={preventBubbling}
        onBlur={preventBubbling}
        onClick={preventBubbling}
        onMouseDown={preventBubbling}
        onMouseUp={preventBubbling}
        onDoubleClick={preventBubbling}
        onContextMenu={preventBubbling}
        placeholder={placeholder}
        rows={rows}
        className={className}
        style={{ 
          isolation: 'isolate',
          position: 'relative',
          zIndex: 2
        }}
      />
    </div>
  )
}
