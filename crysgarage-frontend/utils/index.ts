import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/flac', 'audio/aiff']
  const maxSize = 100 * 1024 * 1024 // 100MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file format. Please use WAV, MP3, FLAC, or AIFF files.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 100MB.' }
  }
  
  return { valid: true }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'free':
      return 'text-green-400'
    case 'professional':
      return 'text-blue-400'
    case 'advanced':
      return 'text-purple-400'
    default:
      return 'text-crys-gold'
  }
}

export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'free':
      return 'bg-green-500/20 text-green-400'
    case 'professional':
      return 'bg-blue-500/20 text-blue-400'
    case 'advanced':
      return 'bg-purple-500/20 text-purple-400'
    default:
      return 'bg-crys-gold/20 text-crys-gold'
  }
}

export function getGenreIcon(genre: string): string {
  switch (genre) {
    case 'afrobeats':
      return '🎵'
    case 'gospel':
      return '🙏'
    case 'hip_hop':
      return '🎤'
    case 'highlife':
      return '🥁'
    default:
      return '🎶'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
} 