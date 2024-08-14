// pages/index.js
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import TypingHeader from "./Typing";

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 4000); // 4 seconds delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-end justify-center py-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-500 opacity-10 -skew-x-12 transform origin-top-right"></div>

      <Head>
        <title>סמנטיקס - פתרונות בינה מלאכותית</title>
        <meta
          name="description"
          content="סמנטיקס - פתרונות חדשניים בבינה מלאכותית לעתיד"
        />
        <link rel="icon" href="/semantix.png" />
      </Head>

      <main className="flex flex-col w-full flex-1 px-4 sm:px-8 md:px-20 relative z-10">
        <section dir="rtl" className="my-16 text-right max-w-4xl">
          <TypingHeader />
          
          <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xl text-gray-600 mb-8 font-bold"></p>
            <Link href="/product">
              <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 mb-8 flex items-center">
                איך זה עובד
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Link>
            <p className="text-gray-700 leading-relaxed fontfamily-sans">
              שורות החיפוש המסורתיות באתרים של E-Commerce עדיין מתבססות על מילות
              מפתח, מה שמוביל לתוצאות חיפוש לא מדויקות. לדוגמה, חיפוש פשוט כמו
              "יין לבן" בחנות יין מקוונת יחזיר כל תוצאה שבה מופיעות המילים "יין"
              או "לבן", ולא בהכרח את היין המדויק שאתם מחפשים.
            </p>
            <br></br>
            <p className="text-gray-700 leading-relaxed fontfamily-sans font-semibold">
              ב-Semantix אנחנו משנים את כללי המשחק עם שורת חיפוש סמנטית המבוססת על
              בינה מלאכותית מתקדמת. במקום להקליד "יין לבן" ולקוות לטוב, תוכלו לחפש
              בדיוק את מה שאתם רוצים, כמו "יין לבן פירותי וקליל שמתאים לארוחת ערב
              ים תיכונית, במחיר של 70 עד 120 ש״ח", ולקבל את התוצאה המושלמת עבורכם.
            </p>
            <br></br>
            <p className="text-gray-700 leading-relaxed">
              בנוסף, שורת החיפוש שלנו יכולה לתרגם תמונות לתיאורים מילוליים. כך,
              בחנות בגדים מקוונת תוכלו לחפש פריטים כמו "נעל ספורט לבנה בגזרה נמוכה
              עם סוליית גומי חומה, עד 300 שקלים" ולמצוא בדיוק את מה שאתם מחפשים,
              בקלות ובמהירות.
            </p>
          </div>
        </section>

        <section id="contact" className={`my-16 text-right transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-4">צור קשר</h2>
          <p className="text-gray-600 mb-8 fontfamily-sans font-semibold">
            תרגישו הכי בנוח לשאול, להתייעץ או לדבר - אנחנו כאן - בווטסאפ או
            במייל.
          </p>

          <p className="mb-4">
            <strong>מייל:</strong>{" "}
            <a href="mailto:galpaz2210@gmail.com" className="text-blue-500">
              galpaz2210@gmail.com
            </a>
          </p>
          <p className="mb-8">
            <strong>טלפון:</strong>{" "}
            <a href="tel:+972542251558" className="text-blue-500">
              054-2251558/7
            </a>
          </p>

          <div dir="" className="flex flex-space gap-4">
            
             <a href="https://wa.me/972542251558"
              target="_blank"
              rel="noopener noreferrer">
          
              <svg
                className="w-10 h-10"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z"
                  clipRule="evenodd"
                />
                <path
                  fill="currentColor"
                  d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z"
                />
              </svg> 
            </a>
            
            <a href="mailto:galpaz2210@gmail.com">
              <svg
                className="w-10 h-10 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16v-5.5A3.5 3.5 0 0 0 7.5 7m3.5 9H4v-5.5A3.5 3.5 0 0 1 7.5 7m3.5 9v4M7.5 7H14m0 0V4h2.5M14 7v3m-3.5 6H20v-6a3 3 0 0 0-3-3m-2 9v4m-8-6.5h1"
                />
              </svg>
            </a>
          </div>
        </section>
      </main>

    </div>


  ); 
}