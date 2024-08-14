'use client';
import React, { useState, useEffect } from 'react';
const TypingHeader = () => {
  const fullText = "שורת החיפוש שלכם תקועה ב1991. תתקדמו";
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (text.length < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, 100); // Adjust typing speed here (milliseconds)
      return () => clearTimeout(timeout);
    }
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500); // Blink speed
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-5xl sm:text-6xl font-bold mb-4 w-full text-right">
      {text}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
        .
      </span>
    </h1>
  );
};

export default TypingHeader;