import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["en", "es", "fr", "pt"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value: string, key: string) => (negotiatorHeaders[key] = value));

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    return match(languages, locales, defaultLocale);
  } catch {
    return defaultLocale;
  }
}

const isProtectedRoute = createRouteMatcher(['(.*)/dashboard(.*)']);
const isAuthRoute = createRouteMatcher(['(.*)/login(.*)', '(.*)/register(.*)']);
const isPricingRoute = createRouteMatcher(['(.*)/pricing(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Ignored paths for internationalization (static files, Next.js assets, api routes)
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect if there is no locale
    const locale = getLocale(req);
    req.nextUrl.pathname = `/${locale}${pathname}`;
    // e.g. incoming request is /dashboard
    // The new URL is now /en/dashboard
    return NextResponse.redirect(req.nextUrl);
  }
  
  const { userId } = await auth();
  const activeLocale = pathname.split('/')[1] || getLocale(req);

  // Redirect unknown routes based on auth status
  const isHomeRoute = locales.some(l => pathname === `/${l}` || pathname === `/${l}/`);
  const isKnownRoute = isProtectedRoute(req) || isAuthRoute(req) || isPricingRoute(req) || isHomeRoute;

  if (!isKnownRoute) {
    if (userId) {
      return NextResponse.redirect(new URL(`/${activeLocale}/dashboard`, req.url));
    } else {
      return NextResponse.redirect(new URL(`/${activeLocale}/login`, req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL(`/${activeLocale}/dashboard`, req.url));
  }

  // Protect private routes (Manual redirect to keep URL clean)
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL(`/${activeLocale}/login`, req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
