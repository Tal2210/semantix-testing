"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Hooks for state.
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Date filtering defaults: last 30 days.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Automatically fetch queries once session is available.
  useEffect(() => {
    if (session && session.user && session.user.dbName) {
      const fetchQueries = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await fetch("https://dashboard-server-ae00.onrender.com/queries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbName: session.user.dbName }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Error fetching queries");
          }
          setQueries(data.queries);
          setCurrentPage(1);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchQueries();
    }
  }, [session]);

  // Compute unique category options - improved to handle array categories
  useEffect(() => {
    const allCategories = [];
    
    // Extract categories, handling both string and array formats
    queries.forEach(q => {
      if (typeof q.category === "string" && q.category.trim()) {
        allCategories.push(q.category.trim().toLowerCase());
      } else if (Array.isArray(q.category)) {
        q.category.forEach(cat => {
          if (typeof cat === "string" && cat.trim()) {
            allCategories.push(cat.trim().toLowerCase());
          }
        });
      }
    });
    
    // Create unique list and format for display
    const uniqueCategories = Array.from(new Set(allCategories));
    const displayCategories = uniqueCategories.map(
      cat => cat.charAt(0).toUpperCase() + cat.slice(1)
    );
    
    setCategoryOptions(displayCategories);
  }, [queries]);

  // Updated filtering logic to handle array categories
  const filteredQueries = queries.filter((q) => {
    let match = true;
    
    // Category filter handling both string and array formats
    if (filters.category) {
      const selectedCategory = filters.category.toLowerCase();
      
      if (typeof q.category === "string") {
        // Handle string category
        if (q.category.trim().toLowerCase() !== selectedCategory) {
          match = false;
        }
      } else if (Array.isArray(q.category)) {
        // Handle array category - check if any array item matches
        const hasMatchingCategory = q.category.some(
          cat => typeof cat === "string" && cat.trim().toLowerCase() === selectedCategory
        );
        if (!hasMatchingCategory) {
          match = false;
        }
      } else {
        // No category data available
        match = false;
      }
    }
    
    // Other filters remain the same
    if (filters.type && q.type !== filters.type) match = false;
    if (filters.minPrice && q.price < parseFloat(filters.minPrice)) match = false;
    if (filters.maxPrice && q.price > parseFloat(filters.maxPrice)) match = false;
    
    // Date filters
    if (startDate || endDate) {
      const queryDate = new Date(q.timestamp);
      if (startDate) {
        const start = new Date(startDate);
        if (queryDate < start) match = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        // Add one day to include the end date fully
        end.setDate(end.getDate() + 1);
        if (queryDate > end) match = false;
      }
    }
    
    return match;
  });

  // Counters.
  const totalLoaded = queries.length;
  const filteredCount = filteredQueries.length;

  // Pagination calculation.
  const totalPages = Math.ceil(filteredCount / itemsPerPage);
  const displayedQueries = filteredQueries.slice(0)
  .reverse()
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit pagination buttons: maximum of 5.
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  if (totalPages > maxPageButtons) {
    if (currentPage <= 3) {
      startPage = 1;
      endPage = maxPageButtons;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxPageButtons + 1;
      endPage = totalPages;
    }
  } else {
    startPage = 1;
    endPage = totalPages;
  }
  const paginationNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    paginationNumbers.push(i);
  }

  const handlePrevious = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  // Download filtered queries as CSV.
  const downloadCSV = () => {
    // Define CSV headers.
    const headers = [
      "Query",
      "Timestamp",
      "Category",
      "Price",
      "Min Price",
      "Max Price",
      "Type",
      "Entity",
    ];
    // Map over filtered queries to create CSV rows.
    const rows = filteredQueries.map((q) => [
      `"${(q.query || "").replace(/"/g, '""')}"`,
      `"${new Date(q.timestamp).toLocaleString()}"`,
      `"${Array.isArray(q.category) ? q.category.join(", ") : (q.category || "")}"`,
      `"${q.price || ""}"`,
      `"${q.minPrice || ""}"`,
      `"${q.maxPrice || ""}"`,
      `"${q.type || ""}"`,
      `"${q.entity || ""}"`,
    ].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    // Create a Blob and trigger download.
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "queries.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-xl text-gray-600">
          Loading session...
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-xl text-gray-700">
            You must be logged in to view this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="ltr" className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg mb-8 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
              <p className="text-blue-100 mt-1">
                Welcome back, {session?.user?.name || "User"}
              </p>
            </div>
            <button
              onClick={() =>
                signOut({ redirect: false }).then(() => router.push("/"))
              }
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors shadow font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Filter Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Filter Queries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat, idx) => (
                  <option key={idx} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                placeholder="Filter by type"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                placeholder="Minimum price"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                placeholder="Maximum price"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-gray-700 font-medium">
              Total loaded:{" "}
              <span className="text-blue-600 font-bold ml-1">
                {totalLoaded}
              </span>
            </p>
            <p className="text-gray-700 font-bold">
              Matching filters:{" "}
              <span className="text-blue-600 font-bold ml-1">
                {filteredCount}
              </span>
            </p>
          </div>
          {/* Download CSV Button */}
          {filteredCount > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={downloadCSV}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow"
              >
                Download CSV
              </button>
            </div>
          )}
        </section>

        {/* Table Section */}
        {filteredQueries.length > 0 && (
          <section className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Query
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Min Price
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Max Price
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold border-b">
                      Entity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedQueries.map((query, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.query}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {new Date(query.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {Array.isArray(query.category) 
                          ? query.category.join(", ") 
                          : query.category}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.price}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.minPrice}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.maxPrice}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.type}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        {query.entity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination mt-4 flex justify-center items-center gap-2">
                {startPage > 1 && (
                  <>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageClick(1)}
                    >
                      1
                    </button>
                    {startPage > 2 && <span className="ellipsis">...</span>}
                  </>
                )}
                <button
                  className="pagination-btn"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {paginationNumbers.map((number) => (
                  <button
                    key={number}
                    className={`pagination-btn ${
                      number === currentPage ? "active" : ""
                    }`}
                    onClick={() => handlePageClick(number)}
                  >
                    {number}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="ellipsis">...</span>
                    )}
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageClick(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </div>
      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .dashboard-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1rem;
        }
        .dashboard-header h1 {
          margin: 0;
          font-size: 2.5rem;
          color: #333;
        }
        .signout-btn {
          padding: 0.6rem 1.2rem;
          background: #ff4d4f;
          border: none;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }
        .signout-btn:hover {
          background: #e04344;
        }
        .db-form-section {
          text-align: center;
          margin-bottom: 2rem;
        }
        .db-form {
          display: none; /* Removed form as dbName is auto-fetched */
        }
        .loading-text {
          font-size: 1rem;
          color: #555;
        }
        .error-text {
          color: #ff4d4f;
          font-size: 1rem;
        }
        .filter-section {
          margin-bottom: 2rem;
          text-align: center;
        }
        .filter-section h2 {
          margin-bottom: 1rem;
          font-size: 2rem;
          color: #333;
        }
        .filters {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .filters select,
        .filters input[type="text"],
        .filters input[type="number"] {
          padding: 0.75rem;
          width: 220px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
          background: #fff;
        }
        .date-filters {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-top: 1rem;
        }
        .date-filters div {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .date-filters label {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #555;
        }
        .counter-text {
          margin-top: 1rem;
          font-size: 1rem;
          color: #333;
        }
        .queries-section {
          margin-top: 3rem;
        }
        .queries-table {
          width: 100%;
          border-collapse: collapse;
          background: #fafafa;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }
        .queries-table th,
        .queries-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eaeaea;
        }
        .queries-table th {
          background: #f0f2f5;
          font-weight: 600;
        }
        .queries-table tr:hover {
          background: #f9f9f9;
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .pagination-btn {
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .pagination-btn:hover {
          background: #005bb5;
        }
        .pagination-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .pagination-btn.active {
          background: #005bb5;
          font-weight: bold;
        }
        .ellipsis {
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          color: #333;
        }
      `}</style>
    </div>
  );
}