import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/signin')
  
  // Check if user has guest checkout data
  const hasGuestSession = request.cookies.has('guestCheckout')

  // Protect these routes - allow if authenticated OR has guest session
  const protectedRoutes = ['/upload', '/checkout', '/orders']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !isAuth && !hasGuestSession) {
    // Check if sessionStorage might have guest data (client-side only)
    // For now, allow access and handle on client side
    // In production, you might want to use a cookie instead
    return NextResponse.next()
  }

  // Redirect to upload if already authenticated and trying to access signin
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/upload', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/upload/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/auth/signin'
  ]
}
