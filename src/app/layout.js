// app/layout.js
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "סמנטיקס - פתרונות בינה מלאכותית",
  description: "סמנטיקס - פתרונות חדשניים בבינה מלאכותית לעתיד",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <div className="flex-grow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-500 opacity-10 -skew-x-12 transform origin-top-right"></div>
          
          <header className="relative z-10">
            <nav className="flex justify-end items-center w-full py-4 px-4 sm:px-8 md:px-20">
          {/* Add your navigation links here 
            <ul className="flex gap-4 ">
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">צור קשר</Link></li>
              <li><Link href="/product" className="text-gray-600 hover:text-gray-900">מוצרים</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">אודות</Link></li>
          
            </ul>*/}
          
             <Link href="/"> <img src="/semantix black-cutout.png" alt="לוגו סמנטיקס" width={200} height={150} /> </Link>
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