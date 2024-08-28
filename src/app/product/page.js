"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";

export default function SearchDemo() {
  const [activeTab, setActiveTab] = useState("products");

  const renderSearchBar = () => {
    switch (activeTab) {
      case "products":
        return <ProductSearch />;
      case "services":
        return <ServiceSearch />;
      case "jewelry":
        return <JewelrySearch />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">חיפוש AI </h1>
        <img src="ai.png" alt="ai" className="w-9 h-9 mr-2"></img>
        </div>

       
        <p className="text-gray-600 mb-8 text-center"> לפניכם דמו (מצומצם) של המוצר בשני מתארים- חיפוש סמנטי לפי תיאור וחיפוש לפי תוכן תמונה. התוצאות הרלוונטיות ביותר יסודרו מימין לשמאל, כשהתוצאה הרלוונטית ביותר תופיע מימין למעלה. </p>
   
        <div className="bg-gray-400 bg-opacity-20 rounded-xl p-6 backdrop-filter backdrop-blur-lg">
          <div className="flex justify-center mb-8 bg-gray-100 p-2  shadow-inner">
            {["products", "services", "jewelry"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
        px-6 py-2 rounded-full text-sm font-medium
        ${
          activeTab === tab
            ? "bg-white text-purple-700 shadow-md"
            : "text-gray-600 hover:bg-gray-200"
        }
        transition-all duration-300 mx-1
      `}
              >
                {tab === "products" && "יין"}
                {tab === "services" && "בגדים"}
                {tab === "jewelry" && "תכשיטים"}
          
              </button>
            ))}
          </div>

          {renderSearchBar()}
        </div>
      </div>
    </div>
  );
}

function ProductSearch() {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const requestBody = {
      mongodbUri:
        "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      dbName: "wineDB",
      collectionName: "newallcohome",
      query: query,
      noWord: ["wine", "white","red", "rose", "rosé"],
      systemPrompt:
        'extract the next filters out of the query- minPrice, maxPrice, category and type. the categories are only the next hebrew words- יין אדום, יין לבן, יין מבעבע, יין רוזה. the types are only the next hebrew words- כשר, מבצע or both (כשר,מבצע) answer ONLY with the JSON response'
    };
  
    // Fetch products when the component mounts
    useEffect(() => {
      const fetchInitialProducts = async () => {
        try {
          const mongodbUri = encodeURIComponent(
            "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
          );
          const dbName = encodeURIComponent("wineDB");
          const collectionName = encodeURIComponent("newallcohome");
          const limit = 10;
  
          const url = `https://shopifyserver-8o24.onrender.com/products?mongodbUri=${mongodbUri}&dbName=${dbName}&collectionName=${collectionName}&limit=${limit}`;
  
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          const products = await response.json();
          setProducts(products); // Update the UI with the fetched products
        } catch (error) {
          console.error("Error fetching products:", error);
          setError("Failed to fetch products");
        }
      };
  
      fetchInitialProducts();
    }, []); // Empty dependency array ensures this runs only once on mount
  
    // Function to fetch products based on user query
    const fetchProducts = async () => {
      setLoading(true);
  
      try {
        const response = await fetch(
          "https://shopifyserver-8o24.onrender.com/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        setProducts(data);
    
        setError(data.results?.length === 0 ? "No products found" : "");
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
  
    const handleSearch = () => {
      if (query.trim()) {
        fetchProducts();
      }
    };
  

  return (
    <div>
      
      <div className="flex">
       

        <input
          type="text"
          placeholder='"יין אדום לארוחה איטלקית בפחות מ100 שקלים"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="animated-placeholder w-full p-3 border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white bg-opacity-20 text-black"
        />
        <button
          onClick={handleSearch}
          className="p-3 mr-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          חפש
        </button>
      </div>

      {loading && <p className="mt-4 text-center">טוען...</p>}
      {error && <p className="mt-4 text-center text-red-300">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 && !loading && !error && (
          <p className="text-black font-semibold text-center col-span-full">
            טוען...
          </p>
        )}
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105"
          >
            <div className="w-65 h-72 mb-4 flex justify-center items-center">
              <img
                width={70}
                height={100}
                src={product.image}
                alt={product.title}
                className="rounded-md object-cover h-full"
              />
            </div>

            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-black-200 mb-3">{product.description}</p>
            <p className="text-black-300 font-bold mb-4">₪{product.price}</p>
            <a
              href={product.url}
              className="text-purple-300 hover:text-purple-100 transition-colors duration-200"
            >
              לפרטים נוספים
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceSearch() {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const requestBody = {
      mongodbUri:
        "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      dbName: "website",
      collectionName: "clothes",
      siteId: "clothes",
      query: query,
      systemPrompt:
        'extract the right category out of the query, it can be only - ילדים, גבר, אישה. in hebrew only! answer in JSON with the category hebrew name only (e.g- {category: "ילדים"}. if you cant find any category out of the query, return - null (e.g- {category: null})',
    };
  
    // Fetch products when the component mounts
    useEffect(() => {
      const fetchInitialProducts = async () => {
        try {
          const mongodbUri = encodeURIComponent(
           "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
          );
          const dbName = encodeURIComponent("picsearchDB");
          const collectionName = encodeURIComponent("picsearchCollection");
          const limit = 10;
  
          const url = `https://shopifyserver-8o24.onrender.com/products?mongodbUri=${mongodbUri}&dbName=${dbName}&collectionName=${collectionName}&limit=${limit}`;
  
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          const products = await response.json();
          setProducts(products); // Update the UI with the fetched products
        } catch (error) {
          console.error("Error fetching products:", error);
          setError("Failed to fetch products");
        }
      };
  
      fetchInitialProducts();
    }, []); // Empty dependency array ensures this runs only once on mount
  
    // Function to fetch products based on user query
    const fetchProducts = async () => {
      setLoading(true);
  
      try {
        const response = await fetch(
          "https://shopifyserver-8o24.onrender.com/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        setProducts(data);
        
        setError(data.results?.length === 0 ? "No products found" : "");
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
  
    const handleSearch = () => {
      if (query.trim()) {
        fetchProducts();
      }
    };
  

  return (
    <div>
     
      <div className="flex">
      

        <input
          type="text"
          placeholder='"סנדל אלגנטי"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="animated-placeholder w-full p-3 border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white bg-opacity-20 text-black"
        />
        <button
          onClick={handleSearch}
          className="p-3 mr-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          חפש
        </button>
      </div>

      {loading && <p className="mt-4 text-center">טוען...</p>}
      {error && <p className="mt-4 text-center text-red-300">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 && !loading && !error && (
          <p className="text-black font-semibold text-center col-span-full">
            טוען...
          </p>
        )}
        {products.map((product) => (
        
          <div
            key={product.id}
            className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105"
          >
            <div className="w-82 h-62 mb-4 flex justify-center items-center">
              <img
                width={230}
                height={100}
                src={product.image}
                alt={product.title}
                className="rounded-md object-cover h-full"
              />
            </div>

            <p className="text-xl font-semibold mb-2 text-black">{product.title}</p>
      
           
            <a
              href={product.url}
              className="text-purple-300 hover:text-purple-100 transition-colors duration-200"
            >
              לפרטים נוספים
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
function JewelrySearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestBody = {
    mongodbUri:
      "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    dbName: "website",
    collectionName: "jewelry",
    siteId: "jewelry",
    query: query,
    noWord: ["ring","silver","gold","bracelet","earring","earrings"],
    systemPrompt:
      'extract the next filter out of the query- type (can be silver or gold only), and category (can be ring, bracelet or earrings) answer in the next format {type: gold, category: ring} and if the type or category did not mentioned, return null. answer in json format (e.g- {"type": "gold", "category": "ring"}).',
  };

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const mongodbUri = encodeURIComponent(
          "mongodb+srv://galpaz2210:22Galpaz22@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        );
        const dbName = encodeURIComponent("wineDB");
        const collectionName = encodeURIComponent("jewelry");
        const limit = 10;

        const url = `https://shopifyserver-8o24.onrender.com/products?mongodbUri=${mongodbUri}&dbName=${dbName}&collectionName=${collectionName}&limit=${limit}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const products = await response.json();
        setProducts(products); // Update the UI with the fetched products
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products");
      }
    };

    fetchInitialProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to fetch products based on user query
  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://shopifyserver-8o24.onrender.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data);
      
      setError(data.results?.length === 0 ? "No products found" : "");
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      fetchProducts();
    }
  };


return (
  <div>
    <h1 className=" font-bold mb-8">כרגע במלאי החיפוש יש צמידים וטבעות בלבד- יתעדכן בקרוב</h1>
   
    <div className="flex">
      

      <input
        type="text"
        placeholder='"צמיד כסף משובץ אבנים שחורות", "טבעת זהב חלקה עם יהלום קטן" '
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="animated-placeholder w-full p-3 border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white bg-opacity-20 text-black"
      />
      <button
        onClick={handleSearch}
        className="p-3 mr-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
      >
        חפש
      </button>
    </div>

    {loading && <p className="mt-4 text-center">טוען...</p>}
    {error && <p className="mt-4 text-center text-red-300">{error}</p>}

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.length === 0 && !loading && !error && (
        <p className="text-black font-semibold text-center col-span-full">
          טוען...
        </p>
      )}
      {products.map((product) => (
      
        <div
          key={product.id}
          className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105"
        >
          <div className="w-75 h-65 mb-4 flex justify-center items-center">
            <img
              width={200}
              height={100}
              src={product.image}
              alt={product.title}
              className="rounded-md object-cover h-full"
            />
          </div>

          <p className="text-xl font-semibold mb-2 text-black">{product.title}</p>
    
         
          <a
            href={product.url}
            className="text-purple-300 hover:text-purple-100 transition-colors duration-200"
          >
            לפרטים נוספים
          </a>
        </div>
      ))}
    </div>
  </div>
);
}
