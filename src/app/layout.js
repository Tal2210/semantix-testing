import { Inter } from "next/font/google"; 
import Link from 'next/link';
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";
import HeaderAuthButton from "./HeaderAuthButton.js";
import { validatePaddleEnvironment } from "/lib/env-validator";
import GetStartedButton from "./GetStartedButton.js";
import ConditionalFooter from "./ConditionalFooter.js";

// Run environment validation on server-side
if (typeof window === 'undefined') {
  console.log('\n🚀 Server-side initialization');
  validatePaddleEnvironment();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Semantix - AI-powered Semantic Search for Precise Results in Your Business",
  description: "The world's most advanced search engine for e-commerce stores on all platforms",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
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
        <meta name="keywords" content="semantic search, AI, semantix, precise results, business search, smart search" />
        <meta name="author" content="semantix"/>

        
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.semantix-ai.com" />
        <meta property="og:image" content="/main-logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="/main-logo.png" />
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
        
        
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        
        <title>{metadata.title}</title>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white`}>
        {/* Professional Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Main Nav Links */}
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center">
                  <img src="/main-logo.svg" alt="Semantix Logo - Semantic search for your business" className="h-12 w-auto [&>path]:fill-purple-600" style={{ filter: "none" }} />
                </Link>
                
                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    Features
                  </Link>
                  <Link href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    How it Works
                  </Link>
                 
                  <Link href="/subscription" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    Pricing
                  </Link>
                
                  <Link href="/terms" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    Terms
                  </Link>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                <Providers>
                  <HeaderAuthButton />
                </Providers>
                <Providers>
                  <GetStartedButton />
                </Providers>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with padding for fixed nav */}
        <div className="flex-grow relative overflow-hidden pt-16">
          <main className="flex-grow relative z-10">
            <Providers>{children}</Providers>
          </main>

          {/* Conditional Footer - Hidden on Dashboard */}
          <ConditionalFooter />
        </div>
      </body>
    </html>
  );
}