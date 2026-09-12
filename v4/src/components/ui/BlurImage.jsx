import { useState } from 'react'

export default function BlurImage({ src, alt, className = '', onClick, dataCursor }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <img
      src={src}
      alt={alt || ''}
      onLoad={() => setLoaded(true)}
      onClick={onClick}
      data-cursor={dataCursor || 'view'}
      className={`transition-[filter,transform,opacity] duration-[900ms]
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${loaded ? 'blur-0 scale-100 opacity-100' : 'blur-xl scale-[1.04] opacity-0'}
        ${className}`}
    />
  )
}
