/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'alcohome.co.il',
      'shipi.b-cdn.net',
      'theydream-online.com',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Applies to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // everything else can run from your own origin
              "default-src 'self'",

              // scripts: Paddle live+sandbox + ProfitWell
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
                "https://cdn.paddle.com https://js.paddle.com https://buy.paddle.com " +
                "https://sandbox-cdn.paddle.com https://public.profitwell.com https://www.googletagmanager.com",

              // styles: allow Paddle CSS (live + sandbox)
              "style-src 'self' 'unsafe-inline' https://cdn.paddle.com https://sandbox-cdn.paddle.com",

              // images: your own + Paddle assets + your specified image domains
              // MODIFIED: Replaced generic 'https:' with specific domains from nextConfig.images.domains for better security
              "img-src 'self' data: https://paddle.s3.amazonaws.com https://paddle-static.s3.amazonaws.com " +
                "https://alcohome.co.il https://shipi.b-cdn.net https://theydream-online.com",

              // fonts: Paddle webfonts
              "font-src 'self' data: https://cdn.paddle.com",

              // XHR/websocket/etc: Paddle APIs (live + sandbox) + your dashboard server + blob for downloads
              // MODIFIED: Added your dashboard server and 'blob:' for potential file downloads (like the CSV)
              "connect-src 'self' https://checkout.paddle.com https://buy.paddle.com " +
                "https://vendors.paddle.com https://sandbox-vendors.paddle.com " +
                "https://api.paddle.com https://sandbox-api.paddle.com " +
                "https://dashboard-server-ae00.onrender.com https://shopifyserver-1.onrender.com blob:", // <<< MODIFICATION HERE

              // iframes: allow the overlay host (live + sandbox)
              "frame-src 'self' https://checkout.paddle.com https://buy.paddle.com https://sandbox-buy.paddle.com https://js.paddle.com",

              // who can embed *you* (unchanged)
              "frame-ancestors 'self' https://checkout.paddle.com https://buy.paddle.com",

              // extra lockdown
              "object-src 'none'", // If CSV download (blob:) is ever blocked by this, you might need "object-src 'self' blob:"
              "base-uri 'self'",
            ].join('; '),
          },
          // You can add other security headers here if needed, for example:
          // {
          //   key: 'X-Content-Type-Options',
          //   value: 'nosniff',
          // },
          // {
          //   key: 'X-Frame-Options',
          //   value: 'SAMEORIGIN', // Or DENY if you don't want it iframed at all
          // },
          // {
          //   key: 'X-XSS-Protection',
          //   value: '1; mode=block',
          // },
          // {
          //   key: 'Referrer-Policy',
          //   value: 'strict-origin-when-cross-origin',
          // },
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=63072000; includeSubDomains; preload', // Be careful with preload
          // }
        ],
      },
    ]
  },
}

export default nextConfig


