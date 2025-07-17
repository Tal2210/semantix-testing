<?php
/**
 * Semantix Custom Search Results Template
 *
 * This template is responsible for rendering the search results when the "Custom"
 * template type is selected in the plugin's advanced settings. It fetches results
 * directly from the Semantix API and renders them using custom HTML and CSS.
 *
 * FEATURES:
 * - CSS-only image sizing solution (no JavaScript complexity)
 * - Diagonal stripe-style type ribbons with customizable colors
 * - Enhanced product cards with proper image handling
 * - Professional ribbon design for product categories
 * - AI-powered explanations for perfect matches
 * - Centered product titles for better visual appeal
 * - Query + Results storage (first 50 results cached with query)
 *
 * STORAGE SYSTEM:
 * - Saves search query + first 50 results together
 * - Uses in-memory storage in this artifact (replace with sessionStorage in production)
 * - Caches results for instant loading on repeated searches
 * - Includes timestamp for data aging and cleanup
 * - Perfect for "recent searches" and performance optimization
 *
 * STORAGE STRUCTURE:
 * {
 *   query: "search term",
 *   results: [...], // First 50 product results
 *   timestamp: 1234567890 // When saved
 * }
 *
 * FOR PRODUCTION (WordPress site):
 * Replace the in-memory functions with the sessionStorage code provided in comments
 * - Persists across page refreshes during the same browser session
 * - Automatically clears when browser session ends
 * - Can implement aging/expiration logic
 *
 * ADMIN SETTINGS:
 * - semantix_ribbon_bg_color: Background color for type ribbons (default: #1a1a1a)
 * - semantix_ribbon_text_color: Text color for type ribbons (default: #ffffff)
 * - Standard card dimensions and colors
 *
 * @package SemantixAI
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Get the search query from the URL.
$search_query = get_search_query();

// Get custom template settings from options.
$card_width     = get_option( 'semantix_card_width', '320' );
$card_height    = get_option( 'semantix_card_height', '460' );
$image_height   = get_option( 'semantix_image_height', '240' );
$ribbon_bg_color = get_option( 'semantix_ribbon_bg_color', '#1a1a1a' ); // Ribbon background color
$ribbon_text_color = get_option( 'semantix_ribbon_text_color', '#ffffff' ); // Ribbon text color
$card_bg        = get_option( 'semantix_card_bg_color', '#ffffff' );
$title_color    = get_option( 'semantix_title_color', '#1a1a1a' );
$price_color    = get_option( 'semantix_price_color', '#2563eb' );
$btn_bg_color   = get_option( 'semantix_button_bg_color', '#1a1a1a' );
$btn_text_color = get_option( 'semantix_button_text_color', '#ffffff' );

// Get API settings
$api_endpoint   = get_option( 'semantix_search_api_endpoint', 'https://dashboard-server-ae00.onrender.com/search' );
$api_key        = get_option( 'semantix_api_key', '' );
$dbname         = get_option( 'semantix_dbname', 'alcohome' );
$c1             = get_option( 'semantix_collection1', 'products' );
$c2             = get_option( 'semantix_collection2', 'queries' );

// Prepare data for JavaScript
$js_data = [
    'nonce'        => wp_create_nonce( 'semantix_custom_search_nonce' ),
    'apiEndpoint'  => $api_endpoint,
    'apiKey'       => $api_key,
    'dbName'       => $dbname,
    'collection1'  => $c1,
    'collection2'  => $c2,
    'searchQuery'  => $search_query,
];

get_header(); ?>

<style>
    /* Reset and base styles */
    * {
        box-sizing: border-box;
    }

    /* Main container */
    #semantix-custom-results-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    /* Page header */
    .page-header {
        text-align: center;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .page-title {
        font-size: 2.5rem;
        font-weight: 300;
        color: #1a1a1a;
        margin: 0;
        letter-spacing: -0.025em;
    }

    .page-title span {
        font-weight: 600;
        color: #2563eb;
    }

    /* Results grid */
    #semantix-custom-results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(<?php echo esc_attr( max(280, $card_width) ); ?>px, 1fr));
        gap: 2rem;
        justify-items: center;
        margin-top: 2rem;
    }

    /* Loading state */
    .semantix-loader {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
    }

    .semantix-loader::before {
        content: '';
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 1rem;
        vertical-align: middle;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Product cards */
    .semantix-product-card {
        width: 100%;
        max-width: <?php echo esc_attr( $card_width ); ?>px;
        min-height: <?php echo esc_attr( $card_height ); ?>px;
        background: <?php echo esc_attr( $card_bg ); ?>;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #f3f4f6;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .semantix-product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: #e5e7eb;
    }

    /* Product image container with forced sizing */
    .semantix-product-image-container {
        position: relative;
        width: 100%;
        height: <?php echo esc_attr( $image_height ); ?>px;
        overflow: hidden;
        background: #f9fafb;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .semantix-product-image {
        width: auto !important;
        height: auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
        transition: transform 0.3s ease;
    }

    .semantix-product-image-container img {
        width: auto !important;
        height: auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
        display: block !important;
    }

    /* Force image to fit properly */
    .semantix-product-image-container a {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .semantix-product-image-container a img {
        width: auto !important;
        height: auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
    }

    /* Type ribbon - diagonal stripe style */
    .semantix-type-ribbon {
        position: absolute;
        top: 15px;
        left: -30px;
        background: <?php echo esc_attr( $ribbon_bg_color ); ?>;
        color: <?php echo esc_attr( $ribbon_text_color ); ?>;
        padding: 5px 40px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        z-index: 2;
        white-space: nowrap;
        text-align: center;
        min-width: 100px;
    }

    /* Multiple type ribbons stacked */
    .semantix-type-ribbon:nth-child(2) {
        top: 35px;
        left: -25px;
    }

    .semantix-type-ribbon:nth-child(3) {
        top: 55px;
        left: -20px;
    }

    .semantix-product-card:hover .semantix-product-image {
        transform: scale(1.05);
    }

    /* Product content */
    .semantix-product-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex-grow: 1;
    }

    .semantix-product-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: <?php echo esc_attr( $title_color ); ?>;
        line-height: 1.4;
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-align: center;
    }

    .semantix-product-title a {
        text-decoration: none;
        color: inherit;
        transition: color 0.2s ease;
        display: block;
    }

    .semantix-product-title a:hover {
        color: #2563eb;
    }

    .semantix-product-price {
        font-size: 1.25rem;
        font-weight: 700;
        color: <?php echo esc_attr( $price_color ); ?>;
        margin: 0 0 1rem;
        letter-spacing: -0.025em;
        text-align: center;
    }

    /* Perfect Match Badge */
    .semantix-perfect-match-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #1a1a1a;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 4px;
        animation: perfectMatchGlow 2s ease-in-out infinite alternate;
    }

    .semantix-perfect-match-badge::before {
        content: '✨';
        font-size: 0.875rem;
        animation: sparkle 1.5s ease-in-out infinite;
    }

    @keyframes perfectMatchGlow {
        0% { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); }
        100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 0, 0, 0.2); }
    }

    @keyframes sparkle {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
    }

    /* Product explanation */
    .semantix-product-explanation {
        font-size: 0.875rem;
        color: #e5e7eb;
        line-height: 1.4;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: #374151;
        border-radius: 8px;
        border: 1px solid #1f2937;
        position: relative;
        padding-left: 2.5rem;
    }

    .semantix-product-explanation::before {
        content: '✨';
        position: absolute;
        left: 0.75rem;
        top: 0.75rem;
        font-size: 1rem;
        color: #60a5fa;
    }

    /* Add to cart button */
    .semantix-add-to-cart {
        display: block;
        background: <?php echo esc_attr( $btn_bg_color ); ?>;
        color: <?php echo esc_attr( $btn_text_color ); ?>;
        text-align: center;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        letter-spacing: 0.025em;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        margin-top: auto;
    }

    .semantix-add-to-cart:hover {
        background: #374151;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Empty state */
    .semantix-empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
    }

    .semantix-empty-state h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 1rem;
    }

    .semantix-empty-state p {
        font-size: 1rem;
        margin: 0;
        max-width: 400px;
        margin: 0 auto;
        line-height: 1.6;
    }

    /* Error state */
    .semantix-error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: #dc2626;
        background: #fef2f2;
        border-radius: 12px;
        border: 1px solid #fecaca;
    }

    .semantix-error-state h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #dc2626;
    }

    .semantix-error-state p {
        margin: 0;
        color: #7f1d1d;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        #semantix-custom-results-container {
            padding: 1rem;
        }

        .page-title {
            font-size: 2rem;
        }

        #semantix-custom-results-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .semantix-product-content {
            padding: 1.25rem;
        }

        .semantix-product-title {
            font-size: 1rem;
        }

        .semantix-product-price {
            font-size: 1.125rem;
        }
    }

    @media (max-width: 480px) {
        #semantix-custom-results-grid {
            grid-template-columns: 1fr;
        }
        
        .semantix-product-card {
            max-width: 100%;
        }
        
        .semantix-type-ribbon {
            font-size: 0.65rem;
            padding: 4px 30px;
            min-width: 80px;
        }
        
        .semantix-type-ribbon:nth-child(2) {
            top: 30px;
        }
        
        .semantix-type-ribbon:nth-child(3) {
            top: 45px;
        }
    }

    /* Accessibility improvements */
    .semantix-add-to-cart:focus,
    .semantix-product-title a:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }

    /* Smooth scrolling */
    html {
        scroll-behavior: smooth;
    }
</style>

<div id="primary" class="content-area">
    <main id="main" class="site-main">

        <header class="page-header">
            <h1 class="page-title">
                <?php
                /* translators: %s: search query. */
                printf( esc_html__( 'Search Results for: %s', 'semantix-ai-search' ), '<span>' . esc_html( $search_query ) . '</span>' );
                ?>
            </h1>
        </header>

        <div id="semantix-custom-results-container">
            <div id="semantix-custom-results-grid">
                <div class="semantix-loader">Loading products...</div>
            </div>
        </div>

    </main>
</div>

<script id="semantix-custom-template-js">
document.addEventListener('DOMContentLoaded', () => {
    const SEMANTIX_DATA = <?php echo wp_json_encode( $js_data ); ?>;
    const resultsGrid = document.getElementById('semantix-custom-results-grid');
    let retryCount = 0;
    const maxRetries = 3;

    // In-memory storage for query and results (sessionStorage not supported in Claude.ai)
    let savedSearchData = null;
    
    // Save query and results (first 50 items)
    function saveSearchData(query, results) {
        const dataToSave = {
            query: query,
            results: results.slice(0, 50), // Save only first 50 results
            timestamp: Date.now()
        };
        
        savedSearchData = dataToSave;
        console.log('Search data saved:', {
            query: query,
            resultsCount: dataToSave.results.length,
            timestamp: new Date(dataToSave.timestamp).toLocaleString()
        });
        
        // For production: sessionStorage.setItem('semantix_search_data', JSON.stringify(dataToSave));
    }
    
    // Get saved search data
    function getSavedSearchData() {
        // For production: 
        // const saved = sessionStorage.getItem('semantix_search_data');
        // return saved ? JSON.parse(saved) : null;
        return savedSearchData;
    }
    
    // Get just the last query
    function getLastQuery() {
        const searchData = getSavedSearchData();
        return searchData ? searchData.query : '';
    }
    
    // Get saved results
    function getSavedResults() {
        const searchData = getSavedSearchData();
        return searchData ? searchData.results : [];
    }
    
    // Check if current query matches saved query
    function isQueryCached(query) {
        const searchData = getSavedSearchData();
        return searchData && searchData.query.toLowerCase().trim() === query.toLowerCase().trim();
    }
    
    // Clear saved data
    function clearSavedData() {
        savedSearchData = null;
        // For production: sessionStorage.removeItem('semantix_search_data');
        console.log('Saved search data cleared');
    }

    async function fetchResults() {
        // Validate required data
        if (!SEMANTIX_DATA.searchQuery || !SEMANTIX_DATA.apiEndpoint) {
            console.error('Missing required search parameters');
            showErrorState('Search configuration is incomplete. Please check your settings.');
            return;
        }

        // Check if we have cached results for this exact query
        if (isQueryCached(SEMANTIX_DATA.searchQuery)) {
            console.log('✅ Using cached results for:', SEMANTIX_DATA.searchQuery);
            const cachedResults = getSavedResults();
            renderProducts(cachedResults);
            return;
        }

        // Prepare the request body
        const requestBody = {
            query: SEMANTIX_DATA.searchQuery,
            dbName: SEMANTIX_DATA.dbName,
            collectionName1: SEMANTIX_DATA.collection1,
            collectionName2: SEMANTIX_DATA.collection2
        };

        // Prepare headers
        const headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (SEMANTIX_DATA.apiKey) {
            headers['x-api-key'] = SEMANTIX_DATA.apiKey;
        }

        // Debug logging
        console.log('🔍 Fetching new results for:', SEMANTIX_DATA.searchQuery);
        console.log('POST request to:', SEMANTIX_DATA.apiEndpoint);
        console.log('Request body:', requestBody);

        try {
            const response = await fetch(SEMANTIX_DATA.apiEndpoint, { 
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                mode: 'cors'
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);
            
            // Show sample product structure for debugging
            if (Array.isArray(data) && data.length > 0) {
                console.log('Sample product structure:', {
                    id: data[0].id,
                    name: data[0].name,
                    price: data[0].price,
                    type: data[0].type,
                    highlight: data[0].highlight,
                    explanation: data[0].explanation ? 'Present' : 'Not present'
                });
            }
            
            // Save the query and results (first 50)
            let resultsToSave = [];
            if (Array.isArray(data)) {
                resultsToSave = data;
            } else if (data.products) {
                resultsToSave = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                resultsToSave = data.data;
            }
            
            if (resultsToSave.length > 0) {
                saveSearchData(SEMANTIX_DATA.searchQuery, resultsToSave);
            }
            
            // Handle different response structures
            if (Array.isArray(data)) {
                renderProducts(data);
            } else if (data.products) {
                renderProducts(data.products);
            } else if (data.data && Array.isArray(data.data)) {
                renderProducts(data.data);
            } else {
                console.log('API Response structure:', data);
                console.error('Unexpected API response structure:', data);
                showErrorState('Unexpected response format from the API.');
            }
        } catch (error) {
            console.error('Semantix Search Fetch Error:', error);
            
            // Retry logic
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying... Attempt ${retryCount}/${maxRetries}`);
                showRetryState(retryCount);
                setTimeout(() => fetchResults(), 2000 * retryCount);
                return;
            }
            
            // Show more specific error messages
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showErrorState('Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('CORS')) {
                showErrorState('CORS error. Please check your API configuration.');
            } else {
                showErrorState(`Error: ${error.message}`);
            }
        }
    }

    function renderProducts(products) {
        resultsGrid.innerHTML = '';
        
        if (!products || products.length === 0) {
            showEmptyState();
            return;
        }

        // Debug: Show structure of first product
        if (products.length > 0) {
            console.log('First product structure:', {
                id: products[0].id,
                name: products[0].name,
                price: products[0].price,
                type: products[0].type,
                highlight: products[0].highlight,
                explanation: products[0].explanation ? 'Present' : 'Not present'
            });
        }

        // Show saved data info
        const savedData = getSavedSearchData();
        if (savedData) {
            console.log('📦 Saved search data:', {
                query: savedData.query,
                resultsCount: savedData.results.length,
                savedAt: new Date(savedData.timestamp).toLocaleString()
            });
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'semantix-product-card';

            const productLink = product.url || `/?p=${product.id}`;
            const productImage = product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xMjAgODBMMTQwIDEwMEgxMDBMMTIwIDgwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNODAgMTIwSDE2MFYxNDBIODBWMTIwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNOTAgMTYwSDE1MFYxODBIOTBWMTYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8L3N2Zz4K';
            
            const productPrice = product.price && product.currency ? 
                `${product.price} ${product.currency}` : 
                (product.price || '');

            // Check if product is highlighted for "Perfect Match" - using 'highlight' field
            const perfectMatchBadge = product.highlight ? 
                '<div class="semantix-perfect-match-badge">Perfect Match</div>' : '';

            // Create type ribbons - diagonal stripe style
            let typeRibbons = '';
            if (product.type) {
                const types = Array.isArray(product.type) ? product.type : [product.type];
                const ribbonElements = types.slice(0, 3).map(type => 
                    `<div class="semantix-type-ribbon">${type}</div>`
                ).join('');
                typeRibbons = ribbonElements;
            }

            // Add explanation if available
            const productExplanation = product.explanation ? 
                `<div class="semantix-product-explanation">${product.explanation}</div>` : '';

            // Debug: Check if explanation exists
            if (product.explanation) {
                console.log(`Product ${product.name} has explanation:`, product.explanation);
            }

            card.innerHTML = `
                <div class="semantix-product-image-container">
                    ${typeRibbons}
                    ${perfectMatchBadge}
                    <a href="${productLink}" aria-label="View ${product.name || 'product'}">
                        <img src="${productImage}" 
                             alt="${product.name || 'Product Image'}" 
                             class="semantix-product-image"
                             loading="lazy">
                    </a>
                </div>
                <div class="semantix-product-content">
                    <h2 class="semantix-product-title">
                        <a href="${productLink}">${product.name || 'Untitled Product'}</a>
                    </h2>
                    ${productExplanation}
                    ${productPrice ? `<div class="semantix-product-price">${productPrice}</div>` : ''}
                    <a href="/?add-to-cart=${product.id}" 
                       class="semantix-add-to-cart" 
                       target="_blank" 
                       rel="nofollow"
                       aria-label="Add ${product.name || 'product'} to cart">
                        Add to Cart
                    </a>
                </div>
            `;
            
            resultsGrid.appendChild(card);
        });
    }

    function showRetryState(attempt) {
        resultsGrid.innerHTML = `
            <div class="semantix-loader">
                Retrying... Attempt ${attempt}/3
            </div>
        `;
    }

    function showEmptyState() {
        resultsGrid.innerHTML = `
            <div class="semantix-empty-state">
                <h3>No products found</h3>
                <p>We couldn't find any products matching your search. Try different keywords or browse our categories.</p>
            </div>
        `;
    }

    function showErrorState(customMessage) {
        const errorMessage = customMessage || 'We\'re having trouble loading products right now. Please try again later.';
        resultsGrid.innerHTML = `
            <div class="semantix-error-state">
                <h3>Something went wrong</h3>
                <p>${errorMessage}</p>
            </div>
        `;
    }

    // Start fetching results
    fetchResults();
    
    // Example: Show saved data on page load
    window.addEventListener('load', function() {
        const savedData = getSavedSearchData();
        if (savedData) {
            console.log('📂 Previous search data found:', {
                query: savedData.query,
                resultsCount: savedData.results.length,
                savedAt: new Date(savedData.timestamp).toLocaleString()
            });
        }
    });
});

/*
===============================================================================
PRODUCTION CODE FOR sessionStorage (First 50 Results + Query):
===============================================================================
Replace the in-memory functions above with these for your WordPress site:

// Save query and first 50 results using sessionStorage
function saveSearchData(query, results) {
    const dataToSave = {
        query: query,
        results: results.slice(0, 50), // Save only first 50 results
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('semantix_search_data', JSON.stringify(dataToSave));
    console.log('Search data saved to sessionStorage:', {
        query: query,
        resultsCount: dataToSave.results.length,
        timestamp: new Date(dataToSave.timestamp).toLocaleString()
    });
}

// Get saved search data from sessionStorage
function getSavedSearchData() {
    const saved = sessionStorage.getItem('semantix_search_data');
    return saved ? JSON.parse(saved) : null;
}

// Get just the last query
function getLastQuery() {
    const searchData = getSavedSearchData();
    return searchData ? searchData.query : '';
}

// Get saved results
function getSavedResults() {
    const searchData = getSavedSearchData();
    return searchData ? searchData.results : [];
}

// Check if current query matches saved query
function isQueryCached(query) {
    const searchData = getSavedSearchData();
    return searchData && searchData.query.toLowerCase().trim() === query.toLowerCase().trim();
}

// Clear saved data
function clearSavedData() {
    sessionStorage.removeItem('semantix_search_data');
    console.log('Saved search data cleared');
}

// Get saved data age (in minutes)
function getSavedDataAge() {
    const searchData = getSavedSearchData();
    if (!searchData) return null;
    return Math.floor((Date.now() - searchData.timestamp) / (1000 * 60));
}

// Example usage on page load
window.addEventListener('load', function() {
    const savedData = getSavedSearchData();
    if (savedData) {
        const ageInMinutes = getSavedDataAge();
        console.log('Previous search data:', {
            query: savedData.query,
            resultsCount: savedData.results.length,
            ageInMinutes: ageInMinutes,
            savedAt: new Date(savedData.timestamp).toLocaleString()
        });
        
        // Optional: Clear old data (older than 30 minutes)
        if (ageInMinutes > 30) {
            clearSavedData();
            console.log('Old search data cleared');
        }
    }
});

// Example: Use saved results for "Recent searches" feature
function showRecentSearch() {
    const lastQuery = getLastQuery();
    const savedResults = getSavedResults();
    
    if (lastQuery && savedResults.length > 0) {
        console.log(`You recently searched for "${lastQuery}" and found ${savedResults.length} results`);
        // Show in UI: "You recently searched for 'wine' - Show results"
    }
}
*/
</script>

<?php get_footer(); ?>