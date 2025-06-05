import { Inter } from "next/font/google"; 
import Link from 'next/link';
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";
import HeaderAuthButton from "./HeaderAuthButton.js";
import { validatePaddleEnvironment } from "/lib/env-validator";

// Run environment validation on server-side
if (typeof window === 'undefined') {
  console.log('\n🚀 Server-side initialization');
  validatePaddleEnvironment();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "semantix - חיפוש סמנטי מבוסס AI לתוצאות מדויקות בעסק שלך",
  description: "מנוע החיפוש המתקדם בעולם לחנויות אי-קומרס בכל הפלטפורמות",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="ltr">
      <head>
        <Script
          async src="https://www.googletagmanager.com/gtag/js?id=G-BLXY1X669N"
        />
        <Script id="google-analytics">
          {`
              window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8KT8DK42GV');
          `}
        </Script>
        
        {/* Shopify App Bridge Script - Add this to enable app embedding */}
        <Script 
          id="shopify-app-bridge" 
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js" 
          data-api-key={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || 'ed3834d550c5d814851e0ad46493ca2c'}
        />
        
        {/* Session Token Authentication Script */}
        <Script id="shopify-app-bridge-init">
          {`
            if (window.shopify && window.shopify.config) {
              var AppBridge = window['app-bridge'];
              var createApp = AppBridge.default;
              var app = createApp({
                apiKey: '${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || 'ed3834d550c5d814851e0ad46493ca2c'}',
                host: window.shopify.config.host,
                forceRedirect: true
              });
              
              // Set up session token handling
              var SessionToken = AppBridge.actions.SessionToken;
              var sessionToken = SessionToken.create(app);
              
              // Listen for session token changes
              sessionToken.subscribe(function(payload) {
                // Store the token for API calls
                window.sessionToken = payload.data;
              });
            }
          `}
        </Script>
        
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content="חיפוש סמנטי, AI, semantix, תוצאות מדויקות, חיפוש בעסק, חיפוש חכם" />
        <meta name="author" content="semantix"/>

        
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://semantix.ai" />
        <meta property="og:image" content="/main-logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="/main-logo.png" />
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
        
        
        <link rel="icon" href="/logo-semantix.svg" type="image/svg+xml" />
        
        
        <title>{metadata.title}</title>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gradient-to-t from-purple-200 via-purple-200 to-purple-50`}>
        <div className="flex-grow relative overflow-hidden">
          <header className="relative z-10">
            <nav className="flex justify-between items-center w-full py-4 px-4 sm:px-8 md:px-20">
              <div className="flex items-center space-x-8">
                <Link href="/">
                  <img src="/main-logo.svg" alt="Semantix Logo - Semantic search for your business" width={250} height={150} />
                </Link>
                <div className="hidden md:flex items-center">
                  <Link href="/terms" className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors text-lg">
                    Terms and Conditions
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Providers>
                  <HeaderAuthButton />
                </Providers>
              </div>
            </nav>
          </header>

          <main className="flex-grow relative z-10 px-4 sm:px-8 md:px-20">
            <Providers>{children}</Providers>
          </main>

          <footer className="relative z-10 w-full border-t border-gray-200 py-4 text-center">
            <p className="text-gray-600">© 2025 סמנטיקס. כל הזכויות שמורות.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}