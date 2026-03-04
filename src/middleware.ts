export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/supplier/:path*', '/admin/:path*'],
}
