'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

const HomePage = () => {
  const router = useRouter();
  const queriesWithImages = [
    {
      query: "Red wine that pairs well with steak dinner, up to 20$",
      images: [
        "/wine2.png",
        "/wine1.png",
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

  const stats = [
    { label: 'Average Conversion Increase', value: '32%', icon: '📈' },
    { label: 'Setup Time', value: '< 5 min', icon: '⚡' },

    { label: 'Queries Processed', value: '100k+', icon: '🔍' },
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

  const integrations = [
    { name: 'WooCommerce', logo: '🛒', status: 'available', description: 'Live and ready!' },
    { name: 'Shopify', logo: '🛍️', status: 'coming-soon', description: 'Coming Q2 2025' },
    { name: 'Magento', logo: '🏪', status: 'planned', description: 'On roadmap' },
    { name: 'BigCommerce', logo: '🏬', status: 'planned', description: 'On roadmap' },
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
    <>
      <Head>
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Semantix AI</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How it Works</a>
              
                <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors">Testimonials</a>
                <button onClick={() => router.push('/onboarding')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Launch Announcement Banner */}
        <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white z-40 border-b border-indigo-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  🚀 LAUNCH PHASE
                </span>
                <p className="text-sm md:text-base font-medium">
                  We're currently in launch phase and working exclusively with 
                  <span className="font-bold mx-1">WooCommerce</span>
                  stores. Shopify support coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section - Enhanced */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-50"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
            
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Turn Browsers Into Buyers
                </span>
                <br />
                <span className="text-gray-800">With AI-Powered Search</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                Let customers search naturally, find exactly what they want, and buy with confidence. 
                Watch your conversion rates soar with search that actually understands.
              </p>
            </div>

            {/* Search Demo - Enhanced */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto mb-12 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-6 py-4 justify-between">
                  <span className={`text-xl text-gray-700 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
                    {text}
                    <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-purple-600`}>|</span>
                  </span>
                  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ${showImages && !isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {showImages && currentImages.map((image, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Image src={image} alt={`Product ${index + 1}`} className="w-full h-48 object-cover" width={300} height={200} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium">Perfect Match</p>
                      <p className="text-xs opacity-90">Click to view</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push('/login')} className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3">
                <span>Start Free Trial</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button onClick={() => router.push('/product')} className="bg-white text-gray-700 font-bold py-4 px-8 rounded-full text-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                Try it on out live demo!
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-purple-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Your Customers Don't Think in Keywords
                </h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <span className="text-red-500 text-2xl">❌</span>
                    <div>
                      <p className="font-semibold text-gray-800">Traditional Search Fails</p>
                      <p className="text-gray-600">Customers search for "red wine for steak" but get zero results because your products are tagged as "Cabernet Sauvignon"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-green-500 text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-gray-800">Semantix AI Understands</p>
                      <p className="text-gray-600">Our AI knows that Cabernet pairs perfectly with steak and shows relevant results instantly</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => router.push('/product')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  See the Difference →
                </button>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-600 font-medium mb-2">❌ Traditional Search</p>
                    <div className="bg-white rounded border border-red-200 p-3">
                      <p className="text-gray-700">"birthday gift for 10 year old who loves science"</p>
                      <p className="text-red-500 text-sm mt-2">No results found</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium mb-2">✅ Semantix AI</p>
                    <div className="bg-white rounded border border-green-200 p-3">
                      <p className="text-gray-700">"birthday gift for 10 year old who loves science"</p>
                      <p className="text-green-600 text-sm mt-2">Showing: Chemistry Sets, Microscopes, Robot Kits...</p>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{feature.icon}</span>
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
        <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
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
                  icon: '🔌',
                  time: '1 minute'
                },
                {
                  step: '2',
                  title: 'Connect Store',
                  description: 'Automatic sync with your product catalog and data',
                  icon: '🔄',
                  time: '2 minutes'
                },
                {
                  step: '3',
                  title: 'Watch Magic Happen',
                  description: 'Customers find products faster, buy more, love your store',
                  icon: '✨',
                  time: 'Instant results'
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl mb-6">
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
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

              {/* Conversion Visualization */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
                <h3 className="text-md font-medium text-gray-700 mb-4">Weekly Conversion Trends</h3>
                <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-end justify-around">
                  {[
                    { day: 'Mon', conversions: 127, height: '90%' },
                    { day: 'Tue', conversions: 89, height: '70%' },
                    { day: 'Wed', conversions: 156, height: '100%' },
                    { day: 'Thu', conversions: 112, height: '85%' },
                    { day: 'Fri', conversions: 134, height: '92%' },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md w-16 shadow-md flex items-start justify-center"
                        style={{ height: item.height }}
                      >
                        <div className="text-white text-center font-bold py-2 text-sm">
                          {item.conversions}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{item.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl mb-12 text-purple-100">
              See how much revenue Semantix AI could add to your store
            </p>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-purple-100 mb-2">Monthly Visitors</label>
                  <input 
                    type="number" 
                    value={roiInputs.monthlyVisitors}
                    onChange={(e) => setRoiInputs({...roiInputs, monthlyVisitors: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50" 
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Average Order Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-white">$</span>
                    <input 
                      type="number" 
                      value={roiInputs.avgOrderValue}
                      onChange={(e) => setRoiInputs({...roiInputs, avgOrderValue: parseFloat(e.target.value) || 0})}
                      className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Current Conversion Rate</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={roiInputs.currentConversionRate}
                      onChange={(e) => setRoiInputs({...roiInputs, currentConversionRate: parseFloat(e.target.value) || 0})}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full pr-8 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50" 
                    />
                    <span className="absolute right-4 top-3 text-white">%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="text-left">
                    <p className="text-purple-100 mb-1 text-sm">Current Monthly Revenue</p>
                    <p className="text-2xl font-bold">${roi.currentMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-purple-100 mb-1 text-sm">Projected Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-300">${roi.projectedMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-6">
                  <p className="text-purple-100 mb-2">Estimated Additional Monthly Revenue</p>
                  <p className="text-5xl font-bold mb-4">
                    ${roi.additionalMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-purple-100">
                    That's <span className="font-bold text-green-300">${roi.additionalYearlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in additional revenue per year
                  </p>
                  <p className="text-purple-100 mt-2 text-sm">
                    Based on 32% average conversion increase • {roi.additionalOrders} more orders per month
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-purple-100">
                <p>New conversion rate: <span className="font-bold">{roi.newConversionRate}%</span> (up from {roiInputs.currentConversionRate}%)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Enhanced */}
        <section id="testimonials" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Loved by 2,500+ Store Owners
              </h2>
              <p className="text-xl text-gray-600">
                See why merchants are switching to Semantix AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Chen',
                  role: 'CEO, FashionForward',
                  image: '/testimonial-avatar1.png',
                  quote: 'Our conversion rate jumped 38% in the first month. Customers finally find what they\'re looking for!',
                  rating: 5,
                  metric: '+38% conversions'
                },
                {
                  name: 'Marcus Rodriguez',
                  role: 'Founder, TechGadgets Pro',
                  image: '/testimonial-avatar2.png',
                  quote: 'Setup took 3 minutes. The insights we get are invaluable. Best investment we\'ve made.',
                  rating: 5,
                  metric: '3 min setup'
                },
                {
                  name: 'Emily Watson',
                  role: 'Marketing Director, HomeDecor Plus',
                  image: '/testimonial-avatar3.png',
                  quote: 'No more "no results found"! Our customers are happier and our support tickets dropped 50%.',
                  rating: 5,
                  metric: '-50% support tickets'
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <Image src={testimonial.image} alt={testimonial.name} width={60} height={60} className="rounded-full mr-4" />
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="bg-white rounded-lg px-4 py-2 inline-block">
                    <p className="text-purple-600 font-bold">{testimonial.metric}</p>
                  </div>
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

        {/* Final CTA - Enhanced */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-5xl font-bold mb-6">
              Ready to Transform Your Store?
            </h2>
            <p className="text-2xl mb-8 text-purple-100">
              Join 2,500+ stores already delighting customers with AI-powered search
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-3xl font-bold mb-2">✓</p>
                  <p className="text-lg">14-day free trial</p>
                </div>
                <div>
                  <p className="text-3xl font-bold mb-2">✓</p>
                  <p className="text-lg">No credit card required</p>
                </div>
                <div>
                  <p className="text-3xl font-bold mb-2">✓</p>
                  <p className="text-lg">5-minute setup</p>
                </div>
              </div>
              
              <button onClick={() => router.push('/product')} className="group bg-white text-purple-600 font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center gap-3 mx-auto">
                <span>Start Your Free Trial</span>
                <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center gap-6">
              <a href="https://wa.me/972542251558" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2A1.01 1.01 0 0 0 3.8 21.454l3.032-.892A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </a>
              <a href="mailto:Sales@semantix-ai.com" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/semantix-io/" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">Semantix AI</h3>
                <p className="text-gray-400">AI-powered search that understands your customers</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>

                  <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Semantix AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
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
    </>
  );
};

export default HomePage;