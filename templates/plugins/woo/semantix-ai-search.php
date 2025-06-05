<?php
/**
 * Plugin Name: Semantix AI Search 
 * Description: Automatically replaces WooCommerce and WordPress default search bars with Semantix AI search bar, keeping shortcode and widget features intact.
 * Version: 1.6.11
 * Author: Semantix
 * License: GPL2
 */

// Exit if accessed directly to prevent direct file access
if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

/**
 * Add global JavaScript settings for the Semantix search bar
 * This makes search placeholders and settings available globally
 */
add_action('wp_enqueue_scripts', function(){
    wp_enqueue_style(
        'semantix-override',
        plugin_dir_url(__FILE__) . 'assets/css/admin.css',
        [],                                    // no deps
        filemtime( plugin_dir_path(__FILE__) . 'assets/css/admin.css' )
    );
}, 999);  // priority 999 ensures it's last

function semantix_add_mobile_styles() {
    ?>
    <style>
    /* IMPROVED MOBILE AND OVERLAY STYLES */
    
    /* Improved overlay styles */
    .semantix-floating-container {
        display: none;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 999999;
        justify-content: center;
        align-items: flex-start;
        padding-top: 80px;
        backdrop-filter: blur(2px);
    }

    .semantix-floating-container.show {
        display: flex !important;
        animation: semantixFadeIn 0.3s ease-in-out;
    }

    /* Prevent body scroll when overlay is open */
    body.semantix-no-scroll {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
    }

    /* Container-based responsive icon display */
    .semantix-toggle-search-icon {
        width: 30px !important;
        height: 30px !important;
        opacity: 0.8;
        transition: opacity 0.2s ease-in-out, transform 0.2s ease;
        cursor: pointer;
        z-index: 1002;
        display: none; /* Will be shown by JavaScript when needed */
    }

    .semantix-toggle-search-icon:hover {
        opacity: 1;
        transform: scale(1.05);
    }

    /* Ensure search bar in overlay is properly sized */
    .semantix-floating-container .semantix-search-bar {
        width: 90% !important;
        max-width: 400px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
    }

    /* Better animation */
    @keyframes semantixFadeIn {
        from { 
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Responsive improvements */
    @media (max-width: 480px) {
        .semantix-toggle-search-icon {
            width: 35px !important;
            height: 35px !important;
            padding: 5px;
        }
        
        .semantix-floating-container .semantix-search-bar {
            width: 95% !important;
            margin: 0 auto;
        }
        
        .semantix-floating-container {
            padding-top: 60px;
        }
    }
    
    /* Ensure icon mode works on desktop when selected */
    .semantix-search-bar-container[data-display-mode="icon"] .semantix-toggle-search-icon {
        display: block !important;
    }
    
    .semantix-search-bar-container[data-display-mode="icon"] > .semantix-search-bar:not(.semantix-floating-container .semantix-search-bar) {
        display: none !important;
    }
    </style>
    <?php
}
add_action('wp_head', 'semantix_add_mobile_styles', 5); // Priority 5 to load before other styles

function semantix_add_admin_settings_js() {
    // Get placeholders from options, defaulting to a sample text if not set
    $placeholders = get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל');
    
    // Convert newlines to commas for proper formatting
    if (strpos($placeholders, "\n") !== false) {
        $placeholder_lines = explode("\n", $placeholders);
        $placeholder_lines = array_map('trim', $placeholder_lines);
        $placeholders = implode(', ', $placeholder_lines);
    }
    
    // Convert to array and get placeholder rotation speed setting
    $placeholder_array = array_filter(array_map('trim', explode(',', $placeholders)));
    $placeholder_speed = get_option('semantix_placeholder_speed', 3000);
    
    // Create JSON version for JavaScript
    $placeholders_json = wp_json_encode(array_values($placeholder_array));
    
    ?>
    <script>
    // Global settings for Semantix AI Search
    window.semantixPlaceholders = <?php echo $placeholders_json; ?>;
    window.semantixPlaceholderSpeed = <?php echo intval($placeholder_speed); ?>;
    
    // Override the placeholder function with one that uses our settings
    document.addEventListener('DOMContentLoaded', function() {
        // Add data attributes to all search bars to ensure settings are available
        document.querySelectorAll('.semantix-search-bar').forEach(function(searchBar) {
            if (!searchBar.dataset.placeholders) {
                searchBar.dataset.placeholders = JSON.stringify(window.semantixPlaceholders);
            }
            if (!searchBar.dataset.rotationSpeed) {
                searchBar.dataset.rotationSpeed = window.semantixPlaceholderSpeed;
            }
        });
    });
    </script>
    <?php
}
// Hook into wp_head to add our JavaScript settings early
add_action('wp_head', 'semantix_add_admin_settings_js', 5);

/**
 * Filter for customizing search bar output based on admin settings
 * This allows global style settings to override individual shortcode attributes
 */
add_filter('semantix_search_bar_output', function($output, $atts) {
    // Get admin settings
    $primary_color = get_option('semantix_primary_color', '#0073aa');
    $border_radius = get_option('semantix_border_radius', '50px');
    $secondary_color = get_option('semantix_secondary_color', '#005177');
    $padding = get_option('semantix_padding', '10px 20px'); 
    $width = get_option('semantix_width', '350px');
    $height = get_option('semantix_height', '50px');
    $display_mode = get_option('semantix_display_mode', 'full');
    
    // Replace the values in the output - be very specific with patterns to avoid unintended replacements
    $output = str_replace('border: 2px solid ' . esc_attr($atts['primary_color']), 'border: 2px solid ' . esc_attr($primary_color), $output);
    $output = str_replace('border-radius: ' . esc_attr($atts['border_radius']), 'border-radius: ' . esc_attr($border_radius), $output);
    $output = str_replace('padding: ' . esc_attr($atts['padding']), 'padding: ' . esc_attr($padding), $output);
    $output = str_replace('width: ' . esc_attr($atts['width']), 'width: ' . esc_attr($width), $output);
    $output = str_replace('height: ' . esc_attr($atts['height']), 'height: ' . esc_attr($height), $output);
    
    // Add debugging comment
    $output .= "<!-- Semantix settings applied: primary_color: $primary_color, border_radius: $border_radius -->";
    
    return $output;
}, 10, 2);

/**
 * Automatically replace all search forms with Semantix AI search
 * This is added to the footer to ensure all search forms are processed
 */
add_action('wp_footer', 'semantix_auto_replace_search_forms');

/**
 * Function to replace standard search forms with Semantix search
 * Uses JavaScript to find and replace forms in the DOM
 */
function semantix_auto_replace_search_forms() {
    // Get our search bar HTML from the shortcode and convert to JSON for JavaScript
    $search_bar_html = json_encode(do_shortcode('[semantix_search_bar]')); // This makes it a JS string literal

    // Get custom selectors from settings
    $custom_selectors_string = get_option('semantix_custom_selectors', '');
    $custom_selectors_js_array_items = ''; // Will hold the items for the JS array

    if (!empty($custom_selectors_string)) {
        // 1. Normalize newlines (CRLF, LF, CR) to a single comma
        $normalized_selectors_string = preg_replace('/[\r\n]+/', ',', $custom_selectors_string);

        // 2. Explode by commas
        $selectors_array = explode(",", $normalized_selectors_string);

        // 3. Trim whitespace from each selector and filter out any empty ones
        $filtered_selectors = array_filter(array_map('trim', $selectors_array));

        if (!empty($filtered_selectors)) {
            // 4. Prepare for JavaScript injection (ensure proper escaping and quoting for each item)
            $escaped_js_selectors = array_map('esc_js', $filtered_selectors);
            // Create a string like: 'selector1', 'selector2', 'selector3'
            $custom_selectors_js_array_items = "'" . implode("', '", $escaped_js_selectors) . "'";
        }
    }
    ?>
<script>
// Make sure all functions are in the global scope
// Function to handle search input and show/hide suggestions
window.semantix_handleSearchInput = function(event) {
    const query = event.target.value.trim();
    if (query.length > 1) {
        const searchBar = event.target.closest('.semantix-search-bar');
        const suggestionsDropdown = searchBar.querySelector('.semantix-suggestions-list');
        if (suggestionsDropdown) {
            window.semantix_debouncedFetchSuggestions(query, suggestionsDropdown);
            suggestionsDropdown.style.display = "block";
        }
    } else {
        const searchBar = event.target.closest('.semantix-search-bar');
        const suggestionsDropdown = searchBar.querySelector('.semantix-suggestions-list');
        if (suggestionsDropdown) {
            suggestionsDropdown.style.display = "none";
        }
    }
};

// Function to execute search - redirects to WordPress search results page
window.semantix_performSearch = function(buttonElement, searchQuery = null) {
    const searchBar = buttonElement.closest('.semantix-search-bar');
    const searchInput = searchBar.querySelector('.semantix-search-input');
    const query = searchQuery || searchInput.value.trim();
    if (!query) {
        alert("אנא הכנס שאילתת חיפוש.");
        return;
    }
    
    console.log("Performing search for: " + query);
    
    // Redirect to the search results page
    window.location.href = "/?s=" + encodeURIComponent(query);
};

// Function to handle rotating placeholders in the search bar
window.semantix_changePlaceholder = function(searchBar) {
    const dynamicPlaceholder = searchBar.querySelector('.semantix-dynamic-placeholder');
    const searchInput = searchBar.querySelector('.semantix-search-input');
    if (!dynamicPlaceholder || !searchInput) return;

    let currentIndex = 0;
    let intervalId = null;
    
    // Get placeholders from data attribute if available, otherwise use defaults
    let dynamicTexts;
    try {
        // Check if the search bar has data-placeholders attribute
        if (searchBar.dataset.placeholders) {
            dynamicTexts = JSON.parse(searchBar.dataset.placeholders);
        } else {
            // Fall back to admin settings via global variable if available
            dynamicTexts = window.semantixPlaceholders || ['יין אדום צרפתי', 'פירותי וקליל', 'יין לבן מרענן'];
        }
    } catch (e) {
        console.error('Error parsing placeholders:', e);
        dynamicTexts = ['יין אדום צרפתי', 'פירותי וקליל', 'יין לבן מרענן'];
    }

    // Get rotation speed from data attribute if available
    const rotationSpeed = searchBar.dataset.rotationSpeed || 3000;

    // Set initial placeholder text
    if (dynamicTexts.length > 0) {
        dynamicPlaceholder.textContent = dynamicTexts[0];
    }

    // Function to change placeholder with animation
    function changePlaceholder() {
        dynamicPlaceholder.classList.add("semantix-fade-out");
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % dynamicTexts.length;
            dynamicPlaceholder.textContent = dynamicTexts[currentIndex];
            dynamicPlaceholder.classList.remove("semantix-fade-out");
            dynamicPlaceholder.classList.add("semantix-fade-in");
            setTimeout(() => dynamicPlaceholder.classList.remove("semantix-fade-in"), 500);
        }, 500);
    }

    // Start the interval with the proper speed
    intervalId = setInterval(changePlaceholder, parseInt(rotationSpeed));

    // CRITICAL FIX: Immediately check if there's already text in the input
    if (searchInput.value.trim().length > 0) {
        dynamicPlaceholder.style.display = 'none';
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Disable placeholder on focus if there's text
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            dynamicPlaceholder.style.display = 'none';
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    });

    // CRITICAL FIX: Ensure the input event works properly
    searchInput.addEventListener('input', function() {
        console.log("Input detected, value length:", this.value.trim().length);
        if (this.value.trim().length > 0) {
            console.log("Hiding placeholder");
            dynamicPlaceholder.style.display = 'none';
            // Stop the interval when typing
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        } else {
            console.log("Showing placeholder");
            dynamicPlaceholder.style.display = 'block';
            // Restart the interval if input is empty
            if (!intervalId) {
                intervalId = setInterval(changePlaceholder, 3000);
            }
        }
    });

    // CRITICAL FIX: Add keydown listener for Enter key directly to the search input
    searchInput.addEventListener('keydown', function(e) {
        console.log("Key pressed:", e.key);
        if (e.key === 'Enter') {
            console.log("Enter key detected");
            e.preventDefault();
            const searchButton = searchBar.querySelector('.semantix-search-button');
            window.semantix_performSearch(searchButton);
        }
    });

    // Store interval ID in a data attribute for cleanup
    searchBar.dataset.placeholderIntervalId = intervalId;
};

// Global debounce function to limit API calls during typing
window.semantix_debounce = function(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
};

// Function to fetch search suggestions from API
const DB_NAME     = "{{DB_NAME}}";
const API_KEY     = "{{API_KEY}}";
const SEARCH_HOST = "https://dashboard-server-ae00.onrender.com";

/* Suggestions fetch – replaces old hard-coded Shopify URL */
async function semantix_fetchSuggestions(query, ulEl){
  const url = `${SEARCH_HOST}/autocomplete` +
              `?dbName=${DB_NAME}&collectionName1=products` +
              `&collectionName2=queries&query=${encodeURIComponent(query)}`;

  try{
    const res = await fetch(url,{headers:{'x-api-key':API_KEY}});
    if(!res.ok) throw new Error('API error');
    const data = await res.json();
    semantix_displaySuggestions(data, ulEl);
  }catch(err){ console.error('[Semantix] suggestions',err); }
}

/* Debounce helper */
function semantix_debounce(fn,ms){
  let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); };
}
const semantix_debouncedFetchSuggestions = semantix_debounce(semantix_fetchSuggestions,200);

// Function to display fetched suggestions in the dropdown
window.semantix_displaySuggestions = function(suggestions, suggestionsDropdown) {
    if (!suggestionsDropdown) {
        console.error("Suggestions dropdown is null.");
        return;
    }
    
    // Clear previous suggestions
    suggestionsDropdown.innerHTML = "";
    
    if (suggestions.length > 0) {
        // Make the dropdown visible
        suggestionsDropdown.style.display = "block";
        
        suggestions.forEach((suggestion) => {
            // Create a new list item for each suggestion
            const li = document.createElement("li");
            li.classList.add("semantix-suggestion-item");
            
            // Build the inner HTML
            li.innerHTML = `
                ${suggestion.image ? `<img src="${suggestion.image}" alt="${suggestion.suggestion}" class="semantix-suggestion-image">` : ""}
                <div class="semantix-suggestion-text">
                    <span class="suggestion-title">${suggestion.suggestion}</span>
                    ${
                        suggestion.source === "products" 
                            ? `<span class="semantix-suggestion-price">${suggestion.price} ₪</span>` 
                            : `<span class="semantix-text-quotation">גולשים חיפשו</span>`
                    }
                </div>
            `;
            
            // Attach a click event to perform the search with the selected suggestion
            li.onclick = () => {
                const searchBar = suggestionsDropdown.closest('.semantix-search-bar');
                const searchInput = searchBar.querySelector('.semantix-search-input');
                searchInput.value = suggestion.suggestion;
                const searchButton = searchBar.querySelector('.semantix-search-button');
                window.semantix_performSearch(searchButton, suggestion.suggestion);
            };
            
            suggestionsDropdown.appendChild(li);
        });
    } else {
        // Hide the dropdown if there are no suggestions
        suggestionsDropdown.style.display = "none";
    }
};

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded - Initializing Semantix search bars (auto-replace logic)");

    // semantixSearchBarHTML is already a JavaScript string literal containing the HTML
    const semantixSearchBarHTML = <?php echo $search_bar_html; ?>;

    const defaultSelectors = [
        '.mobile-search-wrapper',
        'form[role="search"]'
    ];

    // Initialize custom selectors array
    let customSelectorsFromPHP = [];
    <?php if (!empty($custom_selectors_js_array_items)): ?>
    customSelectorsFromPHP = [<?php echo $custom_selectors_js_array_items; ?>];
    <?php endif; ?>

    // Combine default and custom selectors
    const selectorsToReplace = [
        ...defaultSelectors,
        ...customSelectorsFromPHP
    ];

    console.log('Semantix - Selectors targeted for replacement:', selectorsToReplace); // For debugging

    // Replace all matched forms with our Semantix search bar
    selectorsToReplace.forEach(selector => {
        if (selector && typeof selector === 'string' && selector.trim() !== '') { // Ensure selector is valid
            try {
                document.querySelectorAll(selector).forEach(originalForm => {
                    // Skip if already inside a Semantix container to avoid infinite loops
                    if (originalForm.closest('.semantix-search-bar-container')) {
                        console.log('Semantix - Skipping already replaced form or child of Semantix container for selector:', selector, originalForm);
                        return;
                    }

                    console.log('Semantix - Replacing form matching selector:', selector, originalForm); // For debugging

                    // Create container with our search bar
                    const container = document.createElement('div');
                    // The semantixSearchBarHTML is a JS string containing HTML, so this is correct
                    container.innerHTML = semantixSearchBarHTML;

                    // Check if parentNode exists before trying to replace
                    if (originalForm.parentNode) {
                        originalForm.parentNode.replaceChild(container, originalForm);

                        // Initialize placeholders rotation after replacement
                        // Ensure the new search bar elements are targeted
                        container.querySelectorAll('.semantix-search-bar').forEach(function(searchBar) {
                            if (typeof window.semantix_changePlaceholder === 'function') {
                                window.semantix_changePlaceholder(searchBar);
                            } else {
                                console.warn('Semantix - window.semantix_changePlaceholder function not found.');
                            }
                        });
                    } else {
                         console.warn('Semantix - originalForm for selector "' + selector + '" has no parentNode. Cannot replace:', originalForm);
                    }
                });
            } catch (e) {
                console.error('Semantix - Invalid selector or error during replacement for selector "' + selector + '":', e); // For debugging
            }
        }
    });

    // Process all search bars regardless of how they were added (this part seems fine)
    // ... [Your existing logic for .semantix-search-bar initialization] ...
    document.querySelectorAll('.semantix-search-bar').forEach(function(searchBar) {
        const searchInput = searchBar.querySelector('.semantix-search-input');

        if (!searchBar.classList.contains('semantix-initialized')) {
            if (searchInput) {
                searchBar.classList.add('semantix-initialized');
                if (typeof window.semantix_changePlaceholder === 'function') {
                    window.semantix_changePlaceholder(searchBar);
                }
            }
        }
    });

    // Close suggestions when clicking outside (this part seems fine)
    // ... [Your existing logic for closing suggestions] ...
     document.addEventListener('click', function(event) {
        document.querySelectorAll('.semantix-suggestions-list').forEach(function(suggestionsDropdown) {
            if (suggestionsDropdown.style.display === "block" &&
                !suggestionsDropdown.closest('.semantix-search-bar').contains(event.target)) {
                suggestionsDropdown.style.display = "none";
            }
        });
    });
});
</script>

<!-- IMPROVED MOBILE AND CONTAINER-WIDTH BASED LOGIC -->
<script>
(function() {
    'use strict';
    
    // Global variables to store event handlers
    window.semantixOverlayHandler = null;
    window.semantixKeyHandler = null;
    
    // 1. CONTAINER-WIDTH BASED DISPLAY LOGIC
    function semantix_responsive_display_mode() {
        console.log('Checking container widths for search bar display...');
        
        document.querySelectorAll('.semantix-search-bar-container').forEach(function(container) {
            const isResponsive = container.dataset.responsive !== 'false';
            
            if (!isResponsive) {
                return;
            }
            
            const fullSearchBar = container.querySelector('.semantix-search-bar:not(.semantix-floating-container .semantix-search-bar)');
            const toggleIcon = container.querySelector('.semantix-toggle-search-icon');
            const floatingContainer = container.querySelector('.semantix-floating-container');
            
            if (fullSearchBar && toggleIcon && floatingContainer) {
                // Get search bar width
                const searchBarWidth = Math.max(parseInt(getComputedStyle(fullSearchBar).width) || 350, 350);
                
                // Get container width
                const containerRect = container.getBoundingClientRect();
                const containerStyle = getComputedStyle(container);
                const paddingLeft = parseInt(containerStyle.paddingLeft) || 0;
                const paddingRight = parseInt(containerStyle.paddingRight) || 0;
                const availableWidth = containerRect.width;
                
                // Add buffer for comfortable display
                const hasEnoughSpace = availableWidth + 60 >= (searchBarWidth);
                
                console.log('Container analysis:', {
                    containerWidth: containerRect.width,
                    availableWidth: availableWidth,
                    searchBarWidth: searchBarWidth,
                    hasEnoughSpace: hasEnoughSpace
                });
                
                if (hasEnoughSpace) {
                    // Use configured display mode
                    const configuredMode = container.getAttribute('data-display-mode') || 'full';
                    
                    if (configuredMode === 'full') {
                        fullSearchBar.style.display = 'flex';
                        toggleIcon.style.display = 'none';
                    } else {
                        fullSearchBar.style.display = 'none';
                        toggleIcon.style.display = 'block';
                    }
                } else {
                    // Force icon mode
                    fullSearchBar.style.display = 'none';
                    toggleIcon.style.display = 'block';
                    toggleIcon.style.opacity = '1';
                }
            }
        });
    }
    
    // 2. IMPROVED OVERLAY CLOSING
    function setupOverlayClosing() {
        // Clean up existing listeners
        if (window.semantixOverlayHandler) {
            document.removeEventListener('click', window.semantixOverlayHandler, true);
            document.removeEventListener('touchend', window.semantixOverlayHandler, true);
        }
        if (window.semantixKeyHandler) {
            document.removeEventListener('keydown', window.semantixKeyHandler);
        }
        
        // Create overlay click handler
        window.semantixOverlayHandler = function(event) {
            const openContainers = document.querySelectorAll('.semantix-floating-container.show');
            
            if (openContainers.length === 0) return;
            
            openContainers.forEach(function(floatingContainer) {
                const searchBar = floatingContainer.querySelector('.semantix-search-bar');
                const parentContainer = floatingContainer.closest('.semantix-search-bar-container');
                const toggleIcon = parentContainer ? parentContainer.querySelector('.semantix-toggle-search-icon') : null;
                
                // Check what was clicked
                const clickedOnSearchBar = searchBar && searchBar.contains(event.target);
                const clickedOnToggleIcon = toggleIcon && toggleIcon.contains(event.target);
                
                console.log('Overlay click detected:', {
                    clickedOnSearchBar,
                    clickedOnToggleIcon,
                    target: event.target.tagName + (event.target.className ? '.' + event.target.className : '')
                });
                
                // Close if clicked outside search bar (but not on toggle icon)
                if (!clickedOnSearchBar && !clickedOnToggleIcon) {
                    event.preventDefault();
                    event.stopPropagation();
                    closeOverlay(floatingContainer);
                }
            });
        };
        
        // Create keyboard handler
        window.semantixKeyHandler = function(event) {
            if (event.key === 'Escape') {
                const openContainers = document.querySelectorAll('.semantix-floating-container.show');
                openContainers.forEach(closeOverlay);
            }
        };
        
        // Add event listeners with capture
        document.addEventListener('click', window.semantixOverlayHandler, true);
        document.addEventListener('touchend', window.semantixOverlayHandler, true);
        document.addEventListener('keydown', window.semantixKeyHandler);
        
        console.log('Overlay closing handlers set up');
    }
    
    // 3. CLOSE OVERLAY FUNCTION
    function closeOverlay(container) {
        console.log('Closing overlay...');
        container.classList.remove('show');
        document.body.style.overflow = '';
        document.body.classList.remove('semantix-no-scroll');
        
        // Clear focus
        const searchInput = container.querySelector('.semantix-search-input');
        if (searchInput) {
            searchInput.blur();
        }
    }
    
    // 4. UPDATED TOGGLE FUNCTION
    window.semantix_toggleSearchBar = function(iconElement) {
        console.log('Toggle search bar clicked');
        
        const container = iconElement.closest('.semantix-search-bar-container');
        const floatingContainer = container.querySelector('.semantix-floating-container');
        const searchInput = floatingContainer.querySelector('.semantix-search-input');
        
        if (floatingContainer.classList.contains('show')) {
            closeOverlay(floatingContainer);
        } else {
            console.log('Opening search overlay...');
            floatingContainer.classList.add('show');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('semantix-no-scroll');
            
            // Focus on search input
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                }
            }, 150);
        }
    };
    
    // 5. INITIALIZATION
    function initMobileFixes() {
        console.log('Initializing Semantix mobile fixes...');
        
        // Initial setup
        semantix_responsive_display_mode();
        setupOverlayClosing();
        
        // Debounced resize handler
        let resizeTimer;
        function handleResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('Window resized, rechecking container widths...');
                semantix_responsive_display_mode();
            }, 250);
        }
        
        window.addEventListener('resize', handleResize);
        
        // Advanced: ResizeObserver for container changes
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(function(entries) {
                let needsUpdate = false;
                entries.forEach(function(entry) {
                    if (entry.target.classList.contains('semantix-search-bar-container')) {
                        needsUpdate = true;
                    }
                });
                
                if (needsUpdate) {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        console.log('Container size changed, rechecking...');
                        semantix_responsive_display_mode();
                    }, 100);
                }
            });
            
            // Observe all search containers
            document.querySelectorAll('.semantix-search-bar-container').forEach(function(container) {
                resizeObserver.observe(container);
            });
            
            console.log('ResizeObserver set up for container monitoring');
        }
        
        // Re-check after DOM mutations (for dynamic content)
        if (window.MutationObserver) {
            const mutationObserver = new MutationObserver(function(mutations) {
                let hasNewContainers = false;
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && (
                            node.classList.contains('semantix-search-bar-container') ||
                            node.querySelector('.semantix-search-bar-container')
                        )) {
                            hasNewContainers = true;
                        }
                    });
                });
                
                if (hasNewContainers) {
                    setTimeout(semantix_responsive_display_mode, 50);
                }
            });
            
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        console.log('Semantix mobile fixes initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFixes);
    } else {
        initMobileFixes();
    }
    
})();
</script>

<script>
// Rotating placeholder texts passed from PHP
const dynamicTexts = <?php echo wp_json_encode(array_values(array_filter(array_map('trim', explode(',', get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל')))))); ?>;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Shortcode DOMContentLoaded - initializing");
    
    // Process all search bars in this shortcode
    const container = document.currentScript ? document.currentScript.closest('.semantix-search-bar-container') : null;
    if (container) {
        const searchBars = container.querySelectorAll('.semantix-search-bar');
        
        searchBars.forEach(function(searchBar) {
            if (!searchBar.classList.contains('semantix-initialized')) {
                // Mark as initialized to prevent duplication
                searchBar.classList.add('semantix-initialized');
                
                // Initialize placeholder only if the global function exists
                if (typeof window.semantix_changePlaceholder === 'function') {
                    window.semantix_changePlaceholder(searchBar);
                }
            }
        });
    }
});
</script>

    <?php
}

/**
 * Replace WooCommerce theme search bar with Semantix AI Search Bar.
 * This hooks into the theme's action hooks to replace the standard search.
 */
add_action('after_setup_theme', 'semantix_replace_theme_search_bar');

function semantix_replace_theme_search_bar() {
    // Example for Storefront Theme - adjust action hooks based on your theme
    remove_action('storefront_header', 'storefront_product_search', 40);

    // Insert Semantix AI search bar
    add_action('storefront_header', 'semantix_render_ai_search_bar', 40);
}

/**
 * Render Semantix AI Search Bar using shortcode.
 * This is the function that gets called by the action hooks.
 */
function semantix_render_ai_search_bar() {
    echo do_shortcode('[semantix_search_bar]');
}

/**
 * Remove WooCommerce Product Search Widget globally.
 * This prevents the default search widget from being available.
 */
add_action('widgets_init', 'semantix_remove_default_wc_search_widgets', 15);

function semantix_remove_default_wc_search_widgets() {
    unregister_widget('WC_Widget_Product_Search');
}

/**
 * Globally replace the default WordPress search form with Semantix AI search.
 * This filter overrides WordPress get_search_form() function output.
 */
add_filter('get_search_form', 'semantix_replace_wp_search_form');

function semantix_replace_wp_search_form($form) {
    return do_shortcode('[semantix_search_bar]');
}

/**
 * Main shortcode function for the Semantix search bar
 * This generates the HTML and styles for the search bar with all customization options
 */
function semantix_search_bar_shortcode( $atts ) {
    // Define default attributes
    $atts = shortcode_atts( array(
        'size'            => 'medium', // Options: small, medium, large
        'primary_color'   => '#0073aa',
        'secondary_color' => '#005177',
        'border_radius'   => '50px',
        'padding'         => '10px 20px',
        'width'           => '350px', // Changed from '100%' to '350px'
        'height'          => '50px',  // Height of the search bar
        'display_mode'    => 'full',  // Options: 'icon' or 'full'
        'placeholders'    => 'יין אדום צרפתי, פירותי וקליל', // Comma-separated placeholder sentences
    ), $atts, 'semantix_search_bar' );

    // Sanitize attributes for security
    $size            = sanitize_text_field( $atts['size'] );
    $primary_color   = sanitize_hex_color( $atts['primary_color'] ) ?: '#0073aa';
    $secondary_color = sanitize_hex_color( $atts['secondary_color'] ) ?: '#005177';
    $border_radius   = sanitize_text_field( $atts['border_radius'] );
    $padding         = sanitize_text_field( $atts['padding'] );
    $width           = sanitize_text_field( $atts['width'] );
    $height          = sanitize_text_field( $atts['height'] );
    $display_mode    = in_array( $atts['display_mode'], array( 'icon', 'full' ), true ) ? $atts['display_mode'] : 'full';
    $placeholders    = sanitize_text_field( $atts['placeholders'] );
    $placeholders    = array_filter( array_map( 'trim', explode( ',', $placeholders ) ) ); // Convert to array and remove empty values

    // Determine size class based on the size attribute
    $size_class = '';
    switch ( $size ) {
        case 'small':
            $size_class = 'semantix-search-small';
            break;
        case 'large':
            $size_class = 'semantix-search-large';
            break;
        case 'medium':
        default:
            $size_class = 'semantix-search-medium';
            break;
    }

    // Convert placeholders array to JSON for JavaScript
    $placeholders_json = wp_json_encode( array_values( $placeholders ) );

    // Start output buffering to capture all HTML
    ob_start();
    ?>
    <!-- BEGIN: Semantix AI Search Bar Shortcode -->
    <style>
      /* Ensure the search input border is none globally */
      .semantix-search-bar-container .semantix-search-input {
        border: none !important;
        box-shadow: none !important;
      }

      /* Search Bar Container */
      .semantix-search-bar-container {
        direction: rtl;
        width: auto;
        /* Removed max-width to allow full customization */
        padding: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        box-sizing: border-box;
      }

      /* Search Bar Core Styles */
      .semantix-search-bar {
        display: flex;
        align-items: center;
        border: 2px solid <?php echo esc_attr( $primary_color ); ?>;
        border-radius: <?php echo esc_attr( $border_radius ); ?>;
        padding: <?php echo esc_attr( $padding ); ?>;
        background-color: #ffffff;
        width: <?php echo esc_attr( $width ); ?>; /* Now defaults to 350px */
        /* Removed max-width to allow full customization */
        height: <?php echo esc_attr( $height ); ?>;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: all 0.3s ease-in-out;
        z-index: 1001;
        position: relative; /* Ensure relative positioning for suggestions */
      }

      /* Search Input */
      .semantix-search-input {
        flex-grow: 1;
        border: none !important;
        box-shadow: none !important;
        height: 30px !important;
        outline: none;
        font-size: 16px;
        padding: 8px 0;
        background-color: transparent !important;
      }

      /* Search Button */
      .semantix-search-button {
        background: white !important;
        border: none;
        padding: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .semantix-search-icon {
        width: 24px;
        height: 24px;
        opacity: 0.7;
        transition: opacity 0.2s ease-in-out;
      }
      .semantix-search-icon:hover {
        opacity: 1;
      }

      /* Suggestions List */
      .semantix-suggestions-list {
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        right: 0 !important;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 100%;
        max-height: 250px;
        overflow-y: auto;
        z-index: 1001;
        display: none;
        list-style: none;
        padding: 0;
        margin-top: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .semantix-suggestions-list.show {
        display: block;
      }
      .semantix-suggestion-item {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      .semantix-suggestion-item:hover {
        background-color: #f0f0f0;
      }
      .semantix-suggestion-image {
        width: 40px;
        height: auto;
        object-fit: cover;
        border-radius: 4px;
      }
      .semantix-suggestion-text {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
		 .semantix-suggestion-price {
      font-size: 12px;
      color: #100f0f;
      display: flex;
      margin-top: 2px;
    }

    .semantix-text-quotation {
      font-style: italic;
      font-size: 12px;
      color: #777;
      margin-right: 5px;
    }

      /* Dynamic Placeholder */
      .semantix-dynamic-placeholder {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1rem;
        color: #777;
        pointer-events: none;
        transition: opacity 0.5s ease-in-out;
      }
      .semantix-fade-in { opacity: 1; }
      .semantix-fade-out { opacity: 0; }

      /* Size Classes */
      .semantix-search-small .semantix-search-input {
        font-size: 14px;
      }
      .semantix-search-large .semantix-search-input {
        font-size: 18px;
      }

      /* Animation */
      @keyframes semantixFadeIn {
        from { 
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .semantix-search-bar.show {
        animation: fadeIn 0.3s ease-in-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Responsive Styles */
      @media (max-width: 768px) {
		 .semantix-dynamic-placeholder {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.65rem;
        color: #777;
        pointer-events: none;
        transition: opacity 0.5s ease-in-out;
      }
        .semantix-search-bar-container {
          padding: 10px;
        }
        .semantix-search-bar {
          padding: 8px 16px;
        }
        .semantix-search-input {
          font-size: 14px;
        }
        .semantix-search-icon {
          width: 20px !important;
          height: 20px;
        }
        .semantix-suggestion-text {
          font-size: 14px;
        }
		          .semantix-toggle-search-icon {
            width: 30px !important;
            height: 30px;
            display: block;
            margin: 0 auto;
        }
        
        .semantix-floating-container .semantix-search-bar {
            width: 90% !important; /* Make search bar wider on mobile when expanded */
            max-width: 350px;
        }
        
        /* Make the search icon more tappable on mobile */
        .semantix-search-button {
            padding: 8px;
        }
        
        .semantix-search-icon {
            width: 28px !important;
            height: 28px;
        }
      }
    </style>

<div class="semantix-search-bar-container <?php echo esc_attr($size_class); ?>" data-display-mode="<?php echo esc_attr($display_mode); ?>">
    <!-- Search Icon for Toggle - Always included but visibility controlled by CSS -->
    <img
        src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266" 
        alt="חיפוש"
        class="semantix-toggle-search-icon"
        onclick="semantix_toggleSearchBar(this)"
        aria-label="Toggle Search Bar"
        tabindex="0"
        style="display: <?php echo ('icon' === $display_mode) ? 'block' : 'none'; ?>;"
    />
    
    <!-- Floating Container for Icon Mode - Always included -->
    <div class="semantix-floating-container" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="semantix-search-bar" role="search" aria-label="Semantix AI Search Bar">
            <span class="semantix-dynamic-placeholder"></span>
            <input
                type="text"
                class="semantix-search-input"
                oninput="semantix_handleSearchInput(event)"
                aria-label="Search Products"
                placeholder=""
                value="<?php echo esc_attr(get_search_query()); ?>"
            />
            <button class="semantix-search-button" onclick="semantix_performSearch(this)" aria-label="Perform Search">
                <img
                    src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266" 
                    alt="חיפוש"
                    class="semantix-search-icon"
                />
            </button>
            <!-- Suggestions List Inside semantix-search-bar -->
            <ul class="semantix-suggestions-list" aria-label="Search Suggestions"></ul>
        </div>
    </div>
    
    <!-- Regular Search Bar for Full Mode - Always included but visibility controlled by CSS -->
    <div class="semantix-search-bar semantix-regular-search-bar" role="search" aria-label="Semantix AI Search Bar" style="display: <?php echo ('full' === $display_mode) ? 'flex' : 'none'; ?>;">
        <span class="semantix-dynamic-placeholder"></span>
        <input
            type="text"
            class="semantix-search-input"
            oninput="semantix_handleSearchInput(event)"
            aria-label="Search Products"
            placeholder=""
        />
        <button class="semantix-search-button" onclick="semantix_performSearch(this)" aria-label="Perform Search">
            <img
                src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266" 
                alt="חיפוש"
                class="semantix-search-icon"
            />
        </button>
        <!-- Suggestions List Inside semantix-search-bar -->
        <ul class="semantix-suggestions-list" aria-label="Search Suggestions"></ul>
    </div>
</div>
<script>
(function(){
    // Rotating placeholder texts passed from PHP
    const dynamicTexts = <?php echo $placeholders_json; ?>;

    // Function to perform search
    function semantix_performSearch(buttonElement, searchQuery = null) {
        const searchBar = buttonElement.closest('.semantix-search-bar');
        const searchInput = searchBar.querySelector('.semantix-search-input');
        const query = searchQuery || searchInput.value.trim();
        if (!query) {
            alert("אנא הכנס שאילתת חיפוש.");
            return;
        }
        console.log("Performing search for: " + query);
        // Redirect to the search results page
        window.location.href = "/?s=" + encodeURIComponent(query);
    }

    // Make the function globally accessible
    window.semantix_performSearch = semantix_performSearch;

    // Handle Enter key in search inputs - improved version
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.semantix-search-input').forEach(function(searchInput) {
            searchInput.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    const searchBar = this.closest('.semantix-search-bar');
                    const searchButton = searchBar.querySelector('.semantix-search-button');
                    semantix_performSearch(searchButton);
                }
            });
        });
    });

    // Placeholder rotation for each search bar instance
    function semantix_changePlaceholder(searchBar) {
        const dynamicPlaceholder = searchBar.querySelector('.semantix-dynamic-placeholder');
        const searchInput = searchBar.querySelector('.semantix-search-input');
        if (!dynamicPlaceholder || !searchInput) return;

        let currentIndex = 0;
        let intervalId = null;

        // Initialize the first placeholder
        if (dynamicTexts.length > 0) {
            dynamicPlaceholder.textContent = dynamicTexts[0];
        }

        // Function to change placeholder
        function changePlaceholder() {
            dynamicPlaceholder.classList.add("semantix-fade-out");
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % dynamicTexts.length;
                dynamicPlaceholder.textContent = dynamicTexts[currentIndex];
                dynamicPlaceholder.classList.remove("semantix-fade-out");
                dynamicPlaceholder.classList.add("semantix-fade-in");
                setTimeout(() => dynamicPlaceholder.classList.remove("semantix-fade-in"), 500);
            }, 500);
        }

        // Start the interval for this search bar
        intervalId = setInterval(changePlaceholder, 3000);

        // Add input and focus event listeners to hide placeholder
        searchInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                dynamicPlaceholder.style.display = 'none';
                // Stop the interval when typing
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } else {
                dynamicPlaceholder.style.display = 'block';
                // Restart the interval if input is empty
                if (!intervalId) {
                    intervalId = setInterval(changePlaceholder, 3000);
                }
            }
        });

        // Also check initial value
        if (searchInput.value.trim().length > 0) {
            dynamicPlaceholder.style.display = 'none';
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    }

    // Initialize placeholder rotation for each search bar
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.semantix-search-bar').forEach(function(searchBar) {
            semantix_changePlaceholder(searchBar);
        });
    });

    // Debounce helper
    function semantix_debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Fetch suggestions from API
    async function semantix_fetchSuggestions(query, listEl) {
        const API_KEY = "<?php echo esc_js(get_option('semantix_api_key', '')); ?>";
        const url = `https://dashboard-server-ae00.onrender.com/autocomplete?query=${encodeURIComponent(query)}`;

        const headers = API_KEY ? { "x-api-key": API_KEY } : {};

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const suggestions = await res.json();
            semantix_displaySuggestions(suggestions, listEl);
        } catch (err) {
            console.error("[Semantix] autocomplete error:", err);
        }
    }

    const semantix_debouncedFetchSuggestions = semantix_debounce(semantix_fetchSuggestions, 200);

    // Handle search input for suggestions
    window.semantix_handleSearchInput = function (event) {
        const query = event.target.value.trim();
        if (query.length > 1) {
            const searchBar = event.target.closest('.semantix-search-bar');
            const suggestionsDropdown = searchBar.querySelector('.semantix-suggestions-list');
            if (suggestionsDropdown) {
                semantix_debouncedFetchSuggestions(query, suggestionsDropdown);
                suggestionsDropdown.style.display = "block";
            }
        } else {
            const searchBar = event.target.closest('.semantix-search-bar');
            const suggestionsDropdown = searchBar.querySelector('.semantix-suggestions-list');
            if (suggestionsDropdown) {
                suggestionsDropdown.style.display = "none";
            }
        }
    };

    function semantix_displaySuggestions(suggestions, suggestionsDropdown) {
        if (!suggestionsDropdown) {
            console.error("Suggestions dropdown is null.");
            return;
        }
        
        // Clear previous suggestions
        suggestionsDropdown.innerHTML = "";
        
        if (suggestions.length > 0) {
            // Make the dropdown visible
            suggestionsDropdown.style.display = "block";
            
            suggestions.forEach((suggestion) => {
                // Create a new list item for each suggestion
                const li = document.createElement("li");
                li.classList.add("semantix-suggestion-item");
                
                // Build the inner HTML
                li.innerHTML = `
                    ${suggestion.image ? `<img src="${suggestion.image}" alt="${suggestion.suggestion}" class="semantix-suggestion-image">` : ""}
                    <div class="semantix-suggestion-text">
                        <span class="suggestion-title">${suggestion.suggestion}</span>
                        ${
                            suggestion.source === "products" 
                                ? `<span class="semantix-suggestion-price">${suggestion.price} ₪</span>` 
                                : `<span class="semantix-text-quotation">גולשים חיפשו</span>`
                        }
                    </div>
                `;
                
                // Attach a click event to perform the search with the selected suggestion
                li.onclick = () => {
                    const searchBar = suggestionsDropdown.closest('.semantix-search-bar');
                    const searchInput = searchBar.querySelector('.semantix-search-input');
                    searchInput.value = suggestion.suggestion;
                    const searchButton = searchBar.querySelector('.semantix-search-button');
                    semantix_performSearch(searchButton, suggestion.suggestion);
                };
                
                suggestionsDropdown.appendChild(li);
            });
        } else {
            // Hide the dropdown if there are no suggestions
            suggestionsDropdown.style.display = "none";
        }
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        document.querySelectorAll('.semantix-suggestions-list').forEach(function(suggestionsDropdown) {
            if (suggestionsDropdown.style.display === "block" && 
                !suggestionsDropdown.closest('.semantix-search-bar').contains(event.target)) {
                suggestionsDropdown.style.display = "none";
            }
        });
    });

})();
</script>
    <!-- END: Semantix AI Search Bar Shortcode -->
    <?php
    $output = ob_get_clean(); // Capture the output
    return apply_filters('semantix_search_bar_output', $output, $atts); // Apply filter and return
}
add_shortcode( 'semantix_search_bar', 'semantix_search_bar_shortcode' );

// REST OF THE PLUGIN REMAINS THE SAME...

/**
 * Create a widget to render the custom search bar with customizable design.
 */
class Semantix_Custom_Search_Widget extends WP_Widget {

    public function __construct() {
        parent::__construct(
            'semantix_custom_search_widget',
            __( 'Semantix AI Search Bar', 'semantix-ai-search' ),
            array( 'description' => __( 'A customizable search bar with autocomplete and dynamic placeholders.', 'semantix-ai-search' ) )
        );
    }

    public function widget( $args, $instance ) {
        echo $args['before_widget'];
        // Optionally display a title
        if ( ! empty( $instance['title'] ) ) {
            echo $args['before_title'] . apply_filters( 'widget_title', $instance['title'] ) . $args['after_title'];
        }

        // Build shortcode attributes from widget settings
        $shortcode_atts = array();

        if ( ! empty( $instance['size'] ) ) {
            $shortcode_atts['size'] = sanitize_text_field( $instance['size'] );
        }
        if ( ! empty( $instance['primary_color'] ) ) {
            $shortcode_atts['primary_color'] = sanitize_hex_color( $instance['primary_color'] ) ?: '#0073aa';
        }
        if ( ! empty( $instance['secondary_color'] ) ) {
            $shortcode_atts['secondary_color'] = sanitize_hex_color( $instance['secondary_color'] ) ?: '#005177';
        }
        if ( ! empty( $instance['border_radius'] ) ) {
            $shortcode_atts['border_radius'] = sanitize_text_field( $instance['border_radius'] );
        }
        if ( ! empty( $instance['padding'] ) ) {
            $shortcode_atts['padding'] = sanitize_text_field( $instance['padding'] );
        }
        if ( ! empty( $instance['width'] ) ) {
            $shortcode_atts['width'] = sanitize_text_field( $instance['width'] );
        } else {
            $shortcode_atts['width'] = '350px'; // Default to 350px if not set
        }
        if ( ! empty( $instance['height'] ) ) { 
            $shortcode_atts['height'] = sanitize_text_field( $instance['height'] );
        }
        if ( ! empty( $instance['display_mode'] ) && in_array( $instance['display_mode'], array( 'icon', 'full' ), true ) ) {
            $shortcode_atts['display_mode'] = sanitize_text_field( $instance['display_mode'] );
        }
        if ( ! empty( $instance['placeholders'] ) ) {
            // Ensure placeholders are comma-separated
            $placeholders = implode( ',', array_map( 'trim', explode( "\n", $instance['placeholders'] ) ) );
            $shortcode_atts['placeholders'] = sanitize_text_field( $placeholders );
        }

        // Build the shortcode string with attributes
        $shortcode = '[semantix_search_bar';
        foreach ( $shortcode_atts as $key => $value ) {
            $shortcode .= ' ' . esc_attr( $key ) . '="' . esc_attr( $value ) . '"';
        }
        $shortcode .= ']';

        // Output the search bar using the shortcode
        echo do_shortcode( $shortcode );

        echo $args['after_widget'];
    }

    public function form( $instance ) {
        // Widget title
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Search', 'semantix-ai-search' );

        // Search bar size
        $size = ! empty( $instance['size'] ) ? $instance['size'] : 'medium';

        // Primary color
        $primary_color = ! empty( $instance['primary_color'] ) ? $instance['primary_color'] : '#0073aa';

        // Secondary color
        $secondary_color = ! empty( $instance['secondary_color'] ) ? $instance['secondary_color'] : '#005177';

        // Border radius
        $border_radius = ! empty( $instance['border_radius'] ) ? $instance['border_radius'] : '50px';

        // Padding
        $padding = ! empty( $instance['padding'] ) ? $instance['padding'] : '10px 20px';

        // Width
        $width = ! empty( $instance['width'] ) ? $instance['width'] : '350px'; // Changed from '100%' to '350px'

        // Height
        $height = ! empty( $instance['height'] ) ? $instance['height'] : '50px';

        // Display mode
        $display_mode = ! empty( $instance['display_mode'] ) ? $instance['display_mode'] : 'full';

        // Placeholders
        $placeholders = ! empty( $instance['placeholders'] ) ? $instance['placeholders'] : "יין אדום צרפתי, פירותי וקליל";

        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>">
                <?php _e( 'Title:', 'semantix-ai-search' ); ?>
            </label> 
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" 
                   type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'size' ) ); ?>">
                <?php _e( 'Size:', 'semantix-ai-search' ); ?>
            </label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'size' ) ); ?>" 
                    name="<?php echo esc_attr( $this->get_field_name( 'size' ) ); ?>">
                <option value="small" <?php selected( $size, 'small' ); ?>><?php _e( 'Small', 'semantix-ai-search' ); ?></option>
                <option value="medium" <?php selected( $size, 'medium' ); ?>><?php _e( 'Medium', 'semantix-ai-search' ); ?></option>
                <option value="large" <?php selected( $size, 'large' ); ?>><?php _e( 'Large', 'semantix-ai-search' ); ?></option>
            </select>
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'primary_color' ) ); ?>">
                <?php _e( 'Primary Color:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'primary_color' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'primary_color' ) ); ?>" 
                   type="color" value="<?php echo esc_attr( $primary_color ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'secondary_color' ) ); ?>">
                <?php _e( 'Secondary Color:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'secondary_color' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'secondary_color' ) ); ?>" 
                   type="color" value="<?php echo esc_attr( $secondary_color ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'border_radius' ) ); ?>">
                <?php _e( 'Border Radius:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'border_radius' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'border_radius' ) ); ?>" 
                   type="text" value="<?php echo esc_attr( $border_radius ); ?>" 
                   placeholder="e.g., 50px, 10px">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'padding' ) ); ?>">
                <?php _e( 'Padding:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'padding' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'padding' ) ); ?>" 
                   type="text" value="<?php echo esc_attr( $padding ); ?>" 
                   placeholder="e.g., 10px 20px">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>">
                <?php _e( 'Width:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'width' ) ); ?>" 
                   type="text" value="<?php echo esc_attr( $width ); ?>" 
                   placeholder="e.g., 350px, 500px">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>">
                <?php _e( 'Height:', 'semantix-ai-search' ); ?>
            </label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>" 
                   name="<?php echo esc_attr( $this->get_field_name( 'height' ) ); ?>" 
                   type="text" value="<?php echo esc_attr( $height ); ?>" 
                   placeholder="e.g., 50px, 40px">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'display_mode' ) ); ?>">
                <?php _e( 'Display Mode:', 'semantix-ai-search' ); ?>
            </label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'display_mode' ) ); ?>" 
                    name="<?php echo esc_attr( $this->get_field_name( 'display_mode' ) ); ?>">
                <option value="icon" <?php selected( $display_mode, 'icon' ); ?>><?php _e( 'Icon Only', 'semantix-ai-search' ); ?></option>
                <option value="full" <?php selected( $display_mode, 'full' ); ?>><?php _e( 'Full Search Bar', 'semantix-ai-search' ); ?></option>
            </select>
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'placeholders' ) ); ?>">
                <?php _e( 'Dynamic Placeholders (one per line):', 'semantix-ai-search' ); ?>
            </label>
            <textarea class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'placeholders' ) ); ?>" 
                      name="<?php echo esc_attr( $this->get_field_name( 'placeholders' ) ); ?>" 
                      rows="3" 
                      placeholder="e.g., יין אדום צרפתי
פירותי וקליל
יין לבן מרענן"><?php echo esc_textarea( $placeholders ); ?></textarea>
        </p>
        <?php 
    }

    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title']           = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
        $instance['size']            = ( ! empty( $new_instance['size'] ) ) ? sanitize_text_field( $new_instance['size'] ) : 'medium';
        $instance['primary_color']   = ( ! empty( $new_instance['primary_color'] ) ) ? sanitize_hex_color( $new_instance['primary_color'] ) : '#0073aa';
        $instance['secondary_color'] = ( ! empty( $new_instance['secondary_color'] ) ) ? sanitize_hex_color( $new_instance['secondary_color'] ) : '#005177';
        $instance['border_radius']   = ( ! empty( $new_instance['border_radius'] ) ) ? sanitize_text_field( $new_instance['border_radius'] ) : '50px';
        $instance['padding']         = ( ! empty( $new_instance['padding'] ) ) ? sanitize_text_field( $new_instance['padding'] ) : '10px 20px';
        $instance['width']           = ( ! empty( $new_instance['width'] ) ) ? sanitize_text_field( $new_instance['width'] ) : '350px'; // Changed from '100%' to '350px'
        $instance['height']          = ( ! empty( $new_instance['height'] ) ) ? sanitize_text_field( $new_instance['height'] ) : '50px';
        $instance['display_mode']    = ( ! empty( $new_instance['display_mode'] ) && in_array( $new_instance['display_mode'], array( 'icon', 'full' ), true ) ) ? sanitize_text_field( $new_instance['display_mode'] ) : 'full';
        $instance['placeholders']    = ( ! empty( $new_instance['placeholders'] ) ) ? sanitize_textarea_field( $new_instance['placeholders'] ) : "יין אדום צרפתי, פירותי וקליל";

        return $instance;
    }
}

// Register the widget
function semantix_register_custom_search_widget() {
    register_widget( 'Semantix_Custom_Search_Widget' );
}
add_action( 'widgets_init', 'semantix_register_custom_search_widget' );

/**
 * Use a custom search template to maintain header and footer.
 */
add_filter( 'template_include', 'semantix_custom_search_template', 99 );
function semantix_custom_search_template( $template ) {
    if ( is_search() ) {
        // Check if the custom template exists in the plugin's 'templates' folder
        $custom_template = plugin_dir_path( __FILE__ ) . 'templates/search-custom.php';
        if ( file_exists( $custom_template ) ) {
            return $custom_template;
        }
    }
    return $template;
}

/**
 * Create the custom template file within the plugin upon activation.
 */
register_activation_hook( __FILE__, 'semantix_create_custom_template' );
function semantix_create_custom_template() {
    $template_dir = plugin_dir_path( __FILE__ ) . 'templates';
    if ( ! file_exists( $template_dir ) ) {
        wp_mkdir_p( $template_dir );
    }

    $template_file = $template_dir . '/search-custom.php';
   
}

// REST OF THE ADMIN PANEL CODE REMAINS EXACTLY THE SAME...

add_action('admin_menu', 'semantix_add_admin_menu');
add_action('admin_enqueue_scripts', 'semantix_admin_enqueue_scripts',20);

/**
 * Add menu item
 */
function semantix_add_admin_menu() {
    // Add top-level menu
    add_menu_page(
        __('Semantix AI Search', 'semantix-ai-search'),
        __('Semantix Search', 'semantix-ai-search'),
        'manage_options',
        'semantix-ai-search',
        'semantix_admin_page',
        'dashicons-search',
        58 // Position after WooCommerce
    );
    
    // Add submenu pages
    add_submenu_page(
        'semantix-ai-search',
        __('Dashboard', 'semantix-ai-search'),
        __('Dashboard', 'semantix-ai-search'),
        'manage_options',
        'semantix-ai-search',
        'semantix_admin_page'
    );
    
    add_submenu_page(
        'semantix-ai-search',
        __('Search Bar Customization', 'semantix-ai-search'),
        __('Customization', 'semantix-ai-search'),
        'manage_options',
        'semantix-search-customization',
        'semantix_search_customization_page'
    );
    
    add_submenu_page(
        'semantix-ai-search',
        __('Placeholders', 'semantix-ai-search'),
        __('Placeholders', 'semantix-ai-search'),
        'manage_options',
        'semantix-search-placeholders',
        'semantix_search_placeholders_page'
    );
    
    add_submenu_page(
        'semantix-ai-search',
        __('Advanced Settings', 'semantix-ai-search'),
        __('Advanced Settings', 'semantix-ai-search'),
        'manage_options',
        'semantix-search-advanced',
        'semantix_search_advanced_page'
    );
}

/**
 * Enqueue admin scripts and styles
 */
function semantix_admin_enqueue_scripts($hook) {
    // Only load on our plugin pages
    if (strpos($hook, 'semantix-') === false) {
        return;
    }
    
    // Add WooCommerce admin styles for consistency
  if ( class_exists( 'WooCommerce' ) ) {
        wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', array(), WC_VERSION );
    }

    
    // Add color picker
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');
    
    // Add our custom styles and scripts
        wp_enqueue_style(
        'semantix-admin-style',
        plugin_dir_url( __FILE__ ) . 'assets/css/admin.css',
        array( 'woocommerce_admin_styles' ), // ← WooCommerce dep
        '1.0.0'
    );
    wp_enqueue_script('semantix-admin-script', plugin_dir_url(__FILE__) . 'assets/js/admin.js', array('jquery', 'wp-color-picker'), '1.0.0', true);
}

/**
 * Main admin page callback
 */
function semantix_admin_page() {
    // Get stats if available
    $total_searches = get_option('semantix_total_searches', 0);
    $popular_searches = get_option('semantix_popular_searches', array());
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Semantix AI Search Dashboard', 'semantix-ai-search'); ?></h1>
        
        <div class="semantix-dashboard-welcome">
            <div class="semantix-welcome-panel">
                <h2><?php echo esc_html__('Welcome to Semantix AI Search', 'semantix-ai-search'); ?></h2>
                <p class="about-description">
                    <?php echo esc_html__('Enhance your site\'s search experience with AI-powered search that understands what your customers are looking for.', 'semantix-ai-search'); ?>
                </p>
                <div class="semantix-welcome-panel-content">
                    <div class="semantix-welcome-panel-column">
                        <h3><?php echo esc_html__('Getting Started', 'semantix-ai-search'); ?></h3>
                        <ul>
                            <li><a href="<?php echo esc_url(admin_url('admin.php?page=semantix-search-customization')); ?>"><?php echo esc_html__('Customize your search bar appearance', 'semantix-ai-search'); ?></a></li>
                            <li><a href="<?php echo esc_url(admin_url('admin.php?page=semantix-search-placeholders')); ?>"><?php echo esc_html__('Set up dynamic search placeholders', 'semantix-ai-search'); ?></a></li>
                            <li><a href="<?php echo esc_url(admin_url('admin.php?page=semantix-search-advanced')); ?>"><?php echo esc_html__('Configure advanced search settings', 'semantix-ai-search'); ?></a></li>
                        </ul>
                    </div>
                    <div class="semantix-welcome-panel-column">
                        <h3><?php echo esc_html__('Usage', 'semantix-ai-search'); ?></h3>
                        <ul>
                            <li><?php echo esc_html__('Shortcode: ', 'semantix-ai-search'); ?><code>[semantix_search_bar]</code></li>
                            <li><?php echo esc_html__('Widget: Add the "Semantix AI Search Bar" widget to any widget area', 'semantix-ai-search'); ?></li>
                            <li><?php echo esc_html__('Auto-replace: The plugin automatically replaces standard WordPress and WooCommerce search forms', 'semantix-ai-search'); ?></li>
                        </ul>
                    </div>
                    <?php if (!empty($total_searches)) : ?>
                    <div class="semantix-welcome-panel-column">
                        <h3><?php echo esc_html__('Search Analytics', 'semantix-ai-search'); ?></h3>
                        <p><?php echo esc_html(sprintf(__('Total Searches: %d', 'semantix-ai-search'), $total_searches)); ?></p>
                        <?php if (!empty($popular_searches)) : ?>
                            <h4><?php echo esc_html__('Popular Searches', 'semantix-ai-search'); ?></h4>
                            <ul>
                                <?php foreach ($popular_searches as $search => $count) : ?>
                                    <li><?php echo esc_html($search); ?> (<?php echo esc_html($count); ?>)</li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <div class="semantix-admin-boxes">
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Live Preview', 'semantix-ai-search'); ?></h2>
                <div class="semantix-preview-container">
                    <?php echo do_shortcode('[semantix_search_bar]'); ?>
                </div>
            </div>
            
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Quick Settings', 'semantix-ai-search'); ?></h2>
                <form method="post" action="options.php">
                    <?php
                    settings_fields('semantix_quick_settings');
                    do_settings_sections('semantix_quick_settings');
                    
                    $primary_color = get_option('semantix_primary_color', '#0073aa');
                    $border_radius = get_option('semantix_border_radius', '50px');
                    $display_mode = get_option('semantix_display_mode', 'full');
                    ?>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row"><?php echo esc_html__('Primary Color', 'semantix-ai-search'); ?></th>
                            <td>
                                <input type="text" name="semantix_primary_color" value="<?php echo esc_attr($primary_color); ?>" class="semantix-color-picker" />
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row"><?php echo esc_html__('Border Radius', 'semantix-ai-search'); ?></th>
                            <td>
                                <input type="text" name="semantix_border_radius" value="<?php echo esc_attr($border_radius); ?>" />
                                <p class="description"><?php echo esc_html__('Example: 50px, 10px, 0', 'semantix-ai-search'); ?></p>
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row"><?php echo esc_html__('Display Mode', 'semantix-ai-search'); ?></th>
                            <td>
                                <select name="semantix_display_mode">
                                    <option value="full" <?php selected($display_mode, 'full'); ?>><?php echo esc_html__('Full Search Bar', 'semantix-ai-search'); ?></option>
                                    <option value="icon" <?php selected($display_mode, 'icon'); ?>><?php echo esc_html__('Icon Only', 'semantix-ai-search'); ?></option>
                                </select>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(__('Save Quick Settings', 'semantix-ai-search')); ?>
                </form>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Search customization page
 */
function semantix_search_customization_page() {
    // Check if form was submitted
    if (isset($_POST['semantix_save_customization'])) {
        // Validate and save settings
        $primary_color = sanitize_hex_color($_POST['semantix_primary_color']) ?: '#0073aa';
        $secondary_color = sanitize_hex_color($_POST['semantix_secondary_color']) ?: '#005177';
        $border_radius = sanitize_text_field($_POST['semantix_border_radius']);
        $padding = sanitize_text_field($_POST['semantix_padding']);
        $width = sanitize_text_field($_POST['semantix_width']);
        $height = sanitize_text_field($_POST['semantix_height']);
        $display_mode = in_array($_POST['semantix_display_mode'], array('icon', 'full'), true) ? $_POST['semantix_display_mode'] : 'full';
        $size = in_array($_POST['semantix_size'], array('small', 'medium', 'large'), true) ? $_POST['semantix_size'] : 'medium';
        $api_key = isset( $_POST['semantix_api_key'] ) ? sanitize_text_field( $_POST['semantix_api_key'] ) : '';

        
        // Save settings
        update_option( 'semantix_api_key', $api_key );
        update_option('semantix_primary_color', $primary_color);
        update_option('semantix_secondary_color', $secondary_color);
        update_option('semantix_border_radius', $border_radius);
        update_option('semantix_padding', $padding);
        update_option('semantix_width', $width);
        update_option('semantix_height', $height);
        update_option('semantix_display_mode', $display_mode);
        update_option('semantix_size', $size);
        
        
        // Show success message
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Customization settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    
    // Get current settings
    $primary_color = get_option('semantix_primary_color', '#0073aa');
    $secondary_color = get_option('semantix_secondary_color', '#005177');
    $border_radius = get_option('semantix_border_radius', '50px');
    $padding = get_option('semantix_padding', '10px 20px');
    $width = get_option('semantix_width', '350px');
    $height = get_option('semantix_height', '50px');
    $display_mode = get_option('semantix_display_mode', 'full');
    $size = get_option('semantix_size', 'medium');
    
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Search Bar Customization', 'semantix-ai-search'); ?></h1>
        
        <div class="semantix-admin-columns">
            <div class="semantix-admin-main">
                <form method="post" action="">
                    <div class="semantix-admin-box">
                        <h2><?php echo esc_html__('Appearance Settings', 'semantix-ai-search'); ?></h2>
                        <table class="form-table">
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Search Bar Size', 'semantix-ai-search'); ?></th>
                                <td>
                                    <select name="semantix_size" id="semantix_size">
                                        <option value="small" <?php selected($size, 'small'); ?>><?php echo esc_html__('Small', 'semantix-ai-search'); ?></option>
                                        <option value="medium" <?php selected($size, 'medium'); ?>><?php echo esc_html__('Medium', 'semantix-ai-search'); ?></option>
                                        <option value="large" <?php selected($size, 'large'); ?>><?php echo esc_html__('Large', 'semantix-ai-search'); ?></option>
                                    </select>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Display Mode', 'semantix-ai-search'); ?></th>
                                <td>
                                    <select name="semantix_display_mode" id="semantix_display_mode">
                                        <option value="full" <?php selected($display_mode, 'full'); ?>><?php echo esc_html__('Full Search Bar', 'semantix-ai-search'); ?></option>
                                        <option value="icon" <?php selected($display_mode, 'icon'); ?>><?php echo esc_html__('Icon Only', 'semantix-ai-search'); ?></option>
                                    </select>
                                    <p class="description"><?php echo esc_html__('Full shows the complete search bar, Icon shows only an icon that expands to a full search when clicked. Note: On narrow containers, icon mode will be used automatically regardless of this setting.', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Primary Color', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_primary_color" value="<?php echo esc_attr($primary_color); ?>" class="semantix-color-picker" />
                                    <p class="description"><?php echo esc_html__('Main color for borders and interactive elements', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Secondary Color', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_secondary_color" value="<?php echo esc_attr($secondary_color); ?>" class="semantix-color-picker" />
                                    <p class="description"><?php echo esc_html__('Secondary color for accents and hover states', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Border Radius', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_border_radius" value="<?php echo esc_attr($border_radius); ?>" />
                                    <p class="description"><?php echo esc_html__('Example: 50px for fully rounded corners, 4px for slightly rounded, 0 for square', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Padding', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_padding" value="<?php echo esc_attr($padding); ?>" />
                                    <p class="description"><?php echo esc_html__('Internal spacing. Example: 10px 20px (vertical horizontal)', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Width', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_width" value="<?php echo esc_attr($width); ?>" />
                                    <p class="description"><?php echo esc_html__('Width of search bar. Example: 350px, 500px, 100%', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><?php echo esc_html__('Height', 'semantix-ai-search'); ?></th>
                                <td>
                                    <input type="text" name="semantix_height" value="<?php echo esc_attr($height); ?>" />
                                    <p class="description"><?php echo esc_html__('Height of search bar. Example: 50px, 60px', 'semantix-ai-search'); ?></p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <p class="submit">
                        <input type="submit" name="semantix_save_customization" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Changes', 'semantix-ai-search'); ?>" />
                    </p>
                </form>
            </div>
            
            <div class="semantix-admin-sidebar">
                <div class="semantix-admin-box">
                    <h2><?php echo esc_html__('Live Preview', 'semantix-ai-search'); ?></h2>
                    <div class="semantix-preview-container" id="semantix_preview_container">
                        <?php 
                        echo do_shortcode(sprintf(
                            '[semantix_search_bar size="%s" primary_color="%s" secondary_color="%s" border_radius="%s" padding="%s" width="%s" height="%s" display_mode="%s"]',
                            esc_attr($size),
                            esc_attr($primary_color),
                            esc_attr($secondary_color),
                            esc_attr($border_radius),
                            esc_attr($padding),
                            esc_attr($width),
                            esc_attr($height),
                            esc_attr($display_mode)
                        )); 
                        ?>
                    </div>
                    <p class="description"><?php echo esc_html__('This preview updates when you save changes', 'semantix-ai-search'); ?></p>
                </div>
                
                <div class="semantix-admin-box">
                    <h2><?php echo esc_html__('Shortcode Generator', 'semantix-ai-search'); ?></h2>
                    <div class="semantix-shortcode-generator">
                        <p><?php echo esc_html__('Use this shortcode to add the search bar to any content:', 'semantix-ai-search'); ?></p>
                        <code id="semantix_generated_shortcode">[semantix_search_bar size="<?php echo esc_attr($size); ?>" primary_color="<?php echo esc_attr($primary_color); ?>" border_radius="<?php echo esc_attr($border_radius); ?>" display_mode="<?php echo esc_attr($display_mode); ?>"]</code>
                        <button type="button" class="button" id="semantix_copy_shortcode"><?php echo esc_html__('Copy Shortcode', 'semantix-ai-search'); ?></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        // Initialize color pickers
        $('.semantix-color-picker').wpColorPicker({
            change: function(event, ui) {
                // Update preview when color changes
                updateShortcodePreview();
            }
        });
        
        // Copy shortcode functionality
        $('#semantix_copy_shortcode').on('click', function() {
            var tempInput = $('<input>');
            $('body').append(tempInput);
            tempInput.val($('#semantix_generated_shortcode').text()).select();
            document.execCommand('copy');
            tempInput.remove();
            
            var originalText = $(this).text();
            $(this).text('<?php echo esc_js(__('Copied!', 'semantix-ai-search')); ?>');
            setTimeout(function() {
                $('#semantix_copy_shortcode').text(originalText);
            }, 2000);
        });
        
        // Real-time shortcode preview generator
        function updateShortcodePreview() {
            var size = $('#semantix_size').val();
            var displayMode = $('#semantix_display_mode').val();
            var primaryColor = $('.semantix-color-picker').val();
            var borderRadius = $('input[name="semantix_border_radius"]').val();
            
            var shortcode = '[semantix_search_bar size="' + size + '" primary_color="' + primaryColor + '" border_radius="' + borderRadius + '" display_mode="' + displayMode + '"]';
            
            $('#semantix_generated_shortcode').text(shortcode);
        }
        
        // Update shortcode when form values change
        $('#semantix_size, #semantix_display_mode, input[name="semantix_border_radius"]').on('change', updateShortcodePreview);
    });
    </script>
    <?php
}

/**
 * Placeholders settings page
 */
function semantix_search_placeholders_page() {
    // Check if form was submitted
    if (isset($_POST['semantix_save_placeholders'])) {
        // Get and sanitize placeholders
        $placeholders = isset($_POST['semantix_placeholders']) ? sanitize_textarea_field($_POST['semantix_placeholders']) : '';
        $placeholder_speed = isset($_POST['semantix_placeholder_speed']) ? absint($_POST['semantix_placeholder_speed']) : 3000;
        
        // Save settings
        update_option('semantix_placeholders', $placeholders);
        update_option('semantix_placeholder_speed', $placeholder_speed);
        
        // Show success message
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Placeholder settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    
    // Get current settings
    $placeholders = get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל, יין לבן מרענן');
    $placeholder_speed = get_option('semantix_placeholder_speed', 3000);
    
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Search Placeholders', 'semantix-ai-search'); ?></h1>
        
        <form method="post" action="">
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Dynamic Placeholders', 'semantix-ai-search'); ?></h2>
                <p><?php echo esc_html__('Add search suggestions that will rotate in the search bar placeholder. Each line will be displayed as a separate placeholder.', 'semantix-ai-search'); ?></p>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Placeholder Suggestions', 'semantix-ai-search'); ?></th>
                        <td>
                            <textarea name="semantix_placeholders" rows="10" cols="50" class="large-text"><?php echo esc_textarea($placeholders); ?></textarea>
                            <p class="description"><?php echo esc_html__('Enter each placeholder text on a new line. These will rotate automatically in the search field.', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Rotation Speed', 'semantix-ai-search'); ?></th>
                        <td>
                            <input type="number" name="semantix_placeholder_speed" value="<?php echo esc_attr($placeholder_speed); ?>" min="1000" step="500" />
                            <p class="description"><?php echo esc_html__('Time in milliseconds between placeholder changes (1000 = 1 second)', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Placeholder Preview', 'semantix-ai-search'); ?></h2>
                <div class="semantix-preview-container">
                    <?php 
                    // Convert textarea content to comma-separated for shortcode
                    $placeholder_lines = explode("\n", $placeholders);
                    $placeholder_lines = array_map('trim', $placeholder_lines);
                    $placeholder_list = implode(', ', $placeholder_lines);
                    
                    echo do_shortcode('[semantix_search_bar placeholders="' . esc_attr($placeholder_list) . '"]'); 
                    ?>
                </div>
                <p class="description"><?php echo esc_html__('This preview shows how your placeholders will appear in the search bar', 'semantix-ai-search'); ?></p>
            </div>
            
            <p class="submit">
                <input type="submit" name="semantix_save_placeholders" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Changes', 'semantix-ai-search'); ?>" />
            </p>
        </form>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        // Preview live-updating functionality could be added here
    });
    </script>
    <?php
}

/**
 * Advanced settings page
 */
function semantix_search_advanced_page() {
    // Check if form was submitted
    if (isset($_POST['semantix_save_advanced'])) {
        // Get and sanitize settings
         $api_key = isset($_POST['semantix_api_key'])
        ? sanitize_text_field( $_POST['semantix_api_key'] )
        : '';
        $enable_auto_replace = isset($_POST['semantix_enable_auto_replace']) ? 1 : 0;
        $api_endpoint = isset($_POST['semantix_api_endpoint']) ? esc_url_raw($_POST['semantix_api_endpoint']) : '';
 $custom_selectors = isset($_POST['semantix_custom_selectors']) ? sanitize_textarea_field($_POST['semantix_custom_selectors']) : '';
        $dbname = isset($_POST['semantix_dbname']) ? sanitize_text_field($_POST['semantix_dbname']) : 'dizzy';
        $collection1 = isset($_POST['semantix_collection1']) ? sanitize_text_field($_POST['semantix_collection1']) : 'products';
        $collection2 = isset($_POST['semantix_collection2']) ? sanitize_text_field($_POST['semantix_collection2']) : 'queries';
        $custom_css = isset($_POST['semantix_custom_css']) ? sanitize_textarea_field($_POST['semantix_custom_css']) : '';
        
        // Save settings
        update_option('semantix_enable_auto_replace', $enable_auto_replace);
		update_option('semantix_custom_selectors', $custom_selectors);
		    update_option( 'semantix_api_key', $api_key );
        update_option('semantix_api_endpoint', $api_endpoint);
        update_option('semantix_dbname', $dbname);
        update_option('semantix_collection1', $collection1);
        update_option('semantix_collection2', $collection2);
        update_option('semantix_custom_css', $custom_css);
        
        // Show success message
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Advanced settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    
    // Get current settings
    $enable_auto_replace = get_option('semantix_enable_auto_replace', 1);
    $api_endpoint = get_option('semantix_api_endpoint', 'https://dashboard-server-ae00.onrender.com/autocomplete');
	  $custom_selectors = get_option('semantix_custom_selectors', '');
    $dbname = get_option('semantix_dbname', 'alcohome');
    $collection1 = get_option('semantix_collection1', 'products');
    $collection2 = get_option('semantix_collection2', 'queries');
    $custom_css = get_option('semantix_custom_css', '');
    
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Advanced Settings', 'semantix-ai-search'); ?></h1>
        
        <form method="post" action="">
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Search Integration', 'semantix-ai-search'); ?></h2>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Auto-Replace WordPress & WooCommerce Search', 'semantix-ai-search'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="semantix_enable_auto_replace" value="1" <?php checked($enable_auto_replace, 1); ?> />
                                <?php echo esc_html__('Automatically replace default search forms with Semantix AI Search', 'semantix-ai-search'); ?>
                            </label>
                            <p class="description"><?php echo esc_html__('When enabled, all standard WordPress and WooCommerce search forms will be replaced with the Semantix AI , making it the default search option.', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('API Configuration', 'semantix-ai-search'); ?></h2>
                
                <table class="form-table">
              <tr valign="top">
  <th scope="row"><?php esc_html_e( 'API Key', 'semantix-ai-search' ); ?></th>
  <td>
    <input
      type="text"
      name="semantix_api_key"
      value="<?php echo esc_attr( get_option( 'semantix_api_key', '' ) ); ?>"
      class="regular-text"
      placeholder="Paste your Semantix API key here"
    />
    <p class="description"><?php esc_html_e( 'Paste the key from your Semantix dashboard.', 'semantix-ai-search' ); ?></p>
  </td>
</tr>
       <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Custom CSS Selectors', 'semantix-ai-search'); ?></th>
                        <td>
                            <textarea name="semantix_custom_selectors" rows="6" cols="70" class="large-text code" placeholder=".header-search, #search-form, .custom-search-widget"><?php echo esc_textarea($custom_selectors); ?></textarea>
                            <p class="description">
                                <?php echo esc_html__('Add custom CSS selectors (comma-separated) to replace with Semantix search:', 'semantix-ai-search'); ?>
                                <br><strong><?php echo esc_html__('Examples:', 'semantix-ai-search'); ?></strong>
                                <br><code>.header-search, #main-search, .custom-search-form, .theme-search-widget</code>
                                <br><em><?php echo esc_html__('Long selectors can span multiple lines for better readability.', 'semantix-ai-search'); ?></em>
                            </p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('API Endpoint URL', 'semantix-ai-search'); ?></th>
                        <td>
                            <input type="url" name="semantix_api_endpoint" value="<?php echo esc_attr($api_endpoint); ?>" class="regular-text" />
                            <p class="description"><?php echo esc_html__('The URL of the Semantix suggestion API endpoint', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Database Parameters', 'semantix-ai-search'); ?></th>
                        <td>
                            <div class="semantix-field-group">
                                <label>
                                    <?php echo esc_html__('Database Name:', 'semantix-ai-search'); ?>
                                    <input type="text" name="semantix_dbname" value="<?php echo esc_attr($dbname); ?>" />
                                </label>
                            </div>
                            <div class="semantix-field-group">
                                <label>
                                    <?php echo esc_html__('Collection Name 1:', 'semantix-ai-search'); ?>
                                    <input type="text" name="semantix_collection1" value="<?php echo esc_attr($collection1); ?>" />
                                </label>
                            </div>
                            <div class="semantix-field-group">
                                <label>
                                    <?php echo esc_html__('Collection Name 2:', 'semantix-ai-search'); ?>
                                    <input type="text" name="semantix_collection2" value="<?php echo esc_attr($collection2); ?>" />
                                </label>
                            </div>
                            <p class="description"><?php echo esc_html__('These parameters are used in the API calls for autocompletions', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Custom CSS', 'semantix-ai-search'); ?></h2>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php echo esc_html__('Additional CSS', 'semantix-ai-search'); ?></th>
                        <td>
                            <textarea name="semantix_custom_css" rows="10" cols="50" class="large-text code"><?php echo esc_textarea($custom_css); ?></textarea>
                            <p class="description"><?php echo esc_html__('Add custom CSS to further customize the appearance of your search bar', 'semantix-ai-search'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <p class="submit">
                <input type="submit" name="semantix_save_advanced" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Advanced Settings', 'semantix-ai-search'); ?>" />
            </p>
        </form>
    </div>
    <?php
}

/**
 * Register settings
 */
function semantix_register_settings() {
    // Quick settings

    register_setting('semantix_quick_settings', 'semantix_primary_color');
    register_setting('semantix_quick_settings', 'semantix_border_radius');
    register_setting('semantix_quick_settings', 'semantix_display_mode');
    
    // Main settings
    register_setting('semantix_settings', 'semantix_primary_color');
    register_setting('semantix_settings', 'semantix_secondary_color');
    register_setting('semantix_settings', 'semantix_border_radius');
    register_setting('semantix_settings', 'semantix_padding');
    register_setting('semantix_settings', 'semantix_width');
    register_setting('semantix_settings', 'semantix_height');
    register_setting('semantix_settings', 'semantix_display_mode');
    register_setting('semantix_settings', 'semantix_size');
    
    // Placeholder settings
    register_setting('semantix_settings', 'semantix_placeholders');
    register_setting('semantix_settings', 'semantix_placeholder_speed');
    
    // Advanced settings
    register_setting('semantix_settings', 'semantix_enable_auto_replace');
	register_setting('semantix_settings', 'semantix_custom_selectors');
    register_setting( 'semantix_settings', 'semantix_api_key' );
    register_setting('semantix_settings', 'semantix_api_endpoint');
    register_setting('semantix_settings', 'semantix_dbname');
    register_setting('semantix_settings', 'semantix_collection1');
    register_setting('semantix_settings', 'semantix_collection2');
    register_setting('semantix_settings', 'semantix_custom_css');
}
add_action('admin_init', 'semantix_register_settings');

/**
 * Create CSS and JS assets directory and files
 */
function semantix_create_assets() {
    // Create assets directory structure
    $assets_dir = plugin_dir_path(__FILE__) . 'assets';
    $css_dir = $assets_dir . '/css';
    $js_dir = $assets_dir . '/js';
    $images_dir = $assets_dir . '/images';
    
    if (!file_exists($assets_dir)) {
        wp_mkdir_p($assets_dir);
    }
    
    if (!file_exists($css_dir)) {
        wp_mkdir_p($css_dir);
    }
    
    if (!file_exists($js_dir)) {
        wp_mkdir_p($js_dir);
    }
    
    if (!file_exists($images_dir)) {
        wp_mkdir_p($images_dir);
    }
    
    // Create CSS file if doesn't exist
    $css_file = $css_dir . '/admin.css';
    if (!file_exists($css_file)) {
        $css_content = <<<CSS
/**
 * Semantix AI Search Admin Styles
 */
 
/* Admin layout */
.semantix-admin-wrap {
    margin: 20px 20px 0 0;
}

.semantix-dashboard-welcome {
    margin-bottom: 20px;
}

.semantix-welcome-panel {
    background: #fff;
    border: 1px solid #c3c4c7;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    padding: 23px 10px 0;
    position: relative;
    line-height: 1.7;
    margin: 0 0 20px;
}

.semantix-welcome-panel h2 {
    margin: 0;
    font-size: 21px;
    font-weight: 400;
    line-height: 1.2;
    padding: 0 10px;
}

.semantix-welcome-panel .about-description {
    margin: 15px 10px;
    font-size: 16px;
}

.semantix-welcome-panel-content {
    display: flex;
    flex-wrap: wrap;
}

.semantix-welcome-panel-column {
    flex: 1;
    min-width: 200px;
    padding: 0 10px 20px;
}

/* Admin boxes */
.semantix-admin-box {
    background: #fff;
    border: 1px solid #c3c4c7;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    margin-bottom: 20px;
    padding: 15px;
}

.semantix-admin-box h2 {
    border-bottom: 1px solid #eee;
    margin: 0 0 15px;
    padding-bottom: 10px;
    font-size: 14px;
}

.semantix-admin-boxes {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
}

.semantix-admin-boxes .semantix-admin-box {
    flex: 1;
    min-width: 300px;
    margin: 0 10px 20px;
}

/* Admin columns */
.semantix-admin-columns {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
}

.semantix-admin-main {
    flex: 2;
    min-width: 500px;
    padding: 0 10px;
}

.semantix-admin-sidebar {
    flex: 1;
    min-width: 300px;
    padding: 0 10px;
}

/* Preview container */
.semantix-preview-container {
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 4px;
}

/* Shortcode generator */
.semantix-shortcode-generator {
    margin-bottom: 15px;
}

.semantix-shortcode-generator code {
    display: block;
    padding: 10px;
    margin: 10px 0;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 3px;
    word-break: break-all;
}

/* Field groups */
.semantix-field-group {
    margin-bottom: 10px;
}

.semantix-field-group label {
    display: block;
}

/* Responsive */
@media screen and (max-width: 782px) {
    .semantix-admin-columns, 
    .semantix-admin-boxes,
    .semantix-welcome-panel-content {
        flex-direction: column;
    }
    
    .semantix-admin-main,
    .semantix-admin-sidebar,
    .semantix-welcome-panel-column {
        min-width: 100%;
    }
}
CSS;
        file_put_contents($css_file, $css_content);
    }
    
    // Create JS file if doesn't exist
    $js_file = $js_dir . '/admin.js';
    if (!file_exists($js_file)) {
        $js_content = <<<JS
/**
 * Semantix AI Search Admin Scripts
 */
jQuery(document).ready(function($) {
    // Initialize color pickers
    if ($.fn.wpColorPicker) {
        $('.semantix-color-picker').wpColorPicker();
    }
    
    // Copy shortcode to clipboard
    $('#semantix_copy_shortcode').on('click', function() {
        var copyText = document.getElementById('semantix_generated_shortcode');
        
        // Create a temporary input element
        var tempInput = document.createElement('input');
        tempInput.value = copyText.textContent;
        document.body.appendChild(tempInput);
        
        // Select and copy the text
        tempInput.select();
        document.execCommand('copy');
        
        // Remove the temporary element
        document.body.removeChild(tempInput);
        
        // Update button text temporarily
        var originalText = $(this).text();
        $(this).text('Copied!');
        
        setTimeout(function() {
            $('#semantix_copy_shortcode').text(originalText);
        }, 2000);
    });
    
    // Live preview updates
    function updateLivePreview() {
        // Implementation would depend on your specific needs
        // Could use AJAX to refresh preview with current settings
    }
    
    // Update shortcode when form fields change
    function updateShortcode() {
        var size = $('#semantix_size').val() || 'medium';
        var primaryColor = $('input[name="semantix_primary_color"]').val() || '#0073aa';
        var borderRadius = $('input[name="semantix_border_radius"]').val() || '50px';
        var displayMode = $('#semantix_display_mode').val() || 'full';
        
        var shortcode = '[semantix_search_bar';
        shortcode += ' size="' + size + '"';
        shortcode += ' primary_color="' + primaryColor + '"';
        shortcode += ' border_radius="' + borderRadius + '"';
        shortcode += ' display_mode="' + displayMode + '"';
        shortcode += ']';
        
        $('#semantix_generated_shortcode').text(shortcode);
    }
    
    // Listen for changes in customization form
    $('#semantix_size, #semantix_display_mode').on('change', updateShortcode);
    $('input[name="semantix_primary_color"], input[name="semantix_border_radius"]').on('change', updateShortcode);
});
JS;
        file_put_contents($js_file, $js_content);
    }
}
register_activation_hook(__FILE__, 'semantix_create_assets');

/**
 * Add settings link on plugin page
 */
function semantix_settings_link($links) {
    $settings_link = '<a href="admin.php?page=semantix-ai-search">' . __('Settings', 'semantix-ai-search') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'semantix_settings_link');

/**
 * Add custom CSS from admin settings
 */
function semantix_add_custom_css() {
    $custom_css = get_option('semantix_custom_css');
    if (!empty($custom_css)) {
        echo '<style type="text/css">' . esc_html($custom_css) . '</style>';
    }
}
add_action('wp_head', 'semantix_add_custom_css');

/**
 * Add database parameters to the suggestions API call
 */
add_action( 'wp_footer', function () {

    $api_endpoint = esc_js( get_option( 'semantix_api_endpoint', 'https://dashboard-server-ae00.onrender.com/autocomplete' ) );
    $dbname       = esc_js( get_option( 'semantix_dbname',       'theyDream' ) );
    $c1           = esc_js( get_option( 'semantix_collection1',  'products' ) );
    $c2           = esc_js( get_option( 'semantix_collection2',  'queries' ) );
    $api_key      = esc_js( get_option( 'semantix_api_key',      '' ) );   // NEW
?>
<script>
document.addEventListener('DOMContentLoaded', () => {

  /* ודאו שהפונקציה קיימת */
  if (typeof window.semantix_fetchSuggestions !== 'function') return;

  const API  = "<?php echo esc_js( get_option('semantix_api_endpoint',
                     'https://dashboard-server-ae00.onrender.com/autocomplete') ); ?>";
  const KEY  = "<?php echo esc_js( get_option('semantix_api_key', '' ) ); ?>";

  window.semantix_fetchSuggestions = async (input, list) => {
    try {
      const url = new URL(API);
      url.searchParams.set('query', input);

      const headers = KEY ? { 'x-api-key': KEY } : {};

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();
      window.semantix_displaySuggestions(data, list);
    } catch (err) {
      console.warn('[Semantix] autocomplete failed', err);
    }
  };

  /* לעדכן גם את ה-debounce שהשתנה */
  window.semantix_debouncedFetchSuggestions =
      window.semantix_debounce(window.semantix_fetchSuggestions, 200);
});
</script>

<?php
}, 99 );


/**
 * Add analytics tracking for search queries
 */
function semantix_track_search_query() {
    if (is_search() && get_search_query()) {
        $query = get_search_query();
        
        // Get existing search data
        $total_searches = get_option('semantix_total_searches', 0);
        $popular_searches = get_option('semantix_popular_searches', array());
        
        // Update total count
        $total_searches++;
        
        // Update popular searches
        if (isset($popular_searches[$query])) {
            $popular_searches[$query]++;
        } else {
            $popular_searches[$query] = 1;
        }
        
        // Sort by popularity
        arsort($popular_searches);
        
        // Keep only top 20 searches
        if (count($popular_searches) > 20) {
            $popular_searches = array_slice($popular_searches, 0, 20, true);
        }
        
        // Save updated data
        update_option('semantix_total_searches', $total_searches);
        update_option('semantix_popular_searches', $popular_searches);
    }
}
add_action('template_redirect', 'semantix_track_search_query');

/**
 * IMPORTANT: This filter modifies the existing shortcode function
 * Instead of redefining the function, we'll filter its output
 */
function semantix_modify_shortcode_defaults($atts) {
    // Get saved settings to use as defaults
    $default_primary_color = get_option('semantix_primary_color', '#0073aa');
    $default_secondary_color = get_option('semantix_secondary_color', '#005177');
    $default_border_radius = get_option('semantix_border_radius', '50px');
    $default_padding = get_option('semantix_padding', '10px 20px');
    $default_width = get_option('semantix_width', '350px');
    $default_height = get_option('semantix_height', '50px');
    $default_display_mode = get_option('semantix_display_mode', 'full');
    $default_size = get_option('semantix_size', 'medium');
    $default_placeholders = get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל');
    
    // Convert placeholders from textarea format to comma-separated
    if (strpos($default_placeholders, "\n") !== false) {
        $placeholder_lines = explode("\n", $default_placeholders);
        $placeholder_lines = array_map('trim', $placeholder_lines);
        $default_placeholders = implode(', ', $placeholder_lines);
    }
    
    // Add defaults only for attributes that aren't specified
    if (!isset($atts['size'])) {
        $atts['size'] = $default_size;
    }
    
    if (!isset($atts['primary_color'])) {
        $atts['primary_color'] = $default_primary_color;
    }
    
    if (!isset($atts['secondary_color'])) {
        $atts['secondary_color'] = $default_secondary_color;
    }
    
    if (!isset($atts['border_radius'])) {
        $atts['border_radius'] = $default_border_radius;
    }
    
    if (!isset($atts['padding'])) {
        $atts['padding'] = $default_padding;
    }
    
    if (!isset($atts['width'])) {
        $atts['width'] = $default_width;
    }
    
    if (!isset($atts['height'])) {
        $atts['height'] = $default_height;
    }
    
    if (!isset($atts['display_mode'])) {
        $atts['display_mode'] = $default_display_mode;
    }
    
    if (!isset($atts['placeholders'])) {
        $atts['placeholders'] = $default_placeholders;
    }
    
    
    return $atts;
}
add_filter('shortcode_atts_semantix_search_bar', 'semantix_modify_shortcode_defaults', 10, 1);

function semantix_track_search_to_cart_query() {
    if (is_search() && get_search_query()) {
        $query = get_search_query();
        
        // Set a cookie with the search query (expires in 30 minutes)
        setcookie('semantix_last_search', sanitize_text_field($query), time() + 1800, COOKIEPATH, COOKIE_DOMAIN, is_ssl());
        
        // Also store in session for more reliable tracking
        if (!session_id()) {
            session_start();
        }
        $_SESSION['semantix_last_search'] = sanitize_text_field($query);
    }
}
add_action('template_redirect', 'semantix_track_search_to_cart_query', 9); // Priority 9 to run before other tracking

/**
 * Track add to cart events and send to MongoDB if related to a search
 */
function semantix_track_add_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
    // Get search query from session or cookie
    $search_query = semantix_get_search_query();
    
    // Only proceed if we have a search query
    if (!empty($search_query)) {
        // Get product details
        $product = wc_get_product($product_id);
        $product_name = $product ? $product->get_name() : 'Unknown';
        $product_price = $product ? $product->get_price() : '';
        $product_image = wp_get_attachment_url($product ? $product->get_image_id() : '');
        
        // Prepare data for MongoDB
        $data = array(
            'timestamp' => time(),
            'search_query' => $search_query,
            'product_id' => $product_id,
            'product_name' => $product_name,
            'product_price' => $product_price,
            'product_image' => $product_image,
            'quantity' => $quantity,
            'site_url' => home_url(),
            'event_type' => 'add_to_cart',
            'source' => 'server_side'
        );
        
        // Send data to MongoDB
        semantix_send_to_mongodb($data);
    }
}
add_action('woocommerce_add_to_cart', 'semantix_track_add_to_cart', 10, 6);

/**
 * JavaScript for tracking client-side add to cart events
 */
function semantix_add_search_to_cart_script() {
    // Only add script if WooCommerce is active
    if (!class_exists('WooCommerce')) {
        return;
    }
    
    // Get API endpoint
    $mongodb_api_url = 'https://dashboard-server-ae00.onrender.com/search-to-cart';
    $api_key = get_option('semantix_api_key', '');
    
    ?>
<script>
(function() {
    // Helper function to get cookie value
    function getSemanticCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return decodeURIComponent(parts.pop().split(";").shift());
        return "";
    }
    
    // Track Add to Cart with search query information
    function trackSearchToCartEvent(productId, productName, productPrice, quantity) {
        // Get the last search query from cookie
        var lastSearch = getSemanticCookie('semantix_last_search');
        
        // Get search query from URL if available (for direct search result page adds)
        var urlParams = new URLSearchParams(window.location.search);
        var urlSearch = urlParams.get('s');
        
        // Use the URL search if we're on a search results page, otherwise use the cookie
        var searchQuery = window.location.href.indexOf('/?s=') > -1 ? urlSearch : lastSearch;
        
        // Only track if we have a search query
        if (searchQuery) {
            // Get current timestamp
            var timestamp = Math.floor(Date.now() / 1000);
            
            // Prepare the data for MongoDB
            var searchToCartData = {
                timestamp: timestamp,
                search_query: searchQuery,
                product_id: productId,
                product_name: productName,
                product_price: productPrice,
                quantity: quantity,
                site_url: window.location.hostname,
                event_type: 'add_to_cart',
                source: 'client_side'
            };
            
            // Send to MongoDB API directly
            fetch('<?php echo esc_url($mongodb_api_url); ?>', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '<?php echo esc_attr($api_key); ?>'
                },
                body: JSON.stringify({
                    document: searchToCartData
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Search to cart event saved to MongoDB:', data);
            })
            .catch(error => {
                console.error('Error saving search to cart event:', error);
                
                // Fallback to WordPress AJAX if direct MongoDB call fails
                jQuery.ajax({
                    url: '<?php echo admin_url('admin-ajax.php'); ?>',
                    type: 'POST',
                    data: {
                        action: 'semantix_track_search_to_cart',
                        search_query: searchQuery,
                        product_id: productId,
                        product_name: productName,
                        product_price: productPrice,
                        quantity: quantity
                    },
                    success: function(response) {
                        console.log('Search to cart event tracked via AJAX fallback:', response);
                    }
                });
            });
        }
    }

    // Listen for the WooCommerce add to cart event
    jQuery(document).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        // Get the product data from the button that was clicked
        var productId = $button.data('product_id');
        var productName = $button.closest('.product').find('.woocommerce-loop-product__title').text();
        if (!productName) {
            productName = $button.closest('.product-container').find('.product-name').text();
        }
        var quantity = $button.data('quantity') || 1;
        
        // Try to get the price - this may vary depending on theme
        var productPrice = '';
        var priceElement = $button.closest('.product').find('.price .amount');
        if (priceElement.length > 0) {
            productPrice = priceElement.first().text().trim();
        }
        
        trackSearchToCartEvent(productId, productName, productPrice, quantity);
    });

    // Listen for add to cart button clicks directly from search results
    jQuery(document).on('click', '.add_to_cart_button', function(e) {
        // For direct clicks on search results pages, we'll capture the current search query
        if (window.location.href.indexOf('/?s=') > -1) {
            var urlParams = new URLSearchParams(window.location.search);
            var searchQuery = urlParams.get('s');
            
            if (searchQuery) {
                // Store this for the post-add event in case the page navigates
                document.cookie = "semantix_last_search=" + encodeURIComponent(searchQuery) + 
                                  "; path=/; max-age=1800; SameSite=Lax";
            }
        }
    });
    
    // Track form submissions on product pages if coming from search
    jQuery('form.cart').on('submit', function(e) {
        // If there's a search query in cookie or session
        var searchQuery = getSemanticCookie('semantix_last_search');
        
        if (searchQuery) {
            // Get product information from the product page
            var productId = jQuery('input[name="product_id"]').val() || jQuery('button[name="add-to-cart"]').val();
            var productName = jQuery('.product_title').text();
            var quantity = jQuery('input.qty').val() || 1;
            var productPrice = jQuery('.price .amount').first().text().trim();
            
            // This is a fallback capture - the main tracking happens in the added_to_cart event
            setTimeout(function() {
                trackSearchToCartEvent(productId, productName, productPrice, quantity);
            }, 100);
        }
    });
})();
</script>
    <?php
}
add_action('wp_footer', 'semantix_add_search_to_cart_script', 99);

/**
 * AJAX handler for client-side tracking (fallback method)
 */
function semantix_ajax_search_to_cart_callback() {
    // Get event data
    $search_query = isset($_POST['search_query']) ? sanitize_text_field($_POST['search_query']) : '';
    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
    $product_name = isset($_POST['product_name']) ? sanitize_text_field($_POST['product_name']) : '';
    $product_price = isset($_POST['product_price']) ? sanitize_text_field($_POST['product_price']) : '';
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;
    
    // Send data to MongoDB
    if (!empty($search_query) && !empty($product_id)) {
        $result = semantix_send_to_mongodb(array(
            'timestamp' => time(),
            'search_query' => $search_query,
            'product_id' => $product_id,
            'product_name' => $product_name,
            'product_price' => $product_price,
            'quantity' => $quantity,
            'site_url' => $_SERVER['HTTP_HOST'],
            'event_type' => 'add_to_cart',
            'source' => 'ajax_fallback'
        ));
        
        if ($result) {
            wp_send_json_success('Search to cart event sent to MongoDB');
        } else {
            wp_send_json_error('Failed to send data to MongoDB');
        }
    } else {
        wp_send_json_error('Missing required data');
    }
    
    wp_die();
}
add_action('wp_ajax_semantix_track_search_to_cart', 'semantix_ajax_search_to_cart_callback');
add_action('wp_ajax_nopriv_semantix_track_search_to_cart', 'semantix_ajax_search_to_cart_callback');

/**
 * Helper function to get search query from session or cookie
 */
function semantix_get_search_query() {
    $search_query = '';
    
    // Check session first (more reliable)
    if (isset($_SESSION['semantix_last_search'])) {
        $search_query = sanitize_text_field($_SESSION['semantix_last_search']);
    } 
    // Fall back to cookie if no session data
    elseif (isset($_COOKIE['semantix_last_search'])) {
        $search_query = sanitize_text_field($_COOKIE['semantix_last_search']);
    }
    
    return $search_query;
}

/**
 * Send data to MongoDB
 */
function semantix_send_to_mongodb($data) {
    // API endpoint for MongoDB
    $mongodb_api_url = 'https://dashboard-server-ae00.onrender.com/search-to-cart';
    $api_key = get_option('semantix_api_key', '');
    
    // Make API request
    $response = wp_remote_post($mongodb_api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'x-api-key' => $api_key
        ),
        'body' => json_encode(array(
            'document' => $data
        )),
        'timeout' => 15,
        'data_format' => 'body'
    ));
    
    // Check for errors
    if (is_wp_error($response)) {
        error_log('Semantix: Error sending data to MongoDB: ' . $response->get_error_message());
        return false;
    }
    
    // Check response code
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200 && $response_code !== 201) {
        error_log('Semantix: Error response from MongoDB API: ' . $response_code);
        return false;
    }
    
    return true;
}

// Track add to cart events from search results directly
add_action('woocommerce_loop_add_to_cart_link', 'semantix_add_search_data_to_add_to_cart', 10, 2);

function semantix_add_search_data_to_add_to_cart($html, $product) {
    // Check if we're on a search results page
    if (is_search()) {
        $search_query = get_search_query();
        
        if (!empty($search_query)) {
            // Add data attribute with the search query
            $html = str_replace('add_to_cart_button', 'add_to_cart_button semantix-search-' . esc_attr(sanitize_title($search_query)), $html);
            
            // Add hidden input with search query to form
            $html = str_replace('<a ', '<a data-search-query="' . esc_attr($search_query) . '" ', $html);
        }
    }
    
    return $html;
}

?>