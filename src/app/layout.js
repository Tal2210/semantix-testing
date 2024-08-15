// app/layout.js
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "סמנטיקס - חיפוש סמנטי מבוסס AI לתוצאות מדויקות בעסק שלך",
  description: " סמנטיקס - התאמה מושלמת וחכמה בין חיפוש למוצר",


};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/logo-semantix.png" type="image/png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <div className="flex-grow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-500 opacity-10 -skew-x-12 transform origin-top-right"></div>
          
          <header className="relative z-10">
            <nav className="flex justify-end items-center w-full py-4 px-4 sm:px-8 md:px-20">
      
          
             <Link href="/"> <img src="/semantix black-cutout.png" alt="לוגו סמנטיקס- חיפוש סמנטי לעסק שלך" width={200} height={150} /> </Link>
            </nav>
          </header>

          <main className="flex-grow relative z-10 px-4 sm:px-8 md:px-20">
            {children}
          </main>

          <footer className="relative z-10 w-full border-t border-gray-200 py-4 text-center">
            <p className="text-gray-600">© 2024 סמנטיקס. כל הזכויות שמורות.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}