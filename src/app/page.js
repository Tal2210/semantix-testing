'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

const HomePage = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const queriesWithImages = [
    {
      query: "Red wine that pairs well with steak dinner, up to 20$",
      images: ["/wine2.png", "/wine1.png", "/wine3.png", "/wine4.png"]
    },
    {
      query: "GPS sports watch with payment functionality",
      images: [
        "https://shipi.b-cdn.net/wp-content/uploads/2023/06/Apple-Watch-SE-2022-40mm-600x600.webp",
        "https://shipi.b-cdn.net/wp-content/uploads/2023/01/Untitled-1-RADSecovered-2-600x600-1-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/08/16382009-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/06/6339680_sd-600x600.jpg"
      ]
    },
    {
      query: "Heart-shaped jewelry for my daughter's birthday- with a discount",
      images: [
        "https://theydream-online.com/wp-content/uploads/2024/06/1717340426_I8PsgQ_C-1.jpeg.webp",
        "https://theydream-online.com/wp-content/uploads/2023/07/1690810117_1690117322_06-652x652.jpg.webp",
        "https://theydream-online.com/wp-content/uploads/2024/02/1707144894_0E6A1819-520x780.jpg.webp",
        "https://theydream-online.com/wp-content/uploads/2024/01/1704373234_1195213438_0E6A2495-710x1065.jpg"
      ]
    }
  ];

  const currentQuery = queriesWithImages[currentIndex].query;
  const currentImages = queriesWithImages[currentIndex].images;

  // Enhanced animations and interactions
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Typing animation logic
  useEffect(() => {
    if (!isFadingOut && text.length < currentQuery.length) {
      const typingTimeout = setTimeout(() => {
        setText(currentQuery.slice(0, text.length + 1));
      }, 80);
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
      }, 3000);
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

  const stats = [
    { label: 'Conversion Increase', value: '32%', icon: '📈', color: 'from-emerald-400 to-cyan-400' },
    { label: 'Setup Time', value: '< 5 min', icon: '⚡', color: 'from-yellow-400 to-orange-400' },
    { label: 'Queries Processed', value: '100k+', icon: '🔍', color: 'from-purple-400 to-pink-400' },
    { label: 'Happy Merchants', value: '500+', icon: '🎉', color: 'from-blue-400 to-indigo-400' }
  ];

  const features = [
    {
      title: 'Neural Search Intelligence',
      description: 'Revolutionary AI that understands context, intent, and natural language like never before.',
      icon: '🧠',
      gradient: 'from-purple-500 to-pink-500',
      details: ['Context-aware understanding', 'Multi-language support', 'Intent recognition']
    },
    {
      title: 'Quantum Product Matching',
      description: 'Advanced algorithms that find perfect matches across infinite product relationships.',
      icon: '⚛️',
      gradient: 'from-blue-500 to-cyan-500',
      details: ['Cross-category intelligence', 'Semantic similarity', 'Predictive matching']
    },
    {
      title: 'Real-Time Analytics Matrix',
      description: 'Live insights that reveal customer behavior patterns and conversion opportunities.',
      icon: '📊',
      gradient: 'from-emerald-500 to-teal-500',
      details: ['Behavior tracking', 'Conversion analytics', 'Performance insights']
    },
    {
      title: 'Zero-Friction Integration',
      description: 'Seamless deployment that works with your existing setup in minutes, not months.',
      icon: '🚀',
      gradient: 'from-orange-500 to-red-500',
      details: ['One-click setup', 'Auto-sync catalog', 'No code required']
    }
  ];

  return (
    <>
      <Head>
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
      </Head>
      
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulse-glow {
          from { box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); }
          to { box-shadow: 0 0 40px rgba(147, 51, 234, 0.8); }
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .scale-in {
          animation: scaleIn 0.6s ease-out;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .bg-mesh {
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .magnetic-effect {
          transition: transform 0.3s ease;
        }
        
        .neon-glow {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.5),
                      0 0 40px rgba(147, 51, 234, 0.3),
                      0 0 60px rgba(147, 51, 234, 0.1);
        }
      `}</style>

      <div className="min-h-screen bg-white overflow-hidden">
        {/* Dynamic Background */}
        <div className="fixed inset-0 bg-mesh opacity-50"></div>
        
        {/* Mouse Follower */}
        <div 
          className="fixed w-6 h-6 bg-purple-500 rounded-full pointer-events-none z-50 opacity-20 transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
            transform: `scale(${mousePosition.x > 0 ? 1 : 0})`
          }}
        />

        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <span className="text-2xl font-bold gradient-text">Semantix AI</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium hover:scale-105">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium hover:scale-105">How it Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium hover:scale-105">Testimonials</a>
                <button 
                  onClick={() => router.push('/onboarding')} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 neon-glow"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-20 floating-animation"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full filter blur-3xl opacity-20 floating-animation" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full filter blur-3xl opacity-10 floating-animation" style={{animationDelay: '4s'}}></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="mb-8">
                <span className="inline-block px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold mb-6 scale-in">
                  🚀 Launch Era - Everything Free!
                </span>
              </div>
              
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 text-shadow">
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
                  Turn Browsers
                </span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Into Buyers
                </span>
                <span className="block text-gray-800 text-5xl sm:text-6xl lg:text-7xl mt-4">
                  With AI Magic ✨
                </span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Let customers search <span className="font-bold text-purple-600">naturally</span>, 
                find <span className="font-bold text-pink-600">exactly</span> what they want, 
                and buy with <span className="font-bold text-blue-600">confidence</span>.
              </p>
            </div>

            {/* Enhanced Search Demo */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto mb-16 border border-white/20 hover-lift">
              <div className="flex items-center mb-8">
                <div className="flex-1 flex items-center bg-gradient-to-r from-gray-50 to-white rounded-2xl px-8 py-6 shadow-inner border border-gray-100">
                  <div className="flex-1">
                    <span className={`text-2xl text-gray-700 transition-all duration-500 ${isFadingOut ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
                      {text}
                      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-purple-600 font-bold`}>|</span>
                    </span>
                  </div>
                  <div className="ml-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 ${showImages && !isFadingOut ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                {showImages && currentImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Image 
                      src={image} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                      width={300} 
                      height={200} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-bold">Perfect Match ✨</p>
                      <p className="text-xs opacity-90">AI-powered result</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {95 + index}% Match
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => router.push('/login')} 
                className="group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl neon-glow"
              >
                <span className="flex items-center gap-3">
                  <span>Start Free Trial</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button 
                onClick={() => router.push('/product')} 
                className="group bg-transparent border-2 border-white text-white font-bold py-6 px-12 rounded-2xl text-xl hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Try Live Demo
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center text-white transform hover:scale-110 transition-all duration-300"
                  data-animate="true"
                  id={`stat-${index}`}
                >
                  <div className={`text-6xl mb-4 ${isVisible[`stat-${index}`] ? 'scale-in' : 'opacity-0'}`}>
                    {stat.icon}
                  </div>
                  <div className={`text-5xl md:text-6xl font-black mb-2 ${isVisible[`stat-${index}`] ? 'slide-in-left' : 'opacity-0'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-purple-100 text-lg font-medium ${isVisible[`stat-${index}`] ? 'slide-in-right' : 'opacity-0'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl sm:text-6xl font-black text-gray-800 mb-6 text-shadow">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Revolutionary Features
                </span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Cutting-edge technology that transforms how customers discover and buy products
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-purple-200 hover-lift"
                  data-animate="true"
                  id={`feature-${index}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{feature.icon}</span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-4">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-gray-700">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-lg">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-24 px-4 bg-gradient-to-br from-red-50 to-green-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative z-10">
                <h2 className="text-5xl font-black text-gray-800 mb-8 text-shadow">
                  Your Customers Don't Think in 
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text"> Keywords</span>
                </h2>
                
                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-6 p-6 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl">❌</span>
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-xl mb-2">Traditional Search Fails</p>
                      <p className="text-red-700 text-lg">Customers search for "red wine for steak" but get zero results because your products are tagged as "Cabernet Sauvignon"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-xl mb-2">Semantix AI Understands</p>
                      <p className="text-green-700 text-lg">Our AI knows that Cabernet pairs perfectly with steak and shows relevant results instantly</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/product')} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-2xl text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 neon-glow"
                >
                  See the Magic in Action ✨
                </button>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:rotate-1 transition-transform duration-300 hover-lift">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 mb-6 border border-red-200">
                    <p className="text-red-600 font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">❌</span>
                      Traditional Search
                    </p>
                    <div className="bg-white rounded-xl border-2 border-red-200 p-4">
                      <p className="text-gray-700 text-lg mb-3">"birthday gift for 10 year old who loves science"</p>
                      <div className="flex items-center gap-2 text-red-500 font-semibold">
                        <span className="text-xl">😞</span>
                        <span>No results found</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <p className="text-green-600 font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Semantix AI
                    </p>
                    <div className="bg-white rounded-xl border-2 border-green-200 p-4">
                      <p className="text-gray-700 text-lg mb-3">"birthday gift for 10 year old who loves science"</p>
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <span className="text-xl">🎉</span>
                        <span>Showing: Chemistry Sets, Microscopes, Robot Kits...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl sm:text-6xl font-black text-gray-800 mb-6 text-shadow">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Get Started in Minutes
                </span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                Three simple steps to transform your store's search experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Connect Your Store",
                  description: "One-click integration with your existing e-commerce platform",
                  icon: "🔗",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  step: "02", 
                  title: "AI Learns Your Catalog",
                  description: "Our AI automatically analyzes and understands your products",
                  icon: "🧠",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  step: "03",
                  title: "Watch Conversions Soar",
                  description: "Customers find what they want instantly and buy more",
                  icon: "🚀",
                  color: "from-emerald-500 to-teal-500"
                }
              ].map((step, index) => (
                <div key={index} className="relative text-center group">
                  <div className="relative z-10 bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover-lift">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className={`text-6xl font-black mb-4 bg-gradient-to-r ${step.color} text-transparent bg-clip-text`}>
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-0">
                      <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-8 text-shadow">
              Ready to Transform Your Store?
            </h2>
            <p className="text-2xl text-purple-100 mb-12 leading-relaxed">
              Join hundreds of merchants who've already revolutionized their customer experience
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => router.push('/login')} 
                className="group bg-white text-purple-600 font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  <span>Start Free Trial Now</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => router.push('/product')} 
                className="group bg-transparent border-2 border-white text-white font-bold py-6 px-12 rounded-2xl text-xl hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Try Live Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;