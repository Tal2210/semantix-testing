<?php
/**
 * Template Name: Semantix AI – Native WooCommerce Search (Multilingual)
 * File: search-custom.php
 * Place this file in: /wp-content/plugins/semantix-ai-search/templates/search-custom.php
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// API settings
$semantix_search_host = rtrim( get_option( 'semantix_api_endpoint', '' ), '/' );
$semantix_api_key     = get_option( 'semantix_api_key', '' );
$ajax_url   = admin_url('admin-ajax.php');
$ajax_nonce = wp_create_nonce('semantix_nonce');

get_header();
?>

<style>
/* ===== MINIMAL STYLING - LET WOOCOMMERCE HANDLE EVERYTHING ===== */

.semantix-wrapper {
    /* Use theme's container styling */
    max-width: inherit;
    margin: 0;
    padding: 0;
}

/* Simple header styling */
.semantix-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px 0 15px 0;
    border-bottom: 1px solid #eee;
}

.semantix-search-query {
    font-size: 24px;
    margin: 0;
    color: inherit;
    font-family: inherit;
    font-weight: 600;
	padding-left:20px;
}

.semantix-powered-logo {
    opacity: 0.7;
    transition: opacity 0.3s ease;
	padding-right:20px;
}

.semantix-powered-logo:hover {
    opacity: 1;
}

/* ===== CONTAINER - NO OVERRIDES ===== */
.semantix-results-container {
    /* Let WooCommerce and theme handle ALL styling */
    position: relative;
}

/* ===== LOADING AND MESSAGES ONLY ===== */
.semantix-loading {
    text-align: center;
    padding: 40px 20px;
}

.semantix-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007cba;
    border-radius: 50%;
    animation: semantix-spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes semantix-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.semantix-message {
    text-align: center;
    padding: 30px 20px;
    color: #666;
    background: #f9f9f9;
    border-radius: 4px;
    margin: 20px 0;
}

/* ===== RESPONSIVE HEADER ONLY ===== */
@media (max-width: 768px) {
    .semantix-header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }
    
    .semantix-search-query {
        font-size: 20px;
    }
}
</style>

<!-- Use theme's content structure -->
<div class="semantix-wrapper">
    <div class="semantix-header">
        <div class="semantix-search-query" id="semantix-search-query"></div>
        <a href="https://semantix.co.il" target="_blank" class="semantix-powered-logo">
            <img src="https://semantix-ai.com/powered.png" alt="Semantix logo" width="120">
        </a>
    </div>

    <!-- Let WooCommerce handle ALL product styling -->
    <div class="woocommerce">
        <div id="semantix-results-container" class="semantix-results-container">
            <!-- Native WooCommerce products will be inserted here -->
        </div>
    </div>
</div>

<script>
(function () {
    'use strict';
    
    // Configuration
    const SEMANTIX_API_SEARCH_ENDPOINT = <?php echo wp_json_encode( rtrim($semantix_search_host, '/') . '/search' ); ?>;
    const SEMANTIX_API_KEY = <?php echo wp_json_encode( $semantix_api_key ); ?>;
    const WP_AJAX_URL = <?php echo wp_json_encode( $ajax_url ); ?>;
    const WP_AJAX_NONCE = <?php echo wp_json_encode( $ajax_nonce ); ?>;

    // DOM Elements
    const searchQueryEl = document.getElementById('semantix-search-query');
    const resultsContainer = document.getElementById('semantix-results-container');

    // Get search term
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('s') || '';

    // Cache
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    // Initialize
    if (!searchTerm) {
        showMessage('');
        return;
    }

    if (searchQueryEl) {
        searchQueryEl.textContent = searchTerm;
    }

    // Start search
    showLoading();
    executeSearch();

    // Helper functions
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="semantix-loading">
                <div class="semantix-spinner"></div>
            </div>
        `;
    }

    function showMessage(message) {
        if (message) {
            resultsContainer.innerHTML = `
                <div class="semantix-message">${message}</div>
            `;
        } else {
            resultsContainer.innerHTML = '';
        }
    }

    function getCacheKey(term) {
        return `semantix_native_${encodeURIComponent(term)}`;
    }

    function getFromCache(key) {
        try {
            const cached = sessionStorage.getItem(key);
            if (cached) {
                const { timestamp, data } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
                sessionStorage.removeItem(key);
            }
        } catch (e) {
            sessionStorage.removeItem(key);
        }
        return null;
    }

    function saveToCache(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {
            console.warn('Failed to save to cache:', e);
        }
    }

    // Fetch products from Semantix API
    async function fetchSemantixProducts() {
        const cacheKey = getCacheKey(`semantix_${searchTerm}`);
        const cached = getFromCache(cacheKey);
        
        if (cached) {
            console.log('Loading Semantix results from cache');
            return cached;
        }

        try {
            const response = await fetch('https://dashboard-server-ae00.onrender.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(SEMANTIX_API_KEY ? { 'x-api-key': SEMANTIX_API_KEY } : {})
                },
                body: JSON.stringify({ query: searchTerm, useImages: true })
            });

            if (!response.ok) {
                throw new Error(`Semantix API Error: ${response.status}`);
            }

            const products = await response.json();
            const productArray = Array.isArray(products) ? products : [];
            
            saveToCache(cacheKey, productArray);
            return productArray;

        } catch (error) {
            console.error('Semantix API Error:', error);
            throw error;
        }
    }

    // Get rendered WooCommerce products using NATIVE theme styling
    async function fetchRenderedWooCommerceProducts(semantixProducts) {
        const productIds = semantixProducts.map(p => p.id).filter(id => id && Number.isInteger(Number(id)) && Number(id) > 0);
        const highlightMap = {};
        semantixProducts.forEach(p => {
            if (p.id) highlightMap[p.id] = p.highlight || false;
        });

        if (productIds.length === 0) {
            showMessage('');
            return;
        }

        // Check cache for rendered HTML
        const cacheKey = getCacheKey(`native_${productIds.join(',')}`);
        const cached = getFromCache(cacheKey);
        
        if (cached) {
            console.log('Loading native products from cache');
            resultsContainer.innerHTML = cached;
            initializeNativeWooCommerce();
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('action', 'semantix_render_products');
            formData.append('product_ids', JSON.stringify(productIds));
            formData.append('highlight_map', JSON.stringify(highlightMap));
            formData.append('search_term', searchTerm);
            formData.append('nonce', WP_AJAX_NONCE);

            const response = await fetch(WP_AJAX_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`WordPress AJAX Error: ${response.status} - ${errorText}`);
            }

            const html = await response.text();
            if (!html.trim()) {
                showMessage('');
                return;
            }

            resultsContainer.innerHTML = html;
            
            // Cache the rendered HTML
            saveToCache(cacheKey, html);

        } catch (error) {
            console.error('WordPress AJAX Error:', error);
            showMessage('');
        } finally {
            initializeNativeWooCommerce();
        }
    }

    function initializeNativeWooCommerce() {
        // Let WooCommerce initialize everything naturally
        if (typeof jQuery !== 'undefined') {
            const $ = jQuery;
            
            // Trigger standard WooCommerce events
            $(document.body).trigger('wc_fragment_refresh');
            $(document.body).trigger('wc_fragments_loaded');
            $(document.body).trigger('woocommerce_update_order_review');
            
            // Initialize variation forms if present
            $('.variations_form').each(function() {
                $(this).wc_variation_form();
            });
            
            // Re-initialize add to cart functionality
            $('.add_to_cart_button').off('click.wc-add-to-cart');
            
            console.log('Native WooCommerce functionality initialized');
        }
        
        // Custom event for theme compatibility
        document.dispatchEvent(new CustomEvent('semantix_native_products_loaded', { 
            bubbles: true,
            detail: { searchTerm: searchTerm }
        }));
        
        // Let any theme scripts re-initialize
        setTimeout(() => {
            if (window.wc_add_to_cart_params && jQuery) {
                jQuery(document.body).trigger('init_add_to_cart_button');
            }
        }, 100);
    }

    // Main execution - preserve native WooCommerce experience
    async function executeSearch() {
        try {
            const semantixProducts = await fetchSemantixProducts();
            
            if (semantixProducts.length === 0) {
                showMessage('');
                return;
            }

            await fetchRenderedWooCommerceProducts(semantixProducts);
            console.log(`Native search completed for: ${searchTerm}`);

        } catch (error) {
            console.error('Search execution error:', error);
            showMessage('');
        }
    }

})();
</script>

<?php get_footer(); ?>