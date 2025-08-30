// Optimized word counting without JSDOM for better performance
export function calculateWordCountFromHtml(html: string): number {
  if (!html) return 0
  
  // Simple HTML tag removal using regex (faster than DOM parsing)
  let text = html
    // Remove script and style elements and their content
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove code blocks and inline code
    .replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove table elements
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '')
    // Remove HTML tags but keep text content
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
  
  // Count words
  return text ? text.split(' ').filter(word => word.length > 0).length : 0
}