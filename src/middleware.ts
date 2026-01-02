import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

  // Allow auth pages and API auth routes
  if (isAuthPage || isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to sign in if not authenticated
  if (!isLoggedIn) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.webp).*)',
  ],
}
