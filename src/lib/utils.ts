import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { JSDOM } from 'jsdom'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function calculateWordCountFromHtml(html: string): number {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  
  // Remove code elements
  const codeElements = doc.querySelectorAll('code, pre, .code')
  codeElements.forEach(el => el.remove())
  
  // Remove table elements
  const tableElements = doc.querySelectorAll('table')
  tableElements.forEach(el => el.remove())
  
  // Get text content and count words
  const textContent = doc.body.textContent || ''
  return textContent.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function readingTime(wordCount: number): string {
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  return `${readingTimeMinutes} min`
}

export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    3: 'ml-4',
    4: 'ml-8',
    5: 'ml-12',
    6: 'ml-16',
  }
  return margins[depth] || ''
}