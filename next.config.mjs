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
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // everything else can run from your own origin
              "default-src 'self'",

              // scripts: Paddle live+sandbox + ProfitWell
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
                "https://cdn.paddle.com https://js.paddle.com https://buy.paddle.com " +
                "https://sandbox-cdn.paddle.com https://public.profitwell.com",

              // styles: allow Paddle CSS (live + sandbox)
              "style-src 'self' 'unsafe-inline' https://cdn.paddle.com https://sandbox-cdn.paddle.com",

              // images: your own + Paddle assets
              "img-src 'self' data: https://paddle.s3.amazonaws.com https://paddle-static.s3.amazonaws.com https:",

              // fonts: Paddle webfonts
              "font-src 'self' data: https://cdn.paddle.com",

              // XHR/websocket/etc: Paddle APIs (live + sandbox)
              "connect-src 'self' https://checkout.paddle.com https://buy.paddle.com " +
                "https://vendors.paddle.com https://sandbox-vendors.paddle.com " +
                "https://api.paddle.com https://sandbox-api.paddle.com",

              // iframes: allow the overlay host (live + sandbox)
              "frame-src 'self' https://checkout.paddle.com https://buy.paddle.com https://sandbox-buy.paddle.com https://js.paddle.com",

              // who can embed *you* (unchanged)
              "frame-ancestors 'self' https://checkout.paddle.com https://buy.paddle.com",

              // extra lockdown
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
