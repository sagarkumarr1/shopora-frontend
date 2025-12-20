import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define paths that are protected
    const isProtectedPath = path.startsWith('/admin');

    // Check for token in cookies
    const token = request.cookies.get('token')?.value;

    if (isProtectedPath && !token) {
        // Redirect to login if accessing admin without token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If token exists, we can't easily verify signature in middleware edge runtime without jose or similar
    // So we rely on the client-side layout to check the actual role. 
    // Middleware just ensures they are at least logged in (have a token).
    // Ideally, valid token check is done here, but role check can be done in layout or server component.

    return NextResponse.next();
}

// Config to match only admin routes
export const config = {
    matcher: '/admin/:path*',
};
