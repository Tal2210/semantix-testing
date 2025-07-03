import { Inter } from "next/font/google"; 
import Link from 'next/link';
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";
import HeaderAuthButton from "./HeaderAuthButton.js";
import { validatePaddleEnvironment } from "/lib/env-validator";
import GetStartedButton from "./GetStartedButton.js";

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

          {/* Enhanced Footer */}
          <footer className="bg-gray-900 text-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <img src="/main-logo.svg" alt="Semantix Logo" className="h-8 w-auto mb-4 brightness-0 invert" />
                  <p className="text-gray-400 text-sm">AI-powered search that understands your customers</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Product</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                    <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                    <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                    <li><Link href="/api" className="hover:text-white transition-colors">API Docs</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                    <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                    <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                    <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                    <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Semantix. All rights reserved.</p>
                <div className="flex space-x-6">
                  <a href="https://wa.me/972542251558" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2A1.01 1.01 0 0 0 3.8 21.454l3.032-.892A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                  </a>
                  <a href="mailto:Sales@semantix-ai.com" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/semantix-io/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}