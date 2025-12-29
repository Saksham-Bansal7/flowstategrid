// middleware.ts (in root directory, next to app/)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isRooms = req.nextUrl.pathname.startsWith("/rooms");
    const isProfile = req.nextUrl.pathname.startsWith("/profile");
    const isFeed = req.nextUrl.pathname.startsWith("/feed");
    const isAccount = req.nextUrl.pathname.startsWith("/account");
    const isStudyAssistant = req.nextUrl.pathname.startsWith("/rag");
    const isCalendar = req.nextUrl.pathname.startsWith("/calendar");
    
    const isProtected = isDashboard || isRooms || isProfile || isFeed || isAccount || isStudyAssistant || isCalendar;

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (isProtected && !isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Always run the middleware function
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/rooms/:path*",
    "/feed",// only /feed path is protected (not /feed/:id etc)
    "/account/:path*",
    "/rag/:path*",
    "/calendar/:path*",
    
    // Auth routes (to redirect if already logged in)
    "/auth/signin",
    "/auth/signup",
    
    // Exclude these paths from middleware
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};