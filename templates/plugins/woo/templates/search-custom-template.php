<?php
/**
 * Semantix Custom Search Results Template
 *
 * This template is responsible for rendering the search results when the "Custom"
 * template type is selected in the plugin's advanced settings. It fetches results
 * directly from the Semantix API and renders them using custom HTML and CSS.
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
        background: <?php echo esc_attr( $card_bg ); ?>;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #f3f4f6;
        position: relative;
    }

    .semantix-product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: #e5e7eb;
    }

    /* Product image */
    .semantix-product-image-container {
        position: relative;
        width: 100%;
        height: <?php echo esc_attr( $image_height ); ?>px;
        overflow: hidden;
        background: #f9fafb;
    }

    .semantix-product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
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
        height: calc(<?php echo esc_attr( $card_height ); ?>px - <?php echo esc_attr( $image_height ); ?>px);
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
    }

    .semantix-product-title a {
        text-decoration: none;
        color: inherit;
        transition: color 0.2s ease;
    }

    .semantix-product-title a:hover {
        color: #2563eb;
    }

    .semantix-product-price {
        font-size: 1.25rem;
        font-weight: 700;
        color: <?php echo esc_attr( $price_color ); ?>;
        margin: 0;
        letter-spacing: -0.025em;
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

    async function fetchResults() {
        const url = new URL(SEMANTIX_DATA.apiEndpoint);
        url.searchParams.set('query', SEMANTIX_DATA.searchQuery);
        url.searchParams.set('dbName', SEMANTIX_DATA.dbName);
        url.searchParams.set('collectionName1', SEMANTIX_DATA.collection1);
        url.searchParams.set('collectionName2', SEMANTIX_DATA.collection2);

        const headers = { 'Content-Type': 'application/json' };
        if (SEMANTIX_DATA.apiKey) {
            headers['x-api-key'] = SEMANTIX_DATA.apiKey;
        }

        try {
            const response = await fetch(url.toString(), { headers });
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            renderProducts(data.products);
        } catch (error) {
            console.error('Semantix Search Fetch Error:', error);
            showErrorState();
        }
    }

    function renderProducts(products) {
        resultsGrid.innerHTML = '';
        
        if (!products || products.length === 0) {
            showEmptyState();
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'semantix-product-card';

            const productLink = product.url || `/?p=${product.id}`;
            const productImage = product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xMjAgODBMMTQwIDEwMEgxMDBMMTIwIDgwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNODAgMTIwSDE2MFYxNDBIODBWMTIwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNOTAgMTYwSDE1MFYxODBIOTBWMTYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8L3N2Zz4K';
            
            const productPrice = product.price && product.currency ? 
                `${product.price} ${product.currency}` : 
                (product.price || '');

            card.innerHTML = `
                <div class="semantix-product-image-container">
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

    function showEmptyState() {
        resultsGrid.innerHTML = `
            <div class="semantix-empty-state">
                <h3>No products found</h3>
                <p>We couldn't find any products matching your search. Try different keywords or browse our categories.</p>
            </div>
        `;
    }

    function showErrorState() {
        resultsGrid.innerHTML = `
            <div class="semantix-error-state">
                <h3>Something went wrong</h3>
                <p>We're having trouble loading products right now. Please try again later.</p>
            </div>
        `;
    }

    fetchResults();
});
</script>

<?php get_footer(); ?>