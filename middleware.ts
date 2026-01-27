import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')

    // If authenticated and trying to access login page, redirect to admin
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Strictly protect /admin and its subroutes
        if (pathname.startsWith('/admin')) {
          return !!token
        }
        
        // Allow all other routes (public)
        return true
      },
    },
    pages: {
      signIn: '/login',
    }
  }
)

export const config = {
  matcher: ['/admin/:path*', '/login'],
}