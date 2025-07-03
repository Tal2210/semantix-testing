"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import ProductCelebration from "../components/ProductCelebration";
import ShopifyInstallButton from "../components/ShopifyInstallButton";
import { motion } from "framer-motion";

/* ────────────────────────────── tiny hook ───────────────────────── */
function useSyncStatus(dbName, enabled) {
  const [state, set] = useState("idle"); // idle | running | done | error
  useEffect(() => {
    if (!enabled || !dbName) return;
    let t;
    const poll = async () => {
      try {
        const r = await fetch(`/api/sync-status?dbName=${encodeURIComponent(dbName)}`);
        const j = await r.json();
        const nxt = j.state ?? "done";
        set(nxt);
        if (nxt === "running") t = setTimeout(poll, 5_000);
      } catch {
        t = setTimeout(poll, 8_000);
      }
    };
    poll();
    return () => clearTimeout(t);
  }, [dbName, enabled]);
  return state;
}

/* ───── Progress Bar Component ───── */
function ProgressBar({ totalProducts, processedCount }) {
  const progress = totalProducts ? Math.round((processedCount / totalProducts) * 100) : 0;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md p-6 shadow-lg border-t border-white/20 z-[9999]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-medium">
            Processing Products
          </p>
          <p className="text-white text-sm font-medium">
            {processedCount} of {totalProducts} ({progress}%)
          </p>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 relative overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();

  /* ---------- initial values from session (may be empty) ---------- */
  const sCreds = session?.user?.credentials ?? {};
  const sDB = session?.user?.dbName ?? "";
  const sCats = (sCreds.categories ?? []).join(", ");
  const sType = sCreds.type ?? "";
  const sPreset = session?.user?.preset ?? "";

  const storePresets = {
    wine: {
      name: "Wine Store",
      hebrewName: "Wine Store",
      icon: "🍷",
      categories: [
        // Wine types
        "White Wine", "Red Wine", "Rosé Wine", "Orange Wine", "Sparkling Wine",
        // Extra categories
        "Sake", "Beer", "Brandy", "Cognac", "Whiskey", "Aperitif", "Digestif",
        "Cocktail", "Gift Set", "Liqueur", "Cider", "Case", "Mezcal"
      ],
      types: [
        "Kosher", "On Sale"
      ],
      color: "#722F37"
    },
    fashion: {
      name: "F",
      hebrewName: "Fashion Store",
      icon: "👕",
      categories: ["Men's Wear", "Women's Wear", "Accessories", "Footwear"],
      types: ["Casual", "Formal", "Sports", "Seasonal"],
      color: "#4A90E2"
    },

    custom: {
      name: "Custom Store",
      hebrewName: "Custom Store",
      icon: "🎨",
      categories: [],
      types: [],
      color: "#6B7280"
    },
  };

  /* ---------- form state ----------------------------------------- */
  // Initialize platform from session if available; otherwise user must choose
  const [platform, setPlatform] = useState(sCreds.platform ?? "");
  const [syncMode, setSyncMode] = useState(sCreds.syncMode ?? "text");
  const [selectedPreset, setSelectedPreset] = useState(sPreset);
  const [form, setForm] = useState({
    shopifyDomain: sCreds.shopifyDomain ?? "",
    shopifyToken: sCreds.shopifyToken ?? "",
    wooUrl: sCreds.wooUrl ?? "",
    wooKey: sCreds.wooKey ?? "",
    wooSecret: sCreds.wooSecret ?? "",
  });
  const [categories, setCategories] = useState(sCats);
  const [typeFilter, setTypeFilter] = useState(sType);
  const [dbName, setDbName] = useState(sDB);

  /* ---------- when session lacks creds → fetch /api/get-onboarding ---------- */
  const [loadedOnboarding, setLoadedOnboarding] = useState(!!sDB || !!sCreds.platform);
  useEffect(() => {
    if (loadedOnboarding || status !== "authenticated") return;
    (async () => {
      try {
        const r = await fetch("/api/get-onboarding");
        if (!r.ok) { setLoadedOnboarding(true); return; }
        const j = await r.json();
        if (!j?.onboarding) { setLoadedOnboarding(true); return; }
        const c = j.onboarding.credentials ?? {};
        if (!platform && c.platform) setPlatform(c.platform);
        setSyncMode(c.syncMode ?? "text");
        setForm({
          shopifyDomain: c.shopifyDomain ?? "",
          shopifyToken: c.shopifyToken ?? "",
          wooUrl: c.wooUrl ?? "",
          wooKey: c.wooKey ?? "",
          wooSecret: c.wooSecret ?? ""
        });
        setCategories((c.categories ?? []).join(", "));
        setTypeFilter(c.type ?? "");
        setDbName(j.dbName ?? "");
      } catch (e) {
        console.warn("[onboarding] unable to load previous creds", e);
      } finally {
        setLoadedOnboarding(true);
      }
    })();
  }, [loadedOnboarding, status, platform]);

  /* ---------- UI / flow flags ------------------------------------ */
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);
  const [jobStarted, setJobStarted] = useState(false);

  /* ---------- backend state -------------------------------------- */
  const syncState = useSyncStatus(dbName, jobStarted);
  const processing = pending || syncState === "running";
  const canDownload = syncState === "done" && !!dbName;

  /* ---------- product celebration polling ------------------------ */
  const [newProduct, setNewProduct] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [processedProducts, setProcessedProducts] = useState(new Set());
  const lastProcessedCount = useRef(0);
  const celebrationTimer = useRef(null);
  const lastCelebratedId = useRef(null);

  // Function to show product celebration for the latest product
  const showLatestProductCelebration = async () => {
    if (!dbName || syncState !== "running") return;
    
    try {
      // Fetch the most recently processed product
      const response = await fetch(`/api/latest-products?dbName=${encodeURIComponent(dbName)}&count=1`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        const latestProduct = data.products[0];
        console.log('Latest processed product:', latestProduct);
        
        // Only show if we haven't shown this product before
        if (latestProduct.id !== lastCelebratedId.current) {
          lastCelebratedId.current = latestProduct.id;
          setNewProduct(latestProduct);
          
          // Clear the celebration after a few seconds
          if (celebrationTimer.current) {
            clearTimeout(celebrationTimer.current);
          }
          
          celebrationTimer.current = setTimeout(() => {
            setNewProduct(null);
          }, 3500);
        }
      }
    } catch (error) {
      console.error('Error fetching latest product:', error);
    }
  };

  useEffect(() => {
    if (syncState !== "running" || !dbName) return;
    
    let t;
    const poll = async () => {
      try {
        // Get sync status
        const r = await fetch(`/api/sync-status?dbName=${encodeURIComponent(dbName)}`);
        const j = await r.json();
        
        console.log('Sync status:', j); // Debug log
        
        // Update total products count if available
        if (j.totalProducts) {
          setTotalProducts(j.totalProducts);
        }
        
        // Update processed count if available
        if (typeof j.processedCount === 'number') {
          const newCount = Math.max(j.processedCount, processedCount);
          
          // Only show celebration if we have new processed products
          if (newCount > lastProcessedCount.current) {
            console.log(`Processed count increased from ${lastProcessedCount.current} to ${newCount}`);
            lastProcessedCount.current = newCount;
            
            // Show celebration for the latest product
            showLatestProductCelebration();
          }
          
          setProcessedCount(newCount);
        }
      } catch (error) {
        console.error('Error in sync polling:', error);
      } finally {
        // Poll more frequently during active syncing
        t = setTimeout(poll, 2000);
      }
    };

    // Start polling
    poll();

    // Cleanup
    return () => {
      clearTimeout(t);
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
      lastProcessedCount.current = 0;
      lastCelebratedId.current = null;
    };
  }, [syncState, dbName]);

  // Reset progress when starting a new sync
  useEffect(() => {
    if (syncState === "running") {
      setProcessedCount(0);
      setTotalProducts(0);
      lastProcessedCount.current = 0;
      lastCelebratedId.current = null;
      
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
        celebrationTimer.current = null;
      }
      
      setNewProduct(null);
    }
  }, [syncState]);

  /* ---------- UPDATED submit with 401 handling --------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setBanner("Saving credentials…");
    
    // Extract the URL from the form data
    const url = platform === "shopify" ? form.shopifyDomain : form.wooUrl;
    
    try {
      // First check if this URL already exists in the users collection
      const checkResponse = await fetch("/api/check-existing-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      
      const checkData = await checkResponse.json();
      
      // If URL exists and belongs to a different user, show warning
      if (checkData.exists && checkData.email !== session?.user?.email) {
        setBanner(`❌ This store URL has already been registered. If you previously had a free trial, please contact support to reactivate your account.`);
        setPending(false);
        return;
      }
      
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          syncMode,
          dbName,
          categories: categories.split(",").map(s => s.trim()).filter(Boolean),
          type: typeFilter,
          ...form
        })
      });

      if (response.status === 401) {
        // Handle invalid credentials specifically
        const errorData = await response.json();
        const errorMessage = errorData.message || "Invalid credentials provided";
        setBanner(`🔒 Authentication Failed: ${errorMessage}`);
        return;
      }

      if (response.status === 400) {
        // Handle other client errors (missing fields, invalid platform, etc.)
        const errorData = await response.json();
        const errorMessage = errorData.message || "Please check your input and try again";
        setBanner(`❌ ${errorMessage}`);
        return;
      }

      if (!response.ok) {
        // Handle other HTTP errors (500, etc.)
        throw new Error(`HTTP ${response.status}`);
      }

      // Success case
      setBanner("🔄 Syncing products – keep this tab open…");
      setJobStarted(true);
      
    } catch (error) {
      console.error("Submit error:", error);
      setBanner("❌ Something went wrong – please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleDownload() {
    if (!canDownload) return;
    try {
      if (platform === "shopify") {
        // Use the new public app installation flow
        window.location.href = "/install-shopify-app";
        return;
      }
      const res = await fetch("/api/download-plugin", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "semantix-plugin.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      setBanner("❌ Couldn't generate the plugin or install the app.");
    }
    await update();
  }

  const handlePresetSelect = (presetKey) => {
    const preset = storePresets[presetKey];
    setSelectedPreset(presetKey);
    setCategories(preset.categories.join(', '));
    setTypeFilter(preset.types.join(', '));
  };

  /* ---------- guards --------------------------------------------- */
  if (status === "loading" || !loadedOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your store...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9 5a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your store settings and continue the onboarding process.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:translate-y-px focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 w-full">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // New: Show preset selection before platform
  if (!selectedPreset) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to Your Store Setup
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Select the type of store you want to create. This will help us customize your experience.
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {Object.entries(storePresets).map(([key, preset], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="group"
              >
                <button
                  onClick={() => handlePresetSelect(key)}
                  className="w-full h-full p-8 rounded-2xl border-2 border-gray-200 bg-white transition-all flex flex-col items-center text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden relative"
                  style={{ borderColor: preset.color + '30' }}
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: preset.color }}></div>
                  <div 
                    className="w-20 h-20 flex items-center justify-center rounded-full mb-6 text-4xl shadow-inner"
                    style={{ backgroundColor: `${preset.color}20` }}
                  >
                    {preset.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: preset.color }}>
                    {preset.name}
                  </h3>
                  <div className="w-full bg-gray-50 rounded-xl p-4 mt-auto">
                    <p className="text-gray-600 font-medium mb-2">Includes:</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{preset.categories.length > 0 ? `${preset.categories.length} categories` : 'Custom categories'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{preset.types.length > 0 ? `${preset.types.length} product types` : 'Custom types'}</span>
                      </div>
                    </div>
                  </div>
              
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!platform) {
    const selectedPresetColor = storePresets[selectedPreset]?.color || "#3B82F6";
    
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${selectedPresetColor}20` }}
              >
                {storePresets[selectedPreset]?.icon || "🏪"}
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              Connect Your {storePresets[selectedPreset]?.name || "Store"}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your e-commerce platform to continue with the setup process
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <button
                onClick={() => setPlatform("shopify")}
                className="w-full md:w-64 group flex flex-col items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-full"
              >
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                  <img src="/shopify.png" alt="Shopify" className="w-16 h-16 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Shopify</h3>
                <p className="text-gray-600 text-center">Connect with Shopify to sync your products and store data</p>
                <div className="mt-6 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm group-hover:bg-green-600 group-hover:text-white transition-colors">
                  Select Shopify
                </div>
              </button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <button
                onClick={() => setPlatform("woocommerce")}
                className="w-full md:w-64 group flex flex-col items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 h-full"
              >
                <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                  <img src="/woocommerce.png" alt="WooCommerce" className="w-16 h-16 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">WooCommerce</h3>
                <p className="text-gray-600 text-center">Connect with WooCommerce to sync your WordPress store</p>
                <div className="mt-6 px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-medium text-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  Select WooCommerce
                </div>
              </button>
            </motion.div>
          </div>
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => setSelectedPreset("")} 
              className="text-gray-600 font-medium flex items-center mx-auto hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to store selection
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- render main form --------------------------------------------- */
  const selectedPresetColor = storePresets[selectedPreset]?.color || "#3B82F6";
  const gradientColors = {
    shopify: "from-green-50 to-blue-50",
    woocommerce: "from-purple-50 to-pink-50"
  };
  
  const platformColors = {
    shopify: {
      main: "bg-green-600",
      hover: "bg-green-700",
      light: "bg-green-50",
      text: "text-green-700",
      ring: "ring-green-500",
      border: "border-green-200"
    },
    woocommerce: {
      main: "bg-purple-600",
      hover: "bg-purple-700",
      light: "bg-purple-50",
      text: "text-purple-700",
      ring: "ring-purple-500",
      border: "border-purple-200"
    }
  };
  
  const colors = platformColors[platform] || platformColors.shopify;
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientColors[platform]} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-3"
              style={{ backgroundColor: `${selectedPresetColor}20` }}
            >
              {storePresets[selectedPreset]?.icon || "🏪"}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              {platform === "shopify" ? "Shopify" : "WooCommerce"} Setup
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Connect your {storePresets[selectedPreset]?.name || "store"} and customize your integration options
          </p>
        </motion.div>
        
        {/* UPDATED Banner usage with 401 error detection */}
        {banner && (
          <Banner 
            type={
              banner.includes("❌") || banner.includes("🔒") ? "error" : 
              banner.includes("🔄") ? "processing" : 
              "success"
            }
          >
            {banner}
          </Banner>
        )}
        
        <motion.div 
          className="bg-white shadow-xl rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`${colors.main} py-4 px-6`}>
            <div className="flex items-center text-white">
              {platform === "shopify" ? (
                <img src="/shopify-white.png" alt="Shopify" className="h-8 mr-3" />
              ) : (
                <img src="/woocommerce-white.png" alt="WooCommerce" className="h-8 mr-3" />
              )}
              <h2 className="text-xl font-bold">
                {platform === "shopify" ? "Shopify Connection" : "WooCommerce Connection"}
              </h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Platform Selection */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/3">
                  <Label>Platform</Label>
                </div>
                <div className="w-full md:w-2/3">
                  <Select
                    disabled={processing}
                    value={platform}
                    onChange={setPlatform}
                    options={[["shopify", "Shopify"], ["woocommerce", "WooCommerce"]]}
                    colors={colors}
                  />
                </div>
              </div>
              
              {/* Sync Mode */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/3">
                  <Label>Sync Content</Label>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="flex gap-6">
                    <StylishRadio
                      value="text"
                      label="Descriptions"
                      checked={syncMode === "text"}
                      onChange={() => setSyncMode("text")}
                      disabled={processing}
                      colors={colors}
                    />
                    <StylishRadio
                      value="image"
                      label="Images"
                      checked={syncMode === "image"}
                      onChange={() => setSyncMode("image")}
                      disabled={processing}
                      colors={colors}
                    />
                  </div>
                </div>
              </div>
              
              {/* Platform-specific credentials */}
              <div className="space-y-6 border border-gray-100 rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-700 mb-4">
                  {platform === "shopify" ? "Shopify Credentials" : "WooCommerce Credentials"}
                </h3>
                
                {platform === "shopify" ? (
                  <>
                    <StylishInput
                      label="Store Domain"
                      placeholder="yourshop.myshopify.com"
                      value={form.shopifyDomain}
                      disabled={processing}
                      onChange={v => setForm({ ...form, shopifyDomain: v })}
                      icon={
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      }
                      colors={colors}
                    />
                    <StylishInput
                      label="Admin API Token"
                      type="password"
                      value={form.shopifyToken}
                      disabled={processing}
                      onChange={v => setForm({ ...form, shopifyToken: v })}
                      icon={
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      }
                      colors={colors}
                    />
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">Need help generating your API token?</p>
                          <div className="mt-2">
                            <ShopifyInstallButton className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <StylishInput
                      label="WooCommerce Site URL"
                      type="url"
                      value={form.wooUrl}
                      disabled={processing}
                      onChange={v => setForm({ ...form, wooUrl: v })}
                      icon={
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      }
                      colors={colors}
                    />
                    <StylishInput
                      label="Consumer Key"
                      value={form.wooKey}
                      disabled={processing}
                      onChange={v => setForm({ ...form, wooKey: v })}
                      icon={
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                        </svg>
                      }
                      colors={colors}
                    />
                    <StylishInput
                      label="Consumer Secret"
                      type="password"
                      value={form.wooSecret}
                      disabled={processing}
                      onChange={v => setForm({ ...form, wooSecret: v })}
                      icon={
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      }
                      colors={colors}
                    />
                    <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-purple-700">Need help finding your WooCommerce credentials? <a href="#" className="font-medium underline">View our guide</a>.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Store Configuration */}
              <div className="space-y-6 border border-gray-100 rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Store Configuration</h3>
                
                <div className="relative">
                  <StylishInput
                    label={
                      <div className="flex items-center">
                        <span>Product Categories</span>
                        <div className="relative ml-2 group">
                          <div className="cursor-help w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300">?</div>
                          <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 z-10">
                            Categories are your primary product classification. They help organize your products into main groups (e.g., "Red Wine", "White Wine"). Products can belong to one category.
                          </div>
                        </div>
                      </div>
                    }
                    value={categories}
                    disabled={processing}
                    onChange={setCategories}
                    placeholder="Enter categories, separated by commas"
                    icon={
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    }
                    colors={colors}
                    hint={categories ? `${categories.split(',').filter(c => c.trim()).length} categories configured` : "No categories configured yet"}
                  />
                </div>
                
                <div className="relative">
                  <StylishInput
                    label={
                      <div className="flex items-center">
                        <span>Product Types</span>
                        <div className="relative ml-2 group">
                          <div className="cursor-help w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300">?</div>
                          <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 z-10">
                            Types are additional filters that can be applied across categories. They create a second layer of classification (e.g., "Kosher", "On Sale"). Products can have multiple types.
                          </div>
                        </div>
                      </div>
                    }
                    value={typeFilter}
                    disabled={processing}
                    onChange={setTypeFilter}
                    placeholder="Enter product types, separated by commas"
                    icon={
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                    colors={colors}
                    hint={typeFilter ? `${typeFilter.split(',').filter(t => t.trim()).length} types configured` : "No product types configured yet"}
                  />
                </div>
                
                <StylishInput
                  label="Store Name"
                  value={dbName}
                  disabled={processing}
                  onChange={setDbName}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  colors={colors}
                  hint="Give your store a unique name to identify it in our system"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="pt-6 flex flex-col space-y-4">
                <button 
                  type="submit" 
                  disabled={processing} 
                  className={`w-full ${colors.main} hover:${colors.hover} text-white py-4 px-6 rounded-xl disabled:opacity-60 shadow-md hover:shadow-lg transition-all transform hover:translate-y-px text-lg font-semibold flex items-center justify-center`}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connect & Sync Store
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!canDownload}
                  className={`w-full transition-all transform hover:translate-y-px text-lg font-semibold flex items-center justify-center py-4 px-6 rounded-xl shadow-md hover:shadow-lg ${
                    canDownload 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canDownload ? (
                    <span className="flex items-center">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Plugin
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Complete Sync First
                    </span>
                  )}
                </button>
              </div>
              
              {/* Navigation */}
              <div className="pt-2 text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setPlatform("");
                    setSelectedPreset(selectedPreset);
                  }}
                  className="text-gray-600 font-medium hover:text-blue-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Change Platform
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
      
      {/* Show progress bar when syncing */}
      {syncState === "running" && (
        <ProgressBar 
          totalProducts={totalProducts}
          processedCount={processedCount}
        />
      )}
      
      <ProductCelebration product={newProduct} />
    </div>
  );
}

/* ───────────────────────── Styled Components ─────────────────────────────── */
function Label({ children }) {
  return <label className="block font-medium text-gray-700">{children}</label>;
}

function StylishInput({ label, type = "text", value = "", onChange, disabled, placeholder, icon, colors, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={String(value)}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border ${colors?.border || 'border-gray-300'} focus:ring-2 focus:${colors?.ring || 'ring-blue-500'} focus:border-transparent rounded-lg transition-colors ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        />
      </div>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

function Select({ label, options, value, onChange, disabled, colors }) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none block w-full px-4 py-3 border ${colors?.border || 'border-gray-300'} rounded-lg transition-colors bg-white focus:outline-none focus:ring-2 focus:${colors?.ring || 'ring-blue-500'} focus:border-transparent ${disabled ? 'bg-gray-100' : ''}`}
      >
        {options.map(([val, txt]) => (
          <option key={val} value={val}>
            {txt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function StylishRadio({ value, label, checked, onChange, disabled, colors }) {
  return (
    <label className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all ${
      checked 
        ? `bg-${colors?.light || 'blue-50'} border-transparent ring-2 ${colors?.ring || 'ring-blue-500'}`
        : 'border-gray-300 hover:bg-gray-50'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <input 
        type="radio" 
        className="hidden" 
        value={value} 
        checked={checked} 
        onChange={onChange} 
        disabled={disabled} 
      />
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
        checked 
          ? `${colors?.main || 'bg-blue-600'} border-transparent` 
          : 'border-gray-400 bg-white'
      }`}>
        {checked && (
          <div className="w-2 h-2 rounded-full bg-white"></div>
        )}
      </div>
      <span className={`ml-2 font-medium ${checked ? `${colors?.text || 'text-blue-700'}` : 'text-gray-700'}`}>
        {label}
      </span>
    </label>
  );
}

/* UPDATED Banner component with enhanced error handling */
function Banner({ children, type = "info" }) {
  const backgrounds = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    processing: "bg-yellow-50 text-yellow-800 border-yellow-200"
  };
  
  const icons = {
    info: (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    processing: (
      <svg className="h-5 w-5 text-yellow-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-lg shadow-md px-4 py-4 border ${backgrounds[type]} flex items-center`}
    >
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="font-medium flex-1">
        {children}
      </div>
      {type === "error" && (
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-800 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );
}