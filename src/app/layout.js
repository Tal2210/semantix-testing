// app/layout.js
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Example English metadata
export const metadata = {
  title: "Semantix - AI-based Semantic Search for Precise Results",
  description: "Semantix - Perfectly matching search and product with smart, AI-driven solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Semantix - The perfect and intelligent match between search and product in your business. AI-based semantic search for precise results."
        />
        <meta
          name="keywords"
          content="semantic search, AI, semantix, precise results, business search, intelligent search"
        />
        <meta name="author" content="Semantix" />

        <meta
          property="og:title"
          content="Semantix - AI-based Semantic Search for Precise Results"
        />
        <meta
          property="og:description"
          content="Semantix - The perfect and intelligent match between search and product in your business. AI-based semantic search for precise results."
        />
        <meta
          property="og:image"
          content="/semantix black-cutout.png"
        />
        <meta property="og:url" content="https://semantix.co.il" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Semantix - AI-based Semantic Search for Precise Results"
        />
        <meta
          name="twitter:description"
          content="Semantix - The perfect and intelligent match between search and product in your business. AI-based semantic search for precise results."
        />
        <meta
          name="twitter:image"
          content="/semantix black-cutout.png"
        />

        <link rel="icon" href="/logo-semantix.svg" type="image/png" />

        <title>{metadata.title}</title>
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gradient-to-t from-purple-200 via-purple-200 to-purple-50`}
      >
        <div className="flex-grow relative overflow-hidden">
          <header className="relative z-10">
            <nav className="flex justify-start items-center w-full py-4 px-4 sm:px-8 md:px-20">
              <Link href="/">
                <img
                  src="/semantix black-cutout.png"
                  alt="Semantix Logo - AI-based semantic search"
                  width={250}
                  height={150}
                />
              </Link>
            </nav>
          </header>

          <main className="flex-grow relative z-10 px-4 sm:px-8 md:px-20">
            {children}
          </main>

          <footer className="relative z-10 w-full border-t border-gray-200 py-4 text-center">
            <p className="text-gray-600">
              © 2024 Semantix. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}