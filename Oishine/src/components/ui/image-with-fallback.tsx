'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  iconSize?: number
  fallbackText?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  iconSize = 24,
  fallbackText,
  fill = false,
  width,
  height,
  sizes = '100vw',
  priority = false
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
  }

  // Generate a consistent background color based on the alt text
  const generateBackgroundColor = (text: string) => {
    const colors = [
      'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
      'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-teal-100'
    ]
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Get initials from alt text
  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (hasError || !src) {
    return (
      <div 
        className={`flex items-center justify-center ${generateBackgroundColor(alt)} ${fallbackClassName || className}`}
      >
        {fallbackText ? (
          <span className="text-sm font-medium text-gray-600">
            {getInitials(fallbackText)}
          </span>
        ) : (
          <User 
            size={iconSize} 
            className="text-gray-400" 
          />
        )}
      </div>
    )
  }

  const imageProps = fill
    ? { fill: true, sizes }
    : { width: width || 400, height: height || 400 }

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    />
  )
}