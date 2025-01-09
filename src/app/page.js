'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const HomePage = () => {
  const router = useRouter();
  const queriesWithImages = [
    {
      query: "יין אדום שמתאים לבשרים עד 120 ש׳׳ח",
      images: [
        "https://alcohome.co.il/wp-content/uploads/2023/11/file-386.png",
        "https://alcohome.co.il/wp-content/uploads/2023/11/Cumulus_small__2_-1-600x600-1.jpeg",
        "https://alcohome.co.il/wp-content/uploads/2023/11/file-704.png",
        "https://alcohome.co.il/wp-content/uploads/2024/04/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%9C%D7%9C%D7%90-%D7%A9%D7%9D-2024-04-14T125034.639.png",
      ]
    },
    {
      query: "שעון ספורט שאפשר גם לשלם איתו",
      images: [
        "https://shipi.b-cdn.net/wp-content/uploads/2023/06/Apple-Watch-SE-2022-40mm-600x600.webp",
        "https://shipi.b-cdn.net/wp-content/uploads/2023/01/Untitled-1-RADSecovered-2-600x600-1-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/08/16382009-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/06/6339680_sd-600x600.jpg",
      ]
    },
    {
      query: "אני מחפשת תכשיט לבת שלי- היא אוהבת לבבות וצדפים",
      images: [
        "https://theydream-online.com/wp-content/uploads/2024/06/1717340426_I8PsgQ_C-1.jpeg.webp",
        "https://theydream-online.com/wp-content/uploads/2023/07/1690810117_1690117322_06-652x652.jpg.webp",
        "https://theydream-online.com/wp-content/uploads/2024/02/1707144894_0E6A1819-520x780.jpg.webp",
        "https://theydream-online.com/wp-content/uploads/2024/01/1704373234_1195213438_0E6A2495-710x1065.jpg",
      ]
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const currentQuery = queriesWithImages[currentIndex].query;
  const currentImages = queriesWithImages[currentIndex].images;

  useEffect(() => {
    if (!isFadingOut && text.length < currentQuery.length) {
      const typingTimeout = setTimeout(() => {
        setText(currentQuery.slice(0, text.length + 1));
      }, 100);
      return () => clearTimeout(typingTimeout);
    } else if (text.length === currentQuery.length && !showImages) {
      const showImagesTimeout = setTimeout(() => {
        setShowImages(true);
      }, 500);
      return () => clearTimeout(showImagesTimeout);
    }
  }, [text, isFadingOut, currentQuery, showImages]);

  useEffect(() => {
    if (showImages) {
      const displayTimeout = setTimeout(() => {
        setIsFadingOut(true);
      }, 2500);
      return () => clearTimeout(displayTimeout);
    }
  }, [showImages]);

  useEffect(() => {
    if (isFadingOut) {
      const nextQueryTimeout = setTimeout(() => {
        setText('');
        setShowImages(false);
        setIsFadingOut(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % queriesWithImages.length);
      }, 500);
      return () => clearTimeout(nextQueryTimeout);
    }
  }, [isFadingOut, queriesWithImages.length]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <>
    <Head>
           {/* This tells Google (and other bots that honor it) not to index images on this page */}
           <meta name="robots" content="noimageindex" />
           <meta name="googlebot" content="noimageindex" />
    </Head>
    <div className="min-h-screen flex flex-col">
      {/* Dynamic content container with fixed min-height */}
      <div className="flex-grow flex flex-col" style={{  maxHeight: '350px' }}> {/* Adjust minHeight as needed */}
        <div className="flex w-full">
          <div className="w-2/3 justify-center items-center ml-6 mt-5">
          <h1
  className={`text-2xl sm:text-3xl lg:text-7xl font-bold mb-4 transition-opacity duration-500 ${
    isFadingOut ? 'opacity-0' : 'opacity-100'
  }`}
>
  {text}
  <span
    className={`${
      showCursor ? 'opacity-100' : 'opacity-0'
    } transition-opacity duration-100`}
  >
    .
  </span>
</h1>
          </div>
          <div
            className={`mt-4 transition-opacity duration-700 ${
              showImages && !isFadingOut ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="grid grid-cols-2 gap-4 p-4">
              {showImages &&
                currentImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-lg p-2"
                  >
                    <img
                      src={image}
                      alt={`Image for ${currentQuery}`}
                      className="w-full h-auto object-cover rounded-md max-h-60"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact section - remains fixed at the bottom */}
      <div className="w-full flex justify-right">
      <section className="text-right pr-4 mb-20">
  <button
    onClick={() => router.push('/product')}
    className="group relative bg-gradient-to-r from-purple-400 to-purple-500 hover: text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl flex items-center gap-3"
  >
    <span>איך זה עובד</span>
    <svg
      className="w-6 h-6 transform group-hover:translate-x--2 transition-transform duration-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 8l-4 4m0 0l4 4m-4-4h18"
      />
    </svg>
  </button>

  <div className="flex mt-8 gap-5">
    {/* WhatsApp button */}
    <a
      href="https://wa.me/972542251558"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:opacity-80 transition-opacity"
    >
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

    {/* Email button */}
    <a
      href="mailto:galpaz2210@gmail.com"
      className="hover:opacity-80 transition-opacity"
    >
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

    {/* LinkedIn button */}
    <a
      href="https://www.linkedin.com/company/semantix-io/posts/?feedView=all"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:opacity-80 transition-opacity"
    >
      <svg
        className="w-10 h-10 text-blue-700"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M20.447 20.452h-3.554v-5.569c0-1.327-.026-3.039-1.854-3.039-1.856 0-2.141 1.449-2.141 2.943v5.665H9.348V9.564h3.414v1.491h.047c.476-.9 1.637-1.85 3.368-1.85 3.6 0 4.267 2.37 4.267 5.455v6.792ZM5.337 8.071a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126ZM6.97 20.452H3.706V9.564H6.97v10.888ZM22.225 0H1.771C.792 0 0 .773 0 1.725v20.495C0 23.227.792 24 1.771 24h20.451c.98 0 1.773-.773 1.773-1.725V1.725C24 .773 23.206 0 22.225 0Z"
        />
      </svg>
    </a>
  </div>
</section>

      </div>
    </div>
    </>
  );
};

export default HomePage;