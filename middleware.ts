export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/upload/:path*',
    '/checkout/:path*',
    '/orders/:path*'
  ]
}
