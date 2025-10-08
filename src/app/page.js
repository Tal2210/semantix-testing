'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import ImageCarousel from './components/ImageCarousel';

const HomePage = () => {
  const router = useRouter();
  const queriesWithImages = [
    {
      query: "Red wine that pairs well with steak dinner, up to 20$",
      images: [
        "/wine1.png",
        "/wine2.png",
        "/wine3.png",
        "/wine4.png",
      ]
    },
    {
      query: "GPS sports watch with payment functionality",
      images: [
        "https://shipi.b-cdn.net/wp-content/uploads/2023/06/Apple-Watch-SE-2022-40mm-600x600.webp",
        "https://shipi.b-cdn.net/wp-content/uploads/2023/01/Untitled-1-RADSecovered-2-600x600-1-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/08/16382009-600x600.jpg",
        "https://shipi.b-cdn.net/wp-content/uploads/2022/06/6339680_sd-600x600.jpg",
      ]
    },
    {
      query: "Heart-shaped jewelry for my daughter's birthday- with a discount",
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
  const dashboardRef = useRef(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    monthlyVisitors: 10000,
    avgOrderValue: 75,
    currentConversionRate: 2
  });

  const calculateROI = () => {
    const { monthlyVisitors, avgOrderValue, currentConversionRate } = roiInputs;
    
    // Current monthly revenue
    const currentMonthlyOrders = (monthlyVisitors * currentConversionRate) / 100;
    const currentMonthlyRevenue = currentMonthlyOrders * avgOrderValue;
    
    // Projected revenue with 32% conversion increase
    const improvedConversionRate = currentConversionRate * 1.32;
    const projectedMonthlyOrders = (monthlyVisitors * improvedConversionRate) / 100;
    const projectedMonthlyRevenue = projectedMonthlyOrders * avgOrderValue;
    
    // Additional revenue
    const additionalMonthlyRevenue = projectedMonthlyRevenue - currentMonthlyRevenue;
    const additionalYearlyRevenue = additionalMonthlyRevenue * 12;
    
    return {
      currentMonthlyRevenue,
      projectedMonthlyRevenue,
      additionalMonthlyRevenue,
      additionalYearlyRevenue,
      newConversionRate: improvedConversionRate.toFixed(2),
      additionalOrders: Math.round(projectedMonthlyOrders - currentMonthlyOrders)
    };
  };

  const roi = calculateROI();

  const currentQuery = queriesWithImages[currentIndex].query;
  const currentImages = queriesWithImages[currentIndex].images;

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

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDashboardVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (dashboardRef.current) {
      observer.observe(dashboardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const [queriesSaved, setQueriesSaved] = useState(0);
  const [productsSold, setProductsSold] = useState(0);

  useEffect(() => {
    const animateNumbers = () => {
      const queriesTarget = 45000;
      const productsTarget = 10000;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const queriesStep = queriesTarget / steps;
      const productsStep = productsTarget / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setQueriesSaved(Math.floor(currentStep * queriesStep));
        setProductsSold(Math.floor(currentStep * productsStep));
        
        if (currentStep >= steps) {
          setQueriesSaved(queriesTarget);
          setProductsSold(productsTarget);
          clearInterval(interval);
        }
      }, duration / steps);
    };

    // Start animation when component mounts
    animateNumbers();
  }, []);

  const stats = [
    { label: 'Conversion Rate', value: '23%', icon: 'CONVERT', isMain: true },
    { label: 'Products Sold', value: '50,000+', icon: 'SOLD', isMain: true },
    { label: 'Complex Queries Saved', value: '100,000+', icon: 'SAVED', isMain: true },
    { label: 'Revenue Generated', value: '$1M+', icon: 'REVENUE', isMain: true },
  ];

  const features = [
    {
      title: 'Natural Multi-Lingual Understanding',
      description: 'Customers search the way they think- and in every language. No more keyword guessing games.',
      icon: '💬',
      details: ['Understands context and intent', 'Handles typos and variations', 'Supports multiple languages']
    },
    {
      title: 'Smart Product Matching',
      description: 'AI-powered matching that actually understands product relationships.',
      icon: '🎯',
      details: ['Cross-category recommendations', 'Attribute-based matching', 'Semantic similarity search']
    },
    {
      title: 'Real-Time Analytics',
      description: 'See what customers want, when they want it, and how to deliver.',
      icon: '📊',
      details: ['Search trend analysis', 'Conversion tracking', 'Customer intent insights']
    },
    {
      title: 'Zero-Code Integration',
      description: 'Install, connect, and watch your conversion rates soar.',
      icon: '🔌',
      details: ['One-click installation', 'Auto-sync with catalog', 'Works with existing setup']
    },
  ];

  const painPoints = [
    {
      title: 'Smart Product Discovery',
      description: 'AI understands customer intent beyond exact keywords',
      icon: 'SMART',
    },
    {
      title: 'Real-time Learning',
      description: 'Algorithms improve with every search interaction',
      icon: 'LEARN',
    }
  ];

  const integrations = [
    { name: 'WooCommerce', logo: 'WOO', status: 'available', description: 'Ready to install' },
    { name: 'Shopify', logo: 'SHOP', status: 'coming-soon', description: 'Coming Q2 2025' },
  ];

  const faqs = [
    {
      question: 'How quickly can I get Semantix AI running on my store?',
      answer: 'Most stores are up and running in under 5 minutes! Just install our plugin, connect your store, and our AI automatically learns from your product catalog.'
    },
    {
      question: 'Will it work with my existing search setup?',
      answer: 'Absolutely! Semantix AI seamlessly replaces your current search without affecting any other parts of your store. All your existing filters, categories, and layouts remain unchanged.'
    },
    {
      question: 'How does the AI understand what customers want?',
      answer: 'Our AI is trained on millions of shopping queries and continuously learns from your store\'s data. It understands natural language, context, and shopping intent to deliver exactly what customers are looking for.'
    },
    {
      question: 'What kind of results can I expect?',
      answer: 'Our merchants typically see 20-40% increase in search-to-cart conversions, 50% reduction in "no results" searches, and significantly higher customer satisfaction scores.'
    },
  ];

  return (
    <div className="relative w-full overflow-x-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Head>
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
      </Head>
      <div className="relative">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Semantix AI</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
                <button onClick={() => router.push('/product')} className="text-gray-700 hover:text-purple-600 transition-colors bg-transparent border-none cursor-pointer">How it Works</button>
              
                <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors">Testimonials</a>
                <button onClick={() => window.open('https://calendly.com/semantix-sales/30min', '_blank')} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>



        {/* Hero Section - Enhanced */}
        <section className="pt-16 sm:pt-32 pb-12 sm:pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-50"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-8 sm:mb-12">
            
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-6.5xl font-extrabold mb-6 sm:mb-8 leading-tight">
                <span className="bg-gradient-to-t from-purple-600 via-purple-500 to-gray-400 text-transparent bg-clip-text block mb-1 sm:mb-0 pb-0 sm:pb-1">
                  Your Users Know What They Want
                </span>
                <span className="text-gray-800 block sm:inline">Help Them Find It.</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 px-4 leading-relaxed">
              Natural search, Accurate results, Confident buying.
              </p>
            </div>

            {/* Search Demo - Enhanced */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-4xl mx-auto mb-8 sm:mb-12 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-6 py-4 justify-between min-h-[80px]">
                  <span className={`text-lg sm:text-xl text-gray-700 transition-opacity duration-500 leading-tight ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
                    {text}
                    <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-purple-600`}>|</span>
                  </span>
                  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Fixed height container to prevent layout shifts */}
              <div className="h-56 sm:h-60 relative overflow-hidden">
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 transition-all duration-700 absolute inset-0 ${showImages && !isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {showImages && currentImages.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-gray-50 to-white">
                      <Image 
                        src={image} 
                        alt={`Product ${index + 1}`} 
                        className={`w-full h-full object-contain p-3 ${
                          // Remove backgrounds for wine, jewelry, and watch images
                          image.includes('/wine') 
                            ? 'remove-bg-white' 
                            : image.includes('theydream-online.com')
                            ? 'remove-bg-jewelry'
                            : image.includes('shipi.b-cdn.net')
                            ? 'remove-bg-white'
                            : ''
                        }`} 
                        width={300} 
                        height={200} 
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs sm:text-sm font-medium">Perfect Match</p>
                      <p className="text-xs opacity-90">Click to view</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <button onClick={() => window.open('https://calendly.com/semantix-sales/30min', '_blank')} className="group bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3 w-full sm:w-auto justify-center">
                <span>Get Started</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button onClick={() => router.push('/product')} className="bg-white text-gray-700 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
                Try it on our live demo!
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Proven Results That Drive Revenue
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real metrics from stores using Semantix AI to transform their search experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-purple-200">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-lg font-medium text-gray-700 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <ImageCarousel />
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-8">
              Your Customers Don't Think in Keywords
            </h2>
            
            <div className="space-y-6 mb-12 text-lg sm:text-xl text-gray-600 leading-relaxed">
              <p>
                They want to find exactly what they need. We help them think like customers, not search engines.
              </p>
              
              <p>
                Everyone knows the search experience is broken. Customers can't find what they're looking for because traditional search requires exact keyword matches. They search naturally - in exactly the same way they would ask a friend.
              </p>
              
              <p>
                Behind Semantix there's an AI that has learned from millions of searches and understands exactly what customers mean, no matter how they choose to search.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/product')} 
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
            >
              <span>See the Difference →</span>
            </button>
          </div>
        </section>

        {/* Analytics Dashboard Preview - Enhanced */}
        <section className="py-20 px-4 bg-white" ref={dashboardRef}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Real-Time Analytics That Drive Results
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Track every search, monitor cart conversions, and understand exactly what drives revenue in your store
              </p>
            </div>

            <div className={`transform ${dashboardVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-1000`}>
              {/* Analytics Dashboard Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-xl mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10"></div>
                <div className="relative p-8 flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
                    <p className="text-indigo-100">Track queries, conversions, and ROI</p>
                  </div>
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <button className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-white backdrop-blur-sm">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Last 30 Days
                    </button>
                  </div>
                </div>
                
                {/* Metrics Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white/5 backdrop-blur-sm border-t border-white/10">
                  <div className="p-4 backdrop-blur-sm bg-white/10 rounded-xl">
                    <p className="text-white/70 text-sm mb-1">Total Queries</p>
                    <p className="text-3xl font-bold text-white">8,234</p>
                  </div>
                  <div className="p-4 backdrop-blur-sm bg-white/10 rounded-xl">
                    <p className="text-white/70 text-sm mb-1">Cart Conversion</p>
                    <p className="text-3xl font-bold text-white">32.4%</p>
                  </div>
                  <div className="p-4 backdrop-blur-sm bg-white/10 rounded-xl">
                    <p className="text-white/70 text-sm mb-1">Avg. Order Value</p>
                    <p className="text-3xl font-bold text-white">$127.50</p>
                  </div>
                  <div className="p-4 backdrop-blur-sm bg-white/10 rounded-xl">
                    <p className="text-white/70 text-sm mb-1">Revenue Impact</p>
                    <p className="text-3xl font-bold text-white">+42%</p>
                  </div>
                </div>
              </div>

              {/* Search to Cart Conversions Section */}
              <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6">
                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Top Converting Search Queries
                    </h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Search Query
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cart Adds
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          Red wine for steak dinner
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                            127
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">$3,810.00</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          GPS watch for running
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                            89
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">$22,250.00</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          Birthday gift for daughter
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                            76
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">$4,560.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>


            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section id="features" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Everything You Need to Delight Customers
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powerful features that work together to create the ultimate shopping experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section id="how-it-works" className="py-20 px-4 bg-purple-50 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full text-sm font-medium mb-4">
                <span className="animate-pulse mr-2">🚀</span>
                Coming Soon
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                No developers, no complex setup, no headaches
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Install Plugin',
                  description: 'One-click installation from your store\'s app marketplace',
                  icon: 'INSTALL',
                  time: '1 minute'
                },
                {
                  step: '2',
                  title: 'Connect Store',
                  description: 'Automatic sync with your product catalog and data',
                  icon: 'CONNECT',
                  time: '2 minutes'
                },
                {
                  step: '3',
                  title: 'Watch Magic Happen',
                  description: 'Customers find products faster, buy more, love your store',
                  icon: 'MAGIC',
                  time: 'Instant results'
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <p className="text-sm text-purple-600 font-medium">{item.time}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Semantix AI
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </div>

      <style jsx>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardReveal {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeDown {
          animation: fadeDown 0.8s ease-out forwards;
        }

        .animate-dashboardReveal {
          animation: dashboardReveal 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;