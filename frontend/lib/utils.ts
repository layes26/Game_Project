import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Bangladeshi Taka
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// Format date
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

// Format date relative (e.g., "2 hours ago")
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateObj)
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .trim()
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Bangladesh format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+8801|8801|01)[3-9]\d{8}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}

// Format game UID with masking for security
export function maskGameUid(uid: string): string {
  if (uid.length <= 4) return uid
  const visiblePart = uid.slice(-4)
  return '****' + visiblePart
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Calculate cart total
export function calculateCartTotal(items: any[]): number {
  return items.reduce((total, item) => total + item.totalPrice, 0)
}

// Format game name for display
export function formatGameName(name: string): string {
  // Convert common abbreviations
  const abbreviations: Record<string, string> = {
    'COD': 'Call of Duty',
    'PUBG': 'PUBG Mobile',
    'FF': 'Free Fire',
    'ML': 'Mobile Legends',
    'APEX': 'Apex Legends'
  }
  
  // Check for exact matches first
  if (abbreviations[name]) {
    return abbreviations[name]
  }
  
  // Check for partial matches
  for (const [abbr, full] of Object.entries(abbreviations)) {
    if (name.includes(abbr)) {
      return name.replace(abbr, full)
    }
  }
  
  return name
}

// Get payment method display name
export function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    'CARD': 'Credit/Debit Card',
    'BKASH': 'bKash',
    'NAGAD': 'Nagad'
  }
  return names[method] || method
}

// Get order status color
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'PENDING': 'text-yellow-500',
    'PROCESSING': 'text-blue-500',
    'COMPLETED': 'text-green-500',
    'CANCELLED': 'text-red-500',
    'FAILED': 'text-red-500'
  }
  return colors[status] || 'text-gray-500'
}

// Get payment status color
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'PENDING': 'text-yellow-500',
    'PROCESSING': 'text-blue-500',
    'COMPLETED': 'text-green-500',
    'FAILED': 'text-red-500',
    'REFUNDED': 'text-purple-500'
  }
  return colors[status] || 'text-gray-500'
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Local storage utilities
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return null
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
