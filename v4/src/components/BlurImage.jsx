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
      className={`transition-[filter] duration-700 ease-out
        ${loaded ? 'blur-0' : 'blur-[12px]'}
        ${className}`}
    />
  )
}
