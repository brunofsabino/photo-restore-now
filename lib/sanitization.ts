/**
 * Input Sanitization Utilities
 * Protects against XSS, SQL injection, and other attacks
 */

// Sanitize email
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w.@+-]/g, '') // Only allow alphanumeric, dots, @, +, -
    .substring(0, 254); // RFC 5321 max length
}

// Sanitize name (for guest checkout)
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100); // Limit length
}

// Sanitize general text input
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML special chars
    .replace(/\s+/g, ' ')
    .substring(0, 500);
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// Escape HTML to prevent XSS
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Remove potential SQL injection patterns
export function sanitizeSqlInput(input: string): string {
  // Remove common SQL injection patterns
  return input
    .replace(/['";\\]/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b/gi, '')
    .trim();
}

// Sanitize phone number
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-() ]/g, '').substring(0, 20);
}

// Validate and sanitize package ID
export function sanitizePackageId(packageId: string): string | null {
  // Only allow specific format: number-photo
  const validPattern = /^(\d+)-photo$/;
  if (validPattern.test(packageId)) {
    return packageId;
  }
  return null;
}
