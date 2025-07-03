<?php
/**
 * Plugin Name: Semantix AI Search
 * Description: Automatically replaces WooCommerce and WordPress default search bars with Semantix AI search bar, keeping shortcode and widget features intact.
 * Version: 1.6.12
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
                intervalId = setInterval(changePlaceholder, 3000); // Use dynamic speed
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

// Function to fetch search suggestions from API (this will be overridden by the footer script for latest settings)
// This version is a fallback. The one in wp_footer is preferred.
async function semantix_fetchSuggestions_fallback(query, ulEl){
  const dbNameFallback = "<?php echo esc_js(get_option('semantix_dbname', 'alcohome')); ?>"; // Fallback DB name
  const apiKeyFallback = "<?php echo esc_js(get_option('semantix_api_key', '')); ?>"; // Fallback API key
  const searchHostFallback = "https://dashboard-server-ae00.onrender.com"; // Fallback host
  const autocompletePath = "/autocomplete"; // Autocomplete path

  const url = `${searchHostFallback}${autocompletePath}` +
              `?dbName=${dbNameFallback}&collectionName1=products` + // Assuming default collections
              `&collectionName2=queries&query=${encodeURIComponent(query)}`;

  try{
    const headers = {};
    if(apiKeyFallback) headers['x-api-key'] = apiKeyFallback;
    const res = await fetch(url,{headers: headers});
    if(!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    semantix_displaySuggestions(data, ulEl);
  }catch(err){ console.error('[Semantix Fallback] suggestions error:',err); }
}

// Initialize debounced fetch with fallback (will be updated by footer script)
window.semantix_debouncedFetchSuggestions = window.semantix_debounce(semantix_fetchSuggestions_fallback, 200);


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

    // Process all search bars regardless of how they were added
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

    // Close suggestions when clicking outside
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
// This script block for placeholder initialization might be redundant
// if semantix_auto_replace_search_forms already initializes placeholders correctly.
// Kept for safety for now, but review if it causes double initialization.
document.addEventListener('DOMContentLoaded', function() {
    console.log("Shortcode-like DOMContentLoaded - initializing placeholders if any");

    // This logic assumes this script is directly after the shortcode HTML, which might not always be true
    // if using auto-replace. A more general approach is taken in semantix_auto_replace_search_forms.
    // However, if a shortcode is directly placed, this might still be relevant.

    // Select ALL search bars on the page that might not have been caught by auto-replace.
    const allSearchBars = document.querySelectorAll('.semantix-search-bar:not(.semantix-initialized)');

    allSearchBars.forEach(function(searchBar) {
        if (!searchBar.classList.contains('semantix-initialized')) {
            searchBar.classList.add('semantix-initialized');
            if (typeof window.semantix_changePlaceholder === 'function') {
                // Ensure placeholders and speed are set from global or data attributes
                if (!searchBar.dataset.placeholders) {
                     searchBar.dataset.placeholders = JSON.stringify(window.semantixPlaceholders || []);
                }
                if (!searchBar.dataset.rotationSpeed) {
                    searchBar.dataset.rotationSpeed = window.semantixPlaceholderSpeed || 3000;
                }
                window.semantix_changePlaceholder(searchBar);
            }
        }
    });
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
        'width'           => '350px',
        'height'          => '50px',
        'display_mode'    => 'full',
        'placeholders'    => 'יין אדום צרפתי, פירותי וקליל',
        'placeholder_speed' => 3000, // Added default for placeholder speed
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
    $placeholders_str = sanitize_text_field( $atts['placeholders'] );
    $placeholder_speed = absint($atts['placeholder_speed']);

    $placeholders_arr = array_filter( array_map( 'trim', explode( ',', $placeholders_str ) ) );

    $size_class = '';
    switch ( $size ) {
        case 'small': $size_class = 'semantix-search-small'; break;
        case 'large': $size_class = 'semantix-search-large'; break;
        default: $size_class = 'semantix-search-medium'; break;
    }

    $placeholders_json = wp_json_encode( array_values( $placeholders_arr ) );

    ob_start();
    ?>
    <!-- BEGIN: Semantix AI Search Bar Shortcode -->
    <style>
      /* Ensure the search input border is none globally */
      .semantix-search-bar-container .semantix-search-input {
        border: none !important;
        box-shadow: none !important;
      }
      .semantix-search-bar-container {
        direction: rtl; width: auto; padding: 15px; display: flex;
        justify-content: center; align-items: center; position: relative; box-sizing: border-box;
      }
      .semantix-search-bar {
        display: flex; align-items: center;
        border: 2px solid <?php echo esc_attr( $primary_color ); ?>;
        border-radius: <?php echo esc_attr( $border_radius ); ?>;
        padding: <?php echo esc_attr( $padding ); ?>; background-color: #ffffff;
        width: <?php echo esc_attr( $width ); ?>; height: <?php echo esc_attr( $height ); ?>;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease-in-out;
        z-index: 1001; position: relative;
      }
      .semantix-search-input {
        flex-grow: 1; border: none !important; box-shadow: none !important; height: 30px !important;
        outline: none; font-size: 16px; padding: 8px 0; background-color: transparent !important;
      }
      .semantix-search-button {
        background: white !important; border: none; padding: 5px; cursor: pointer;
        display: flex; align-items: center;
      }
      .semantix-search-icon {
        width: 24px; height: 24px; opacity: 0.7; transition: opacity 0.2s ease-in-out;
      }
      .semantix-search-icon:hover { opacity: 1; }
      .semantix-suggestions-list {
        position: absolute !important; top: 100% !important; left: 0 !important; right: 0 !important;
        background-color: white; border: 1px solid #ddd; border-radius: 4px; width: 100%;
        max-height: 250px; overflow-y: auto; z-index: 1001; display: none; list-style: none;
        padding: 0; margin-top: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .semantix-suggestions-list.show { display: block; }
      .semantix-suggestion-item {
        padding: 12px 16px; display: flex; align-items: center; gap: 12px;
        cursor: pointer; transition: background-color 0.3s;
      }
      .semantix-suggestion-item:hover { background-color: #f0f0f0; }
      .semantix-suggestion-image { width: 40px; height: auto; object-fit: cover; border-radius: 4px; }
      .semantix-suggestion-text { flex: 1; font-size: 16px; font-weight: 600; color: #333; }
      .semantix-suggestion-price { font-size: 12px; color: #100f0f; display: flex; margin-top: 2px; }
      .semantix-text-quotation { font-style: italic; font-size: 12px; color: #777; margin-right: 5px; }
      .semantix-dynamic-placeholder {
        position: absolute; top: 50%; transform: translateY(-50%); font-size: 1rem;
        color: #777; pointer-events: none; transition: opacity 0.5s ease-in-out;
      }
      .semantix-fade-in { opacity: 1; } .semantix-fade-out { opacity: 0; }
      .semantix-search-small .semantix-search-input { font-size: 14px; }
      .semantix-search-large .semantix-search-input { font-size: 18px; }
      @keyframes semantixFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      .semantix-search-bar.show { animation: fadeIn 0.3s ease-in-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 768px) {
        .semantix-dynamic-placeholder { font-size: 0.65rem; }
        .semantix-search-bar-container { padding: 10px; }
        .semantix-search-bar { padding: 8px 16px; }
        .semantix-search-input { font-size: 14px; }
        .semantix-search-icon { width: 20px !important; height: 20px; }
        .semantix-suggestion-text { font-size: 14px; }
        .semantix-toggle-search-icon { width: 30px !important; height: 30px; display: block; margin: 0 auto; }
        .semantix-floating-container .semantix-search-bar { width: 90% !important; max-width: 350px; }
        .semantix-search-button { padding: 8px; }
      }
    </style>

    <div class="semantix-search-bar-container <?php echo esc_attr($size_class); ?>"
         data-display-mode="<?php echo esc_attr($display_mode); ?>"
         data-placeholders='<?php echo esc_attr($placeholders_json); ?>'
         data-rotation-speed="<?php echo esc_attr($placeholder_speed); ?>">

        <img
            src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266"
            alt="חיפוש" class="semantix-toggle-search-icon" onclick="semantix_toggleSearchBar(this)"
            aria-label="Toggle Search Bar" tabindex="0"
            style="display: <?php echo ('icon' === $display_mode) ? 'block' : 'none'; ?>;" />

        <div class="semantix-floating-container" aria-hidden="true" role="dialog" aria-modal="true">
            <div class="semantix-search-bar" role="search" aria-label="Semantix AI Search Bar (Floating)">
                <span class="semantix-dynamic-placeholder"></span>
                <input type="text" class="semantix-search-input" oninput="semantix_handleSearchInput(event)"
                       aria-label="Search Products" placeholder="" value="<?php echo esc_attr(get_search_query()); ?>" />
                <button class="semantix-search-button" onclick="semantix_performSearch(this)" aria-label="Perform Search">
                    <img src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266"
                         alt="חיפוש" class="semantix-search-icon" />
                </button>
                <ul class="semantix-suggestions-list" aria-label="Search Suggestions"></ul>
            </div>
        </div>

        <div class="semantix-search-bar semantix-regular-search-bar" role="search" aria-label="Semantix AI Search Bar (Regular)"
             style="display: <?php echo ('full' === $display_mode) ? 'flex' : 'none'; ?>;">
            <span class="semantix-dynamic-placeholder"></span>
            <input type="text" class="semantix-search-input" oninput="semantix_handleSearchInput(event)"
                   aria-label="Search Products" placeholder="" value="<?php echo esc_attr(get_search_query()); ?>" />
            <button class="semantix-search-button" onclick="semantix_performSearch(this)" aria-label="Perform Search">
                <img src="https://cdn.shopify.com/s/files/1/0911/9701/4333/files/ai-technology.png?v=1735062266"
                     alt="חיפוש" class="semantix-search-icon" />
            </button>
            <ul class="semantix-suggestions-list" aria-label="Search Suggestions"></ul>
        </div>
    </div>
    <?php
    // The inline script for this shortcode instance's placeholder initialization and specific event handlers
    // can be simplified if global functions handle it well.
    // For now, let's ensure it initializes its own placeholder based on its specific attributes if provided.
    ?>
    <script>
    (function(){
        // This IIFE is for shortcode-specific initialization if needed.
        // It ensures that if this shortcode instance has specific placeholders/speed, they are used.
        // The global auto-replace logic should handle general cases.

        // Find the current script tag and its parent container to target this specific search bar instance
        var currentScript = document.currentScript || (function() {
            // Fallback for browsers that don't support document.currentScript (older ones)
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        if (currentScript && currentScript.parentElement && currentScript.parentElement.classList.contains('semantix-search-bar-container')) {
            const searchBarContainer = currentScript.parentElement;
            const searchBarsInContainer = searchBarContainer.querySelectorAll('.semantix-search-bar');

            searchBarsInContainer.forEach(function(searchBar) {
                if (!searchBar.classList.contains('semantix-initialized-by-shortcode')) {
                    searchBar.classList.add('semantix-initialized-by-shortcode'); // Mark as initialized by this specific script

                    // Initialize placeholder using its own data attributes if the global function exists
                    if (typeof window.semantix_changePlaceholder === 'function') {
                        // Data attributes 'data-placeholders' and 'data-rotation-speed' are already on searchBarContainer
                        // The semantix_changePlaceholder function should ideally read these from the searchBar itself or its container.
                        // Let's make sure the searchBar element itself has these data attributes if not inherited.
                        if (!searchBar.dataset.placeholders && searchBarContainer.dataset.placeholders) {
                            searchBar.dataset.placeholders = searchBarContainer.dataset.placeholders;
                        }
                        if (!searchBar.dataset.rotationSpeed && searchBarContainer.dataset.rotationSpeed) {
                             searchBar.dataset.rotationSpeed = searchBarContainer.dataset.rotationSpeed;
                        }
                        window.semantix_changePlaceholder(searchBar);
                    }

                    // Add Enter key listener specifically for inputs in this shortcode instance
                    const searchInputs = searchBar.querySelectorAll('.semantix-search-input');
                    searchInputs.forEach(function(searchInput) {
                        if (!searchInput.dataset.enterKeyListenerAdded) { // Prevent multiple listeners
                            searchInput.addEventListener("keydown", function(event) {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    const currentSearchBar = this.closest('.semantix-search-bar');
                                    const searchButton = currentSearchBar.querySelector('.semantix-search-button');
                                    if (typeof window.semantix_performSearch === 'function' && searchButton) {
                                        window.semantix_performSearch(searchButton);
                                    }
                                }
                            });
                            searchInput.dataset.enterKeyListenerAdded = 'true';
                        }
                    });
                }
            });
        }

        // The general suggestion fetching and display logic is handled by global functions
        // (semantix_handleSearchInput, semantix_fetchSuggestions, semantix_displaySuggestions)
        // defined in the semantix_auto_replace_search_forms script or wp_footer script.
    })();
    </script>
    <!-- END: Semantix AI Search Bar Shortcode -->
    <?php
    $output = ob_get_clean(); // Capture the output
    return apply_filters('semantix_search_bar_output', $output, $atts); // Apply filter and return
}
add_shortcode( 'semantix_search_bar', 'semantix_search_bar_shortcode' );


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
        if ( ! empty( $instance['title'] ) ) {
            echo $args['before_title'] . apply_filters( 'widget_title', $instance['title'] ) . $args['after_title'];
        }

        $shortcode_atts = array();
        if ( ! empty( $instance['size'] ) ) $shortcode_atts['size'] = sanitize_text_field( $instance['size'] );
        if ( ! empty( $instance['primary_color'] ) ) $shortcode_atts['primary_color'] = sanitize_hex_color( $instance['primary_color'] ) ?: '#0073aa';
        if ( ! empty( $instance['secondary_color'] ) ) $shortcode_atts['secondary_color'] = sanitize_hex_color( $instance['secondary_color'] ) ?: '#005177';
        if ( ! empty( $instance['border_radius'] ) ) $shortcode_atts['border_radius'] = sanitize_text_field( $instance['border_radius'] );
        if ( ! empty( $instance['padding'] ) ) $shortcode_atts['padding'] = sanitize_text_field( $instance['padding'] );
        $shortcode_atts['width'] = ! empty( $instance['width'] ) ? sanitize_text_field( $instance['width'] ) : '350px';
        if ( ! empty( $instance['height'] ) ) $shortcode_atts['height'] = sanitize_text_field( $instance['height'] );
        if ( ! empty( $instance['display_mode'] ) && in_array( $instance['display_mode'], array( 'icon', 'full' ), true ) ) $shortcode_atts['display_mode'] = sanitize_text_field( $instance['display_mode'] );
        if ( ! empty( $instance['placeholders'] ) ) {
            $placeholders = implode( ',', array_map( 'trim', explode( "\n", $instance['placeholders'] ) ) );
            $shortcode_atts['placeholders'] = sanitize_text_field( $placeholders );
        }
         if ( ! empty( $instance['placeholder_speed'] ) ) $shortcode_atts['placeholder_speed'] = absint( $instance['placeholder_speed'] );


        $shortcode = '[semantix_search_bar';
        foreach ( $shortcode_atts as $key => $value ) {
            $shortcode .= ' ' . esc_attr( $key ) . '="' . esc_attr( $value ) . '"';
        }
        $shortcode .= ']';
        echo do_shortcode( $shortcode );
        echo $args['after_widget'];
    }

    public function form( $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Search', 'semantix-ai-search' );
        $size = ! empty( $instance['size'] ) ? $instance['size'] : 'medium';
        $primary_color = ! empty( $instance['primary_color'] ) ? $instance['primary_color'] : '#0073aa';
        $secondary_color = ! empty( $instance['secondary_color'] ) ? $instance['secondary_color'] : '#005177';
        $border_radius = ! empty( $instance['border_radius'] ) ? $instance['border_radius'] : '50px';
        $padding = ! empty( $instance['padding'] ) ? $instance['padding'] : '10px 20px';
        $width = ! empty( $instance['width'] ) ? $instance['width'] : '350px';
        $height = ! empty( $instance['height'] ) ? $instance['height'] : '50px';
        $display_mode = ! empty( $instance['display_mode'] ) ? $instance['display_mode'] : 'full';
        $placeholders = ! empty( $instance['placeholders'] ) ? $instance['placeholders'] : "יין אדום צרפתי, פירותי וקליל";
        $placeholder_speed = ! empty( $instance['placeholder_speed'] ) ? $instance['placeholder_speed'] : 3000;
        ?>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php _e( 'Title:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'size' ) ); ?>"><?php _e( 'Size:', 'semantix-ai-search' ); ?></label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'size' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'size' ) ); ?>">
                <option value="small" <?php selected( $size, 'small' ); ?>><?php _e( 'Small', 'semantix-ai-search' ); ?></option>
                <option value="medium" <?php selected( $size, 'medium' ); ?>><?php _e( 'Medium', 'semantix-ai-search' ); ?></option>
                <option value="large" <?php selected( $size, 'large' ); ?>><?php _e( 'Large', 'semantix-ai-search' ); ?></option>
            </select></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'primary_color' ) ); ?>"><?php _e( 'Primary Color:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'primary_color' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'primary_color' ) ); ?>" type="color" value="<?php echo esc_attr( $primary_color ); ?>"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'secondary_color' ) ); ?>"><?php _e( 'Secondary Color:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'secondary_color' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'secondary_color' ) ); ?>" type="color" value="<?php echo esc_attr( $secondary_color ); ?>"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'border_radius' ) ); ?>"><?php _e( 'Border Radius:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'border_radius' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'border_radius' ) ); ?>" type="text" value="<?php echo esc_attr( $border_radius ); ?>" placeholder="e.g., 50px, 10px"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'padding' ) ); ?>"><?php _e( 'Padding:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'padding' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'padding' ) ); ?>" type="text" value="<?php echo esc_attr( $padding ); ?>" placeholder="e.g., 10px 20px"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>"><?php _e( 'Width:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'width' ) ); ?>" type="text" value="<?php echo esc_attr( $width ); ?>" placeholder="e.g., 350px, 500px"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>"><?php _e( 'Height:', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'height' ) ); ?>" type="text" value="<?php echo esc_attr( $height ); ?>" placeholder="e.g., 50px, 40px"></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'display_mode' ) ); ?>"><?php _e( 'Display Mode:', 'semantix-ai-search' ); ?></label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'display_mode' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'display_mode' ) ); ?>">
                <option value="icon" <?php selected( $display_mode, 'icon' ); ?>><?php _e( 'Icon Only', 'semantix-ai-search' ); ?></option>
                <option value="full" <?php selected( $display_mode, 'full' ); ?>><?php _e( 'Full Search Bar', 'semantix-ai-search' ); ?></option>
            </select></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'placeholders' ) ); ?>"><?php _e( 'Dynamic Placeholders (one per line):', 'semantix-ai-search' ); ?></label> <textarea class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'placeholders' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'placeholders' ) ); ?>" rows="3" placeholder="e.g., יין אדום צרפתי..."><?php echo esc_textarea( $placeholders ); ?></textarea></p>
        <p><label for="<?php echo esc_attr( $this->get_field_id( 'placeholder_speed' ) ); ?>"><?php _e( 'Placeholder Speed (ms):', 'semantix-ai-search' ); ?></label> <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'placeholder_speed' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'placeholder_speed' ) ); ?>" type="number" value="<?php echo esc_attr( $placeholder_speed ); ?>" min="1000" step="100"></p>
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
        $instance['width']           = ( ! empty( $new_instance['width'] ) ) ? sanitize_text_field( $new_instance['width'] ) : '350px';
        $instance['height']          = ( ! empty( $new_instance['height'] ) ) ? sanitize_text_field( $new_instance['height'] ) : '50px';
        $instance['display_mode']    = ( ! empty( $new_instance['display_mode'] ) && in_array( $new_instance['display_mode'], array( 'icon', 'full' ), true ) ) ? sanitize_text_field( $new_instance['display_mode'] ) : 'full';
        $instance['placeholders']    = ( ! empty( $new_instance['placeholders'] ) ) ? sanitize_textarea_field( $new_instance['placeholders'] ) : "יין אדום צרפתי, פירותי וקליל";
        $instance['placeholder_speed'] = ( ! empty( $new_instance['placeholder_speed'] ) ) ? absint( $new_instance['placeholder_speed'] ) : 3000;
        return $instance;
    }
}

function semantix_register_custom_search_widget() {
    register_widget( 'Semantix_Custom_Search_Widget' );
}
add_action( 'widgets_init', 'semantix_register_custom_search_widget' );

// remove_filter( 'template_include', 'semantix_custom_search_template', 99 ); // This was the old filter
add_filter( 'template_include', 'semantix_native_search_template', 99 );

function semantix_native_search_template( $template ) {
    if ( is_search() && !is_admin() ) { // Ensure not in admin context
        // Check if the custom template exists in the plugin's 'templates' folder
        $custom_template = plugin_dir_path( __FILE__ ) . 'templates/search-custom.php';
        if ( file_exists( $custom_template ) ) {
            return $custom_template;
        }
    }
    return $template;
}

/**
 * Enqueue scripts for search results page (simplified)
 */
function semantix_enqueue_ajax_script() {
    if (is_search() && !is_admin()) {
        wp_enqueue_script('jquery'); // Ensure jQuery is loaded
    }
}
add_action('wp_enqueue_scripts', 'semantix_enqueue_ajax_script');


// First, remove the old hook if it exists
remove_action( 'plugins_loaded', 'semantix_create_custom_template' ); // Assuming this was an old name
remove_action( 'after_setup_theme', 'semantix_create_custom_template' );  // Assuming this was an old name
// Remove any specific named function like 'semantix_create_native_template' if that was also used before
remove_action( 'activate_' . plugin_basename( __FILE__ ), 'semantix_create_native_template' );


// Add the new enhanced hook

/**
 * AJAX handler to render WooCommerce products natively
 */
add_action('wp_ajax_semantix_render_products', 'semantix_render_products_ajax');
add_action('wp_ajax_nopriv_semantix_render_products', 'semantix_render_products_ajax');



function semantix_render_products_ajax() {
    // Verify nonce for security
    if ( ! isset($_POST['nonce']) || ! wp_verify_nonce( sanitize_text_field(wp_unslash($_POST['nonce'])), 'semantix_nonce' ) ) {
        wp_send_json_error( array('message' => 'Security check failed'), 403 );
        wp_die();
    }

    $product_ids_json = isset($_POST['product_ids']) ? stripslashes($_POST['product_ids']) : '[]';
    $highlight_map_json = isset($_POST['highlight_map']) ? stripslashes($_POST['highlight_map']) : '{}';

    $product_ids_arr   = json_decode( $product_ids_json, true );
    $highlight_map_arr = json_decode( $highlight_map_json, true );

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($product_ids_arr) || !is_array($highlight_map_arr) ) {
        wp_send_json_error(array('message' => 'Invalid product data format.'), 400);
        wp_die();
    }

    if ( empty( $product_ids_arr ) ) {
        ob_start();
        wc_get_template( 'loop/no-products-found.php' );
        echo ob_get_clean();
        wp_die();
    }

    // Filter only published, in-catalog WooCommerce products
    $final_product_ids    = [];
    $highlighted_products_api = []; // Product IDs that should be highlighted based on API

    foreach ( $product_ids_arr as $raw_id ) {
        $pid = intval( $raw_id );
        $product_obj = wc_get_product( $pid );

        if ( $product_obj && $product_obj->is_purchasable() && $product_obj->is_visible() ) {
            $final_product_ids[] = $pid;
            // Check if this product ID should be highlighted
            if ( (isset( $highlight_map_arr[ (string)$raw_id ] ) && $highlight_map_arr[ (string)$raw_id ] === true) ||
                 (isset( $highlight_map_arr[ $raw_id ] ) && $highlight_map_arr[ $raw_id ] === true) ) {
                $highlighted_products_api[] = $pid;
            }
        }
    }

    if ( empty( $final_product_ids ) ) {
        ob_start();
        wc_get_template( 'loop/no-products-found.php' );
        echo ob_get_clean();
        wp_die();
    }

    global $woocommerce_loop;
    $original_woocommerce_loop = $woocommerce_loop; // Store original

    // Setup WooCommerce loop properties - USE THEME DEFAULTS
    wc_setup_loop(array(
        'name'         => 'semantix_native_search',
        'columns'      => wc_get_theme_support( 'product_grid::default_columns', wc_get_default_products_per_row() ),
        'is_shortcode' => false,
        'is_paginated' => false,
        'total'        => count( $final_product_ids ),
        'total_pages'  => 1,
        'per_page'     => count( $final_product_ids ),
        'current_page' => 1,
    ));

    $query_args = array(
        'post_type'      => 'product',
        'post__in'       => $final_product_ids,
        'orderby'        => 'post__in',
        'posts_per_page' => -1,
        'ignore_sticky_posts' => 1,
    );
    $products_query = new WP_Query( $query_args );

    // Start output buffering
    ob_start();

    // MINIMAL CSS - Only for AI labels, let WooCommerce handle everything else
    if (!empty($highlighted_products_api)) {
        echo '<style>';
        foreach ($highlighted_products_api as $highlighted_id) {
            echo '.post-' . $highlighted_id . ' { position: relative; margin-bottom: 35px; }';
            echo '.post-' . $highlighted_id . '::before { ';
            echo 'content: "🤖 AI PERFECT MATCH"; ';
            echo 'position: absolute; top: -35px; left: 50%; transform: translateX(-50%); ';
            echo 'background: #000; color: #fff; padding: 6px 12px; border-radius: 12px; ';
            echo 'font-size: 0.7rem; font-weight: bold; text-transform: uppercase; ';
            echo 'z-index: 15; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 1px solid #333; ';
            echo 'white-space: nowrap; min-width: 120px; text-align: center; }';
        }
        echo '</style>';
    }

    // Use NATIVE WooCommerce container - no custom wrapper
    echo '<div class="semantix-ajax-results-container">';

    if ( $products_query->have_posts() ) {
        // This will output native WooCommerce product loop with theme styling
        woocommerce_product_loop_start();

        while ( $products_query->have_posts() ) {
            $products_query->the_post();
            $current_product_id = get_the_ID();
            $is_highlighted = in_array( $current_product_id, $highlighted_products_api, true );

            // MINIMAL highlighting - just add a class for the CSS above
            if ($is_highlighted) {
                add_filter('woocommerce_post_class', function($classes) {
                    $classes[] = 'semantix-highlighted-product';
                    $classes[] = 'semantix-perfect-match';
                    return $classes;
                });
            }

            // Use WooCommerce's NATIVE product template (theme will style it)
            wc_get_template_part( 'content', 'product' );

            // Remove the filter after use
            if ($is_highlighted) {
                remove_all_filters('woocommerce_post_class');
            }
        }
        
        woocommerce_product_loop_end();
    } else {
        echo '<div class="semantix-no-products">';
        wc_get_template( 'loop/no-products-found.php' );
        echo '</div>';
    }

    echo '</div>'; // End container
    
    wp_reset_postdata();
    $woocommerce_loop = $original_woocommerce_loop; // Restore original
    wc_reset_loop(); // Reset WC loop props

    // Output the buffered content and clean buffer
    $output = ob_get_clean();
    echo $output;
    wp_die();
}

/**
 * Try to render product using Elementor template
 * Returns rendered content or false if no Elementor template available
 */
function semantix_render_elementor_product_content( $product_id ) {
    // Check if Elementor is active
    if ( ! class_exists( '\Elementor\Plugin' ) ) {
        return false;
    }

    // Method 1: Check for Elementor Pro WooCommerce templates
    if ( class_exists( '\ElementorPro\Modules\Woocommerce\Module' ) ) {
        $elementor_template_id = semantix_get_elementor_wc_template( 'product-archive' );
        
        if ( $elementor_template_id ) {
            return semantix_render_elementor_template( $elementor_template_id, $product_id );
        }
    }

    // Method 2: Check for custom Elementor product templates
    $custom_template_id = get_post_meta( $product_id, '_elementor_template_id', true );
    if ( $custom_template_id ) {
        return semantix_render_elementor_template( $custom_template_id, $product_id );
    }

    // Method 3: Check for theme's Elementor product template
    $theme_template_id = semantix_get_theme_elementor_product_template();
    if ( $theme_template_id ) {
        return semantix_render_elementor_template( $theme_template_id, $product_id );
    }

    // Method 4: Look for any Elementor template tagged for products
    $template_id = semantix_find_elementor_product_template();
    if ( $template_id ) {
        return semantix_render_elementor_template( $template_id, $product_id );
    }

    return false; // No Elementor template found
}

/**
 * Get Elementor WooCommerce template ID
 */
function semantix_get_elementor_wc_template( $template_type ) {
    if ( ! class_exists( '\ElementorPro\Modules\ThemeBuilder\Module' ) ) {
        return false;
    }

    $template_id = \ElementorPro\Modules\ThemeBuilder\Module::instance()
        ->get_conditions_manager()
        ->get_documents_for_location( $template_type );

    return $template_id ? $template_id[0] : false;
}

/**
 * Look for theme's Elementor product template
 */
function semantix_get_theme_elementor_product_template() {
    // Look for common Elementor template names
    $template_names = [
        'elementor-product-template',
        'product-template-elementor',
        'wc-product-elementor'
    ];

    foreach ( $template_names as $template_name ) {
        $template = get_page_by_path( $template_name, OBJECT, 'elementor_library' );
        if ( $template ) {
            return $template->ID;
        }
    }

    return false;
}

/**
 * Find any Elementor template that might be used for products
 */
function semantix_find_elementor_product_template() {
    $args = array(
        'post_type' => 'elementor_library',
        'meta_query' => array(
            array(
                'key' => '_elementor_template_type',
                'value' => array( 'loop-item', 'single-product', 'archive-product' ),
                'compare' => 'IN'
            )
        ),
        'posts_per_page' => 1
    );

    $templates = get_posts( $args );
    return $templates ? $templates[0]->ID : false;
}

/**
 * Render Elementor template for specific product
 */
function semantix_render_elementor_template( $template_id, $product_id ) {
    if ( ! class_exists( '\Elementor\Plugin' ) ) {
        return false;
    }

    try {
        // Set up global product data
        global $product;
        $product = wc_get_product( $product_id );
        
        if ( ! $product ) {
            return false;
        }

        // Start output buffering
        ob_start();

        // Get Elementor frontend instance
        $elementor = \Elementor\Plugin::$instance->frontend;

        // Render the template
        echo $elementor->get_builder_content_for_display( $template_id );

        // Get the rendered content
        $content = ob_get_clean();

        // Reset global product
        $product = null;

        return $content;

    } catch ( Exception $e ) {
        // Log error and return false
        error_log( 'Semantix Elementor rendering error: ' . $e->getMessage() );
        return false;
    }
}

/**
 * Enhanced version that also tries to detect Elementor styling
 */
function semantix_get_elementor_product_styles( $template_id ) {
    if ( ! $template_id || ! class_exists( '\Elementor\Plugin' ) ) {
        return '';
    }

    try {
        // Get Elementor CSS for the template
        $css_file = new \Elementor\Core\Files\CSS\Post( $template_id );
        return $css_file->get_content();
    } catch ( Exception $e ) {
        return '';
    }
}

/**
 * Add custom styles for highlighted products
 */
// remove_action( 'wp_head', 'semantix_add_highlight_styles' ); // Remove old one if it existed

/**
 * Ensure WooCommerce scripts and styles are loaded on search pages
 */
function semantix_ensure_woocommerce_assets() {
    if ( is_search() && class_exists( 'WooCommerce' ) && !is_admin() ) {
        wp_enqueue_script( 'wc-add-to-cart' );
        wp_enqueue_script( 'woocommerce' );
        if (function_exists('wc_enqueue_js')) { // Newer WC versions
            wc_enqueue_js( "
                // Any specific JS needed for WC compatibility on search results
                jQuery( function( $ ) {
                    // Example: Re-initialize variation forms if loaded via AJAX
                    // $( document.body ).on( 'semantix_results_loaded', function() { // Custom event
                    //     $( '.variations_form' ).each( function() {
                    //         $( this ).wc_variation_form();
                    //     });
                    // });
                });
            " );
        }

        wp_enqueue_style( 'woocommerce-layout' );
        wp_enqueue_style( 'woocommerce-smallscreen' );
        wp_enqueue_style( 'woocommerce-general' );
    }
}
add_action( 'wp_enqueue_scripts', 'semantix_ensure_woocommerce_assets' );

// --- Admin Panel and Other Plugin Functionality ---
// (All your existing admin panel code, widget registration, shortcode attribute filters,
//  tracking functions, etc., should be here, unchanged from your original file)

add_action('admin_menu', 'semantix_add_admin_menu');
add_action('admin_enqueue_scripts', 'semantix_admin_enqueue_scripts',20);

/**
 * Add menu item
 */
function semantix_add_admin_menu() {
    add_menu_page(
        __('Semantix AI Search', 'semantix-ai-search'),
        __('Semantix Search', 'semantix-ai-search'),
        'manage_options',
        'semantix-ai-search',
        'semantix_admin_page',
        'dashicons-search',
        58
    );
    add_submenu_page('semantix-ai-search', __('Dashboard', 'semantix-ai-search'), __('Dashboard', 'semantix-ai-search'), 'manage_options', 'semantix-ai-search', 'semantix_admin_page');
    add_submenu_page('semantix-ai-search', __('Search Bar Customization', 'semantix-ai-search'), __('Customization', 'semantix-ai-search'), 'manage_options', 'semantix-search-customization', 'semantix_search_customization_page');
    add_submenu_page('semantix-ai-search', __('Placeholders', 'semantix-ai-search'), __('Placeholders', 'semantix-ai-search'), 'manage_options', 'semantix-search-placeholders', 'semantix_search_placeholders_page');
    add_submenu_page('semantix-ai-search', __('Advanced Settings', 'semantix-ai-search'), __('Advanced Settings', 'semantix-ai-search'), 'manage_options', 'semantix-search-advanced', 'semantix_search_advanced_page');
}

function semantix_admin_enqueue_scripts($hook) {
    if (strpos($hook, 'semantix-') === false) return;
    if ( class_exists( 'WooCommerce' ) ) wp_enqueue_style( 'woocommerce_admin_styles', WC()->plugin_url() . '/assets/css/admin.css', array(), WC_VERSION );
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');
    wp_enqueue_style('semantix-admin-style', plugin_dir_url( __FILE__ ) . 'assets/css/admin.css', array( 'woocommerce_admin_styles' ), '1.0.0');
    wp_enqueue_script('semantix-admin-script', plugin_dir_url(__FILE__) . 'assets/js/admin.js', array('jquery', 'wp-color-picker'), '1.0.0', true);
}

function semantix_admin_page() {
    $total_searches = get_option('semantix_total_searches', 0);
    $popular_searches = get_option('semantix_popular_searches', array());
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Semantix AI Search Dashboard', 'semantix-ai-search'); ?></h1>
        <div class="semantix-dashboard-welcome"><div class="semantix-welcome-panel">
            <h2><?php echo esc_html__('Welcome to Semantix AI Search', 'semantix-ai-search'); ?></h2>
            <p class="about-description"><?php echo esc_html__('Enhance your site\'s search experience with AI-powered search that understands what your customers are looking for.', 'semantix-ai-search'); ?></p>
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
                        <ul><?php foreach ($popular_searches as $search => $count) : ?><li><?php echo esc_html($search); ?> (<?php echo esc_html($count); ?>)</li><?php endforeach; ?></ul>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
            </div>
        </div></div>
        <div class="semantix-admin-boxes">
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Live Preview', 'semantix-ai-search'); ?></h2>
                <div class="semantix-preview-container"><?php echo do_shortcode('[semantix_search_bar]'); ?></div>
            </div>
            <div class="semantix-admin-box">
                <h2><?php echo esc_html__('Quick Settings', 'semantix-ai-search'); ?></h2>
                <form method="post" action="options.php">
                    <?php settings_fields('semantix_quick_settings'); do_settings_sections('semantix_quick_settings');
                    $primary_color = get_option('semantix_primary_color', '#0073aa'); $border_radius = get_option('semantix_border_radius', '50px'); $display_mode = get_option('semantix_display_mode', 'full'); ?>
                    <table class="form-table">
                        <tr valign="top"><th scope="row"><?php echo esc_html__('Primary Color', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_primary_color" value="<?php echo esc_attr($primary_color); ?>" class="semantix-color-picker" /></td></tr>
                        <tr valign="top"><th scope="row"><?php echo esc_html__('Border Radius', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_border_radius" value="<?php echo esc_attr($border_radius); ?>" /><p class="description"><?php echo esc_html__('Example: 50px, 10px, 0', 'semantix-ai-search'); ?></p></td></tr>
                        <tr valign="top"><th scope="row"><?php echo esc_html__('Display Mode', 'semantix-ai-search'); ?></th><td>
                            <select name="semantix_display_mode">
                                <option value="full" <?php selected($display_mode, 'full'); ?>><?php echo esc_html__('Full Search Bar', 'semantix-ai-search'); ?></option>
                                <option value="icon" <?php selected($display_mode, 'icon'); ?>><?php echo esc_html__('Icon Only', 'semantix-ai-search'); ?></option>
                            </select></td></tr>
                    </table>
                    <?php submit_button(__('Save Quick Settings', 'semantix-ai-search')); ?>
                </form>
            </div>
        </div>
    </div>
    <?php
}

function semantix_search_customization_page() {
    if (isset($_POST['semantix_save_customization'])) {
        update_option('semantix_primary_color', sanitize_hex_color($_POST['semantix_primary_color']) ?: '#0073aa');
        update_option('semantix_secondary_color', sanitize_hex_color($_POST['semantix_secondary_color']) ?: '#005177');
        update_option('semantix_border_radius', sanitize_text_field($_POST['semantix_border_radius']));
        update_option('semantix_padding', sanitize_text_field($_POST['semantix_padding']));
        update_option('semantix_width', sanitize_text_field($_POST['semantix_width']));
        update_option('semantix_height', sanitize_text_field($_POST['semantix_height']));
        update_option('semantix_display_mode', in_array($_POST['semantix_display_mode'], array('icon', 'full'), true) ? $_POST['semantix_display_mode'] : 'full');
        update_option('semantix_size', in_array($_POST['semantix_size'], array('small', 'medium', 'large'), true) ? $_POST['semantix_size'] : 'medium');
        update_option( 'semantix_api_key', isset( $_POST['semantix_api_key'] ) ? sanitize_text_field( $_POST['semantix_api_key'] ) : '' ); // Keep this separate if needed
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Customization settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    $primary_color = get_option('semantix_primary_color', '#0073aa'); $secondary_color = get_option('semantix_secondary_color', '#005177'); $border_radius = get_option('semantix_border_radius', '50px'); $padding = get_option('semantix_padding', '10px 20px'); $width = get_option('semantix_width', '350px'); $height = get_option('semantix_height', '50px'); $display_mode = get_option('semantix_display_mode', 'full'); $size = get_option('semantix_size', 'medium');
    ?>
    <div class="wrap woocommerce semantix-admin-wrap">
        <h1><?php echo esc_html__('Search Bar Customization', 'semantix-ai-search'); ?></h1>
        <div class="semantix-admin-columns">
            <div class="semantix-admin-main"><form method="post" action="">
                <div class="semantix-admin-box"><h2><?php echo esc_html__('Appearance Settings', 'semantix-ai-search'); ?></h2><table class="form-table">
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Search Bar Size', 'semantix-ai-search'); ?></th><td><select name="semantix_size" id="semantix_size"><option value="small" <?php selected($size, 'small'); ?>><?php echo esc_html__('Small', 'semantix-ai-search'); ?></option><option value="medium" <?php selected($size, 'medium'); ?>><?php echo esc_html__('Medium', 'semantix-ai-search'); ?></option><option value="large" <?php selected($size, 'large'); ?>><?php echo esc_html__('Large', 'semantix-ai-search'); ?></option></select></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Display Mode', 'semantix-ai-search'); ?></th><td><select name="semantix_display_mode" id="semantix_display_mode"><option value="full" <?php selected($display_mode, 'full'); ?>><?php echo esc_html__('Full Search Bar', 'semantix-ai-search'); ?></option><option value="icon" <?php selected($display_mode, 'icon'); ?>><?php echo esc_html__('Icon Only', 'semantix-ai-search'); ?></option></select><p class="description"><?php echo esc_html__('Full shows the complete search bar, Icon shows only an icon that expands. Note: On narrow containers, icon mode may be used automatically.', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Primary Color', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_primary_color" value="<?php echo esc_attr($primary_color); ?>" class="semantix-color-picker" /><p class="description"><?php echo esc_html__('Main color for borders and interactive elements', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Secondary Color', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_secondary_color" value="<?php echo esc_attr($secondary_color); ?>" class="semantix-color-picker" /><p class="description"><?php echo esc_html__('Secondary color for accents and hover states', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Border Radius', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_border_radius" value="<?php echo esc_attr($border_radius); ?>" /><p class="description"><?php echo esc_html__('Example: 50px for rounded, 4px for slightly rounded, 0 for square', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Padding', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_padding" value="<?php echo esc_attr($padding); ?>" /><p class="description"><?php echo esc_html__('Internal spacing. Example: 10px 20px (vertical horizontal)', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Width', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_width" value="<?php echo esc_attr($width); ?>" /><p class="description"><?php echo esc_html__('Width of search bar. Example: 350px, 500px, 100%', 'semantix-ai-search'); ?></p></td></tr>
                    <tr valign="top"><th scope="row"><?php echo esc_html__('Height', 'semantix-ai-search'); ?></th><td><input type="text" name="semantix_height" value="<?php echo esc_attr($height); ?>" /><p class="description"><?php echo esc_html__('Height of search bar. Example: 50px, 60px', 'semantix-ai-search'); ?></p></td></tr>
                </table></div>
                <p class="submit"><input type="submit" name="semantix_save_customization" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Changes', 'semantix-ai-search'); ?>" /></p>
            </form></div>
            <div class="semantix-admin-sidebar">
                <div class="semantix-admin-box"><h2><?php echo esc_html__('Live Preview', 'semantix-ai-search'); ?></h2><div class="semantix-preview-container" id="semantix_preview_container"><?php echo do_shortcode(sprintf('[semantix_search_bar size="%s" primary_color="%s" secondary_color="%s" border_radius="%s" padding="%s" width="%s" height="%s" display_mode="%s"]',esc_attr($size),esc_attr($primary_color),esc_attr($secondary_color),esc_attr($border_radius),esc_attr($padding),esc_attr($width),esc_attr($height),esc_attr($display_mode))); ?></div><p class="description"><?php echo esc_html__('This preview updates when you save changes', 'semantix-ai-search'); ?></p></div>
                <div class="semantix-admin-box"><h2><?php echo esc_html__('Shortcode Generator', 'semantix-ai-search'); ?></h2><div class="semantix-shortcode-generator"><p><?php echo esc_html__('Use this shortcode to add the search bar to any content:', 'semantix-ai-search'); ?></p><code id="semantix_generated_shortcode">[semantix_search_bar size="<?php echo esc_attr($size); ?>" primary_color="<?php echo esc_attr($primary_color); ?>" border_radius="<?php echo esc_attr($border_radius); ?>" display_mode="<?php echo esc_attr($display_mode); ?>"]</code><button type="button" class="button" id="semantix_copy_shortcode"><?php echo esc_html__('Copy Shortcode', 'semantix-ai-search'); ?></button></div></div>
            </div>
        </div>
    </div>
    <script>jQuery(document).ready(function($){$('.semantix-color-picker').wpColorPicker({change:function(event,ui){updateShortcodePreview();}});$('#semantix_copy_shortcode').on('click',function(){var tempInput=$('<input>');$('body').append(tempInput);tempInput.val($('#semantix_generated_shortcode').text()).select();document.execCommand('copy');tempInput.remove();var originalText=$(this).text();$(this).text('<?php echo esc_js(__('Copied!', 'semantix-ai-search')); ?>');setTimeout(function(){$('#semantix_copy_shortcode').text(originalText);},2000);});function updateShortcodePreview(){var size=$('#semantix_size').val();var displayMode=$('#semantix_display_mode').val();var primaryColor=$('input[name="semantix_primary_color"]').val(); var borderRadius=$('input[name="semantix_border_radius"]').val();var shortcode='[semantix_search_bar size="'+size+'" primary_color="'+primaryColor+'" border_radius="'+borderRadius+'" display_mode="'+displayMode+'"]';$('#semantix_generated_shortcode').text(shortcode);} $('#semantix_size, #semantix_display_mode, input[name="semantix_border_radius"], input[name="semantix_primary_color"]').on('input change', updateShortcodePreview); updateShortcodePreview(); });</script>
    <?php
}

function semantix_search_placeholders_page() {
    if (isset($_POST['semantix_save_placeholders'])) {
        update_option('semantix_placeholders', isset($_POST['semantix_placeholders']) ? sanitize_textarea_field($_POST['semantix_placeholders']) : '');
        update_option('semantix_placeholder_speed', isset($_POST['semantix_placeholder_speed']) ? absint($_POST['semantix_placeholder_speed']) : 3000);
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Placeholder settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    $placeholders = get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל, יין לבן מרענן'); $placeholder_speed = get_option('semantix_placeholder_speed', 3000);
    ?>
    <div class="wrap woocommerce semantix-admin-wrap"><h1><?php echo esc_html__('Search Placeholders', 'semantix-ai-search'); ?></h1>
        <form method="post" action=""><div class="semantix-admin-box"><h2><?php echo esc_html__('Dynamic Placeholders', 'semantix-ai-search'); ?></h2><p><?php echo esc_html__('Add search suggestions that will rotate in the search bar placeholder. Each line will be displayed as a separate placeholder.', 'semantix-ai-search'); ?></p>
            <table class="form-table">
                <tr valign="top"><th scope="row"><?php echo esc_html__('Placeholder Suggestions', 'semantix-ai-search'); ?></th><td><textarea name="semantix_placeholders" rows="10" cols="50" class="large-text"><?php echo esc_textarea($placeholders); ?></textarea><p class="description"><?php echo esc_html__('Enter each placeholder text on a new line. These will rotate automatically.', 'semantix-ai-search'); ?></p></td></tr>
                <tr valign="top"><th scope="row"><?php echo esc_html__('Rotation Speed', 'semantix-ai-search'); ?></th><td><input type="number" name="semantix_placeholder_speed" value="<?php echo esc_attr($placeholder_speed); ?>" min="1000" step="500" /><p class="description"><?php echo esc_html__('Time in milliseconds between placeholder changes (1000 = 1 second)', 'semantix-ai-search'); ?></p></td></tr>
            </table></div>
            <div class="semantix-admin-box"><h2><?php echo esc_html__('Placeholder Preview', 'semantix-ai-search'); ?></h2><div class="semantix-preview-container"><?php $placeholder_lines = explode("\n", $placeholders); $placeholder_lines = array_map('trim', $placeholder_lines); $placeholder_list = implode(', ', $placeholder_lines); echo do_shortcode('[semantix_search_bar placeholders="' . esc_attr($placeholder_list) . '" placeholder_speed="' . esc_attr($placeholder_speed) . '"]'); ?></div><p class="description"><?php echo esc_html__('This preview shows how your placeholders will appear.', 'semantix-ai-search'); ?></p></div>
            <p class="submit"><input type="submit" name="semantix_save_placeholders" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Changes', 'semantix-ai-search'); ?>" /></p>
        </form>
    </div>
    <?php
}

function semantix_search_advanced_page() {
    if (isset($_POST['semantix_save_advanced'])) {
        update_option('semantix_enable_auto_replace', isset($_POST['semantix_enable_auto_replace']) ? 1 : 0);
        update_option('semantix_custom_selectors', isset($_POST['semantix_custom_selectors']) ? sanitize_textarea_field($_POST['semantix_custom_selectors']) : '');
        update_option('semantix_api_key', isset($_POST['semantix_api_key']) ? sanitize_text_field($_POST['semantix_api_key']) : '');
        update_option('semantix_api_endpoint', isset($_POST['semantix_api_endpoint']) ? esc_url_raw($_POST['semantix_api_endpoint']) : '');
        update_option('semantix_dbname', isset($_POST['semantix_dbname']) ? sanitize_text_field($_POST['semantix_dbname']) : 'dizzy');
        update_option('semantix_collection1', isset($_POST['semantix_collection1']) ? sanitize_text_field($_POST['semantix_collection1']) : 'products');
        update_option('semantix_collection2', isset($_POST['semantix_collection2']) ? sanitize_text_field($_POST['semantix_collection2']) : 'queries');
        update_option('semantix_custom_css', isset($_POST['semantix_custom_css']) ? sanitize_textarea_field($_POST['semantix_custom_css']) : '');
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Advanced settings saved successfully!', 'semantix-ai-search') . '</p></div>';
    }
    $enable_auto_replace = get_option('semantix_enable_auto_replace', 1); $api_endpoint = get_option('semantix_api_endpoint', 'https://dashboard-server-ae00.onrender.com/autocomplete'); $custom_selectors = get_option('semantix_custom_selectors', ''); $dbname = get_option('semantix_dbname', 'alcohome'); $collection1 = get_option('semantix_collection1', 'products'); $collection2 = get_option('semantix_collection2', 'queries'); $custom_css = get_option('semantix_custom_css', ''); $api_key = get_option('semantix_api_key', '');
    ?>
    <div class="wrap woocommerce semantix-admin-wrap"><h1><?php echo esc_html__('Advanced Settings', 'semantix-ai-search'); ?></h1>
        <form method="post" action=""><div class="semantix-admin-box"><h2><?php echo esc_html__('Search Integration', 'semantix-ai-search'); ?></h2><table class="form-table">
            <tr valign="top"><th scope="row"><?php echo esc_html__('Auto-Replace WordPress & WooCommerce Search', 'semantix-ai-search'); ?></th><td><label><input type="checkbox" name="semantix_enable_auto_replace" value="1" <?php checked($enable_auto_replace, 1); ?> /> <?php echo esc_html__('Automatically replace default search forms', 'semantix-ai-search'); ?></label><p class="description"><?php echo esc_html__('When enabled, standard WordPress and WooCommerce search forms will be replaced.', 'semantix-ai-search'); ?></p></td></tr>
            <tr valign="top"><th scope="row"><?php echo esc_html__('Custom CSS Selectors for Replacement', 'semantix-ai-search'); ?></th><td><textarea name="semantix_custom_selectors" rows="6" cols="70" class="large-text code" placeholder=".header-search, #search-form"><?php echo esc_textarea($custom_selectors); ?></textarea><p class="description"><?php echo esc_html__('Add custom CSS selectors (comma or newline separated) to replace with Semantix search.', 'semantix-ai-search'); ?></p></td></tr>
        </table></div>
        <div class="semantix-admin-box"><h2><?php echo esc_html__('API Configuration', 'semantix-ai-search'); ?></h2><table class="form-table">
            <tr valign="top"><th scope="row"><?php esc_html_e( 'API Key', 'semantix-ai-search' ); ?></th><td><input type="text" name="semantix_api_key" value="<?php echo esc_attr( $api_key ); ?>" class="regular-text" placeholder="Paste your Semantix API key here"/><p class="description"><?php esc_html_e( 'API Key from your Semantix dashboard for autocomplete and search.', 'semantix-ai-search' ); ?></p></td></tr>
            <tr valign="top"><th scope="row"><?php echo esc_html__('API Endpoint URL (Autocomplete)', 'semantix-ai-search'); ?></th><td><input type="url" name="semantix_api_endpoint" value="<?php echo esc_attr($api_endpoint); ?>" class="regular-text" /><p class="description"><?php echo esc_html__('Base URL for Semantix API, typically ending in /autocomplete for suggestions. The search results page template will attempt to derive the search endpoint from this.', 'semantix-ai-search'); ?></p></td></tr>
            <tr valign="top"><th scope="row"><?php echo esc_html__('Database Parameters', 'semantix-ai-search'); ?></th><td>
                <div class="semantix-field-group"><label><?php echo esc_html__('Database Name (dbName):', 'semantix-ai-search'); ?> <input type="text" name="semantix_dbname" value="<?php echo esc_attr($dbname); ?>" /></label></div>
                <div class="semantix-field-group"><label><?php echo esc_html__('Collection Name 1 (e.g., products):', 'semantix-ai-search'); ?> <input type="text" name="semantix_collection1" value="<?php echo esc_attr($collection1); ?>" /></label></div>
                <div class="semantix-field-group"><label><?php echo esc_html__('Collection Name 2 (e.g., queries):', 'semantix-ai-search'); ?> <input type="text" name="semantix_collection2" value="<?php echo esc_attr($collection2); ?>" /></label></div>
                <p class="description"><?php echo esc_html__('These parameters are used in API calls.', 'semantix-ai-search'); ?></p>
            </td></tr>
        </table></div>
        <div class="semantix-admin-box"><h2><?php echo esc_html__('Custom CSS', 'semantix-ai-search'); ?></h2><table class="form-table">
            <tr valign="top"><th scope="row"><?php echo esc_html__('Additional CSS', 'semantix-ai-search'); ?></th><td><textarea name="semantix_custom_css" rows="10" cols="50" class="large-text code"><?php echo esc_textarea($custom_css); ?></textarea><p class="description"><?php echo esc_html__('Add custom CSS to further customize search bar appearance.', 'semantix-ai-search'); ?></p></td></tr>
        </table></div>
        <p class="submit"><input type="submit" name="semantix_save_advanced" class="button-primary woocommerce-save-button" value="<?php esc_attr_e('Save Advanced Settings', 'semantix-ai-search'); ?>" /></p>
        </form>
    </div>
    <?php
}

function semantix_register_settings() {
    register_setting('semantix_quick_settings', 'semantix_primary_color'); register_setting('semantix_quick_settings', 'semantix_border_radius'); register_setting('semantix_quick_settings', 'semantix_display_mode');
    register_setting('semantix_settings', 'semantix_primary_color'); register_setting('semantix_settings', 'semantix_secondary_color'); register_setting('semantix_settings', 'semantix_border_radius'); register_setting('semantix_settings', 'semantix_padding'); register_setting('semantix_settings', 'semantix_width'); register_setting('semantix_settings', 'semantix_height'); register_setting('semantix_settings', 'semantix_display_mode'); register_setting('semantix_settings', 'semantix_size');
    register_setting('semantix_settings', 'semantix_placeholders'); register_setting('semantix_settings', 'semantix_placeholder_speed');
    register_setting('semantix_settings', 'semantix_enable_auto_replace'); register_setting('semantix_settings', 'semantix_custom_selectors'); register_setting( 'semantix_settings', 'semantix_api_key' ); register_setting('semantix_settings', 'semantix_api_endpoint'); register_setting('semantix_settings', 'semantix_dbname'); register_setting('semantix_settings', 'semantix_collection1'); register_setting('semantix_settings', 'semantix_collection2'); register_setting('semantix_settings', 'semantix_custom_css');
}
add_action('admin_init', 'semantix_register_settings');

function semantix_create_assets() {
    $assets_dir = plugin_dir_path(__FILE__) . 'assets'; $css_dir = $assets_dir . '/css'; $js_dir = $assets_dir . '/js';
    if (!file_exists($assets_dir)) wp_mkdir_p($assets_dir); if (!file_exists($css_dir)) wp_mkdir_p($css_dir); if (!file_exists($js_dir)) wp_mkdir_p($js_dir);
    $css_file = $css_dir . '/admin.css'; if (!file_exists($css_file)) file_put_contents($css_file, "/* Semantix Admin Styles */ .semantix-admin-wrap { margin: 20px 20px 0 0; } .semantix-admin-box { background: #fff; border: 1px solid #c3c4c7; box-shadow: 0 1px 1px rgba(0,0,0,.04); margin-bottom: 20px; padding: 15px; } .semantix-admin-box h2 {border-bottom: 1px solid #eee; margin:0 0 15px; padding-bottom:10px; font-size:14px;} .semantix-preview-container { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin-bottom: 15px; border-radius: 4px; } /* More styles in original */");
    $js_file = $js_dir . '/admin.js'; if (!file_exists($js_file)) file_put_contents($js_file, "jQuery(document).ready(function($){ if($.fn.wpColorPicker){ $('.semantix-color-picker').wpColorPicker();} $('#semantix_copy_shortcode').on('click', function(){ /* copy logic */ }); });");
}
register_activation_hook(__FILE__, 'semantix_create_assets');

function semantix_settings_link($links) {
    array_unshift($links, '<a href="admin.php?page=semantix-ai-search">' . __('Settings', 'semantix-ai-search') . '</a>');
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'semantix_settings_link');

function semantix_add_custom_css() {
    $custom_css = get_option('semantix_custom_css');
    if (!empty($custom_css)) echo '<style type="text/css">' . wp_strip_all_tags( $custom_css ) . '</style>'; // Sanitize
}
add_action('wp_head', 'semantix_add_custom_css');

add_action( 'wp_footer', function () {
    $api_endpoint = esc_js( get_option( 'semantix_api_endpoint', 'https://dashboard-server-ae00.onrender.com/autocomplete' ) );
    $dbname       = esc_js( get_option( 'semantix_dbname',       'alcohome' ) ); // Default from your settings
    $c1           = esc_js( get_option( 'semantix_collection1',  'products' ) );
    $c2           = esc_js( get_option( 'semantix_collection2',  'queries' ) );
    $api_key      = esc_js( get_option( 'semantix_api_key',      '' ) );
?>
<script>
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.semantix_fetchSuggestions === 'function' || typeof window.semantix_fetchSuggestions_fallback === 'function') { // Check if either exists
    const currentApiEndpoint = "<?php echo $api_endpoint; ?>";
    const currentApiKey  = "<?php echo $api_key; ?>";
    const currentDbName = "<?php echo $dbname; ?>";
    const currentC1 = "<?php echo $c1; ?>";
    const currentC2 = "<?php echo $c2; ?>";

    // This overrides any previously defined semantix_fetchSuggestions
    window.semantix_fetchSuggestions = async (query, listEl) => {
      try {
        const url = new URL(currentApiEndpoint);
        url.searchParams.set('query', query);
        url.searchParams.set('dbName', currentDbName); // Add dbName
        url.searchParams.set('collectionName1', currentC1); // Add collection1
        url.searchParams.set('collectionName2', currentC2); // Add collection2

        const headers = {};
        if (currentApiKey) { headers['x-api-key'] = currentApiKey; }

        const res = await fetch(url.toString(), { headers });
        if (!res.ok) throw new Error('API response not OK: ' + res.status);
        const data = await res.json();
        if (typeof window.semantix_displaySuggestions === 'function') {
            window.semantix_displaySuggestions(data, listEl);
        }
      } catch (err) {
        console.warn('[Semantix] Autocomplete fetch failed:', err);
      }
    };

    if (typeof window.semantix_debounce === 'function') {
        window.semantix_debouncedFetchSuggestions =
            window.semantix_debounce(window.semantix_fetchSuggestions, 200);
    }
    console.log('[Semantix] Autocomplete fetch function updated with latest settings.');
  }
});
</script>
<?php
}, 99 );

function semantix_track_search_query() {
    if (is_search() && get_search_query() && !is_admin()) {
        $query = get_search_query();
        $total_searches = get_option('semantix_total_searches', 0);
        $popular_searches = get_option('semantix_popular_searches', array());
        $total_searches++;
        if (isset($popular_searches[$query])) $popular_searches[$query]++; else $popular_searches[$query] = 1;
        arsort($popular_searches);
        if (count($popular_searches) > 20) $popular_searches = array_slice($popular_searches, 0, 20, true);
        update_option('semantix_total_searches', $total_searches);
        update_option('semantix_popular_searches', $popular_searches);
    }
}
add_action('template_redirect', 'semantix_track_search_query');

function semantix_modify_shortcode_defaults($atts) {
    $defaults = array(
        'primary_color'   => get_option('semantix_primary_color', '#0073aa'),
        'secondary_color' => get_option('semantix_secondary_color', '#005177'),
        'border_radius'   => get_option('semantix_border_radius', '50px'),
        'padding'         => get_option('semantix_padding', '10px 20px'),
        'width'           => get_option('semantix_width', '350px'),
        'height'          => get_option('semantix_height', '50px'),
        'display_mode'    => get_option('semantix_display_mode', 'full'),
        'size'            => get_option('semantix_size', 'medium'),
        'placeholders'    => get_option('semantix_placeholders', 'יין אדום צרפתי, פירותי וקליל'),
        'placeholder_speed' => get_option('semantix_placeholder_speed', 3000)
    );
    if (strpos($defaults['placeholders'], "\n") !== false) {
        $placeholder_lines = explode("\n", $defaults['placeholders']);
        $defaults['placeholders'] = implode(', ', array_map('trim', $placeholder_lines));
    }
    // Merge $atts with $defaults, $atts values take precedence if they exist
    $atts = array_merge($defaults, $atts);
    return $atts;
}
add_filter('shortcode_atts_semantix_search_bar', 'semantix_modify_shortcode_defaults', 10, 3); // Changed to 3 for compatibility

function semantix_track_search_to_cart_query() {
    if (is_search() && get_search_query() && !is_admin()) {
        $query = get_search_query();
        setcookie('semantix_last_search', sanitize_text_field($query), time() + 1800, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true); // Added httponly
        if (function_exists('session_status') && session_status() === PHP_SESSION_NONE) @session_start(); // Suppress errors if headers already sent
        if(isset($_SESSION)) $_SESSION['semantix_last_search'] = sanitize_text_field($query);
    }
}
add_action('template_redirect', 'semantix_track_search_to_cart_query', 9);

function semantix_track_add_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
    $search_query = semantix_get_search_query();
    if (!empty($search_query)) {
        $product = wc_get_product($product_id);
        $data = array(
            'timestamp' => time(), 'search_query' => $search_query, 'product_id' => $product_id,
            'product_name' => $product ? $product->get_name() : 'Unknown',
            'product_price' => $product ? $product->get_price() : '',
            'product_image' => $product ? wp_get_attachment_url($product->get_image_id()) : '',
            'quantity' => $quantity, 'site_url' => home_url(), 'event_type' => 'add_to_cart', 'source' => 'server_side'
        );
        semantix_send_to_mongodb($data);
    }
}
add_action('woocommerce_add_to_cart', 'semantix_track_add_to_cart', 10, 6);

function semantix_add_search_to_cart_script() {
    if (!class_exists('WooCommerce') || is_admin()) return;
    $mongodb_api_url = 'https://dashboard-server-ae00.onrender.com/search-to-cart'; $api_key = get_option('semantix_api_key', '');
    ?>
<script>
(function($) { // Pass jQuery as $
    function getSemanticCookie(name) { /* ... as before ... */ var value = "; " + document.cookie; var parts = value.split("; " + name + "="); if (parts.length == 2) return decodeURIComponent(parts.pop().split(";").shift()); return "";}
    function trackSearchToCartEvent(productId, productName, productPrice, quantity) {
        var lastSearch = getSemanticCookie('semantix_last_search');
        var urlParams = new URLSearchParams(window.location.search); var urlSearch = urlParams.get('s');
        var searchQuery = window.location.href.includes('/?s=') && urlSearch ? urlSearch : lastSearch;
        if (searchQuery) {
            var searchToCartData = { timestamp: Math.floor(Date.now()/1000), search_query: searchQuery, product_id: productId, product_name: productName, product_price: productPrice, quantity: quantity, site_url: window.location.hostname, event_type: 'add_to_cart', source: 'client_side' };
            fetch('<?php echo esc_url($mongodb_api_url); ?>', { method: 'POST', headers: {'Content-Type': 'application/json', 'x-api-key': '<?php echo esc_attr($api_key); ?>'}, body: JSON.stringify({document: searchToCartData})})
            .then(response => { if (!response.ok) throw new Error('Network response was not ok ' + response.status); return response.json(); }).then(data => console.log('Search to cart event saved (MongoDB):', data))
            .catch(error => { console.error('Error saving search to cart event (MongoDB):', error);
                $.ajax({ url: '<?php echo admin_url('admin-ajax.php'); ?>', type: 'POST', data: {action: 'semantix_track_search_to_cart', search_query: searchQuery, product_id: productId, product_name: productName, product_price: productPrice, quantity: quantity}, success: function(response){ console.log('Search to cart event tracked (AJAX fallback):', response);}});
            });
        }
    }
    $(document).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        if (!$button || !$button.length) return; // Ensure $button is valid
        var productId = $button.data('product_id'); var productName = $button.closest('.product').find('.woocommerce-loop-product__title').text() || $button.closest('.product-container').find('.product-name').text() || 'N/A'; var quantity = $button.data('quantity') || 1; var productPrice = ($button.closest('.product').find('.price .amount').first().text() || '').trim();
        trackSearchToCartEvent(productId, productName, productPrice, quantity);
    });
    $(document).on('click', '.add_to_cart_button', function(e) { if (window.location.href.includes('/?s=')) { var urlParams = new URLSearchParams(window.location.search); var searchQuery = urlParams.get('s'); if (searchQuery) { document.cookie = "semantix_last_search=" + encodeURIComponent(searchQuery) + "; path=/; max-age=1800; SameSite=Lax";}}});
    $('form.cart').on('submit', function(e) { var searchQuery = getSemanticCookie('semantix_last_search'); if (searchQuery) { var productId = $('input[name="product_id"]').val() || $('button[name="add-to-cart"]').val(); var productName = $('.product_title').text(); var quantity = $('input.qty').val() || 1; var productPrice = ($('.price .amount').first().text() || '').trim(); setTimeout(function(){ trackSearchToCartEvent(productId, productName, productPrice, quantity); }, 100);}});
})(jQuery);
</script>
    <?php
}
add_action('wp_footer', 'semantix_add_search_to_cart_script', 99);

function semantix_ajax_search_to_cart_callback() {
    check_ajax_referer( 'semantix_track_search_to_cart_nonce', 'security' ); // Add nonce check if sending nonce from JS
    $search_query = isset($_POST['search_query']) ? sanitize_text_field($_POST['search_query']) : ''; $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0; $product_name = isset($_POST['product_name']) ? sanitize_text_field($_POST['product_name']) : ''; $product_price = isset($_POST['product_price']) ? sanitize_text_field($_POST['product_price']) : ''; $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;
    if (!empty($search_query) && !empty($product_id)) {
        $result = semantix_send_to_mongodb(array('timestamp' => time(), 'search_query' => $search_query, 'product_id' => $product_id, 'product_name' => $product_name, 'product_price' => $product_price, 'quantity' => $quantity, 'site_url' => home_url(), 'event_type' => 'add_to_cart', 'source' => 'ajax_fallback')); // home_url() is safer
        if ($result) wp_send_json_success('Search to cart event sent to MongoDB'); else wp_send_json_error('Failed to send data to MongoDB');
    } else wp_send_json_error('Missing required data');
    wp_die();
}
add_action('wp_ajax_semantix_track_search_to_cart', 'semantix_ajax_search_to_cart_callback');
add_action('wp_ajax_nopriv_semantix_track_search_to_cart', 'semantix_ajax_search_to_cart_callback');

function semantix_get_search_query() {
    $search_query = '';
    if (function_exists('session_status') && session_status() === PHP_SESSION_NONE && !headers_sent()) @session_start();
    if (isset($_SESSION['semantix_last_search'])) $search_query = sanitize_text_field($_SESSION['semantix_last_search']);
    elseif (isset($_COOKIE['semantix_last_search'])) $search_query = sanitize_text_field($_COOKIE['semantix_last_search']);
    return $search_query;
}

function semantix_send_to_mongodb($data) {
    $mongodb_api_url = 'https://dashboard-server-ae00.onrender.com/search-to-cart'; $api_key = get_option('semantix_api_key', '');
    $response = wp_remote_post($mongodb_api_url, array('headers' => array('Content-Type' => 'application/json', 'x-api-key' => $api_key), 'body' => json_encode(array('document' => $data)), 'timeout' => 15, 'data_format' => 'body'));
    if (is_wp_error($response)) { error_log('Semantix: Error sending to MongoDB: ' . $response->get_error_message()); return false; }
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200 && $response_code !== 201) { error_log('Semantix: Error response from MongoDB API: ' . $response_code . ' Body: ' . wp_remote_retrieve_body($response)); return false; }
    return true;
}

add_action('woocommerce_loop_add_to_cart_link', 'semantix_add_search_data_to_add_to_cart', 10, 2);
function semantix_add_search_data_to_add_to_cart($html, $product_obj) { // Parameter is WC_Product
    if (is_search() && !is_admin()) {
        $search_query = get_search_query();
        if (!empty($search_query)) {
            // It's better to add data attributes to the link itself than modifying classes extensively
            $html = str_replace('<a ', '<a data-semantix-search-query="' . esc_attr($search_query) . '" ', $html);
        }
    }
    return $html;
}
add_action('wp_ajax_semantix_get_product_details', 'semantix_get_product_details_ajax');
add_action('wp_ajax_nopriv_semantix_get_product_details', 'semantix_get_product_details_ajax');

function semantix_get_product_details_ajax() {
    // Verify nonce for security
    if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'semantix_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'), 403);
        wp_die();
    }

    $product_ids_json = isset($_POST['product_ids']) ? stripslashes($_POST['product_ids']) : '[]';
    $product_ids_arr = json_decode($product_ids_json, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($product_ids_arr)) {
        wp_send_json_error(array('message' => 'Invalid product IDs format.'), 400);
        wp_die();
    }

    $product_details = array();

    foreach ($product_ids_arr as $product_id) {
        $product_id = intval($product_id);
        $product = wc_get_product($product_id);

        if ($product && $product->is_visible()) {
            $image_id = $product->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium') : '';
            
            $product_details[$product_id] = array(
                'id' => $product_id,
                'name' => $product->get_name(),
                'price' => $product->get_price_html(),
                'regular_price' => $product->get_regular_price(),
                'sale_price' => $product->get_sale_price(),
                'image' => $image_url,
                'url' => get_permalink($product_id),
                'in_stock' => $product->is_in_stock(),
                'stock_quantity' => $product->get_stock_quantity(),
                'sku' => $product->get_sku(),
                'short_description' => $product->get_short_description(),
                'categories' => wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names')),
                'tags' => wp_get_post_terms($product_id, 'product_tag', array('fields' => 'names')),
                'featured' => $product->is_featured(),
                'on_sale' => $product->is_on_sale(),
                'purchasable' => $product->is_purchasable(),
                'add_to_cart_url' => $product->add_to_cart_url(),
                'add_to_cart_text' => $product->add_to_cart_text()
            );
        }
    }

    wp_send_json_success($product_details);
    wp_die();
}

/**
 * Enhanced version that also handles add to cart functionality
 */
add_action('wp_ajax_semantix_add_to_cart', 'semantix_add_to_cart_ajax');
add_action('wp_ajax_nopriv_semantix_add_to_cart', 'semantix_add_to_cart_ajax');

function semantix_add_to_cart_ajax() {
    // Verify nonce for security
    if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'semantix_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'), 403);
        wp_die();
    }

    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;
    $variation_id = isset($_POST['variation_id']) ? intval($_POST['variation_id']) : 0;

    if (!$product_id) {
        wp_send_json_error(array('message' => 'Invalid product ID.'), 400);
        wp_die();
    }

    $product = wc_get_product($product_id);
    if (!$product || !$product->is_purchasable()) {
        wp_send_json_error(array('message' => 'Product not available for purchase.'), 400);
        wp_die();
    }

    // Add to cart
    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, $variation_id);

    if ($cart_item_key) {
        // Get updated cart data
        $cart_data = array(
            'cart_count' => WC()->cart->get_cart_contents_count(),
            'cart_total' => WC()->cart->get_cart_total(),
            'cart_url' => wc_get_cart_url()
        );

        wp_send_json_success(array(
            'message' => 'Product added to cart successfully!',
            'cart_data' => $cart_data,
            'cart_item_key' => $cart_item_key
        ));
    } else {
        wp_send_json_error(array('message' => 'Failed to add product to cart.'), 500);
    }

    wp_die();
}
?>
