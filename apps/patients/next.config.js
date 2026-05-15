import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  //disable: process.env.NODE_ENV === "development",
  disable: false,
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 uses Turbopack by default. @ducanh2912/next-pwa uses webpack
  // for Service Worker generation during build. Adding empty turbopack config
  // silences the warning while keeping webpack-based PWA generation working.
  turbopack: {},

  // Allow cross-origin dev resources (HMR, chunk loading) from ngrok / LAN
  allowedDevOrigins: ["scholarless-aisha-wordless.ngrok-free.dev"],
};

export default withPWA(nextConfig);
