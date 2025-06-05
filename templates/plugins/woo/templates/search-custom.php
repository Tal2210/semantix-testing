<?php
/**
 * Template Name: Semantix AI – Custom Search Results
 *
 * Renders a grid of products fetched from the Semantix search-API,
 * replacing WooCommerce's default loop.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* -------------------------------------------------------------------------
 *  1.  Pull run-time options we already store in Advanced Settings
 * ------------------------------------------------------------------------- */
$search_host = rtrim( get_option( 'semantix_api_endpoint', '' ), '/' );
$db_name     = get_option( 'semantix_dbname', '' );
$api_key     = get_option( 'semantix_api_key', '' ); // Make sure this matches your admin field key
$cat_raw     = get_option( 'semantix_categories', '' );
$categories  = array_filter( array_map( 'trim', explode( ',', $cat_raw ) ) );
get_header();
?>

<div id="semantix-custom-search-results" class="semantix-custom-search-results">
  <header class="search-header">
    <h1 class="page-title" id="search-title">תוצאות חיפוש</h1>
    <a href="https://semantix.co.il" target="_blank" aria-label="Semantix AI" class="powered-by">
      <img src="https://semantix-ai.com/powered.png" alt="Semantix logo" width="140">
    </a>
  </header>

  <div id="semantix-products-container" class="semantix-products-container">
    <div class="semantix-spinner" role="status" aria-label="טוען תוצאות">
      <div class="spinner-ring"></div>
      <p class="spinner-text">טוען תוצאות...</p>
    </div>
  </div>
</div>

<style>
/* Classic Professional Styling */
.semantix-custom-search-results {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #ffffff;
  color: #333333;
}

/* Header Styling */
.search-header {
  text-align: center;
  margin-bottom: 50px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e5e5;
}

.page-title {
  color: #1a1a1a;
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 300;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.powered-by {
  display: inline-block;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.powered-by:hover {
  opacity: 1;
}

/* Classic Black Spinner */
.semantix-spinner {
  display: none;
  text-align: center;
  padding: 80px 40px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  margin: 40px auto;
  max-width: 400px;
}

.spinner-ring {
  display: inline-block;
  width: 60px;
  height: 60px;
  border: 3px solid #f0f0f0;
  border-radius: 50%;
  border-top-color: #1a1a1a;
  animation: spin 1.2s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-text {
  color: #666666;
  font-size: 16px;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* Centered Products Container */
.semantix-products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  min-height: 300px;
  margin-top: 40px;
}

.semantix-products-container > p {
  text-align: center;
  font-size: 18px;
  color: #666666;
  padding: 60px 40px;
  background: #f8f8f8;
  border: 1px solid #e8e8e8;
  margin: 40px auto;
  max-width: 500px;
  font-weight: 300;
  letter-spacing: 0.3px;
}

/* Professional Product Cards */
.semantix-product-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  width: 320px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.semantix-product-card:hover,
.semantix-product-card:focus {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #333333;
  outline: none;
}

/* FIXED IMAGE CONTAINER - Shows full image at 150px height */
.semantix-product-image-container {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 10px;
  box-sizing: border-box;
}

.semantix-product-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  background: transparent;
  transition: transform 0.3s ease;
}

/* Hover effect for images */
.semantix-product-card:hover .semantix-product-image {
  transform: scale(1.05);
}

.semantix-product-info {
  padding: 25px;
  text-align: center;
}

/* Classy Perfect Match Badge */
.highlight-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  color: #ffffff;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  border: none;
  position: relative;
}

.highlight-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #1a1a1a, #333333);
  z-index: -1;
}

.highlight-text img {
  filter: brightness(0) invert(1);
  width: 16px;
  height: 16px;
}

.semantix-product-name {
  font-size: 20px;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.2px;
}

.semantix-product-info .text-black {
  color: #666666;
  font-size: 14px;
  margin: 10px 0;
  font-weight: 400;
  line-height: 1.5;
}

.semantix-product-price {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 18px 0 0 0;
  letter-spacing: -0.5px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .semantix-products-container {
    gap: 25px;
  }
  
  .semantix-product-card {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .semantix-custom-search-results {
    padding: 30px 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .semantix-products-container {
    gap: 20px;
  }
  
  .semantix-product-card {
    width: 280px;
  }
  
  /* Maintain image container height on mobile */
  .semantix-product-image-container {
    height: 140px;
    padding: 8px;
  }
  
  .spinner-ring {
    width: 50px;
    height: 50px;
  }
  
  .semantix-spinner {
    padding: 60px 30px;
  }
}

@media (max-width: 480px) {
  .semantix-product-card {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .semantix-products-container {
    flex-direction: column;
    align-items: center;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  /* Slightly smaller image container on very small screens */
  .semantix-product-image-container {
    height: 120px;
    padding: 5px;
  }
}

/* Loading Animation for Images */
.semantix-product-image[src=""] {
  background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* Professional Typography */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Accessibility Enhancements */
.semantix-product-card:focus-visible {
  outline: 2px solid #1a1a1a;
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .semantix-spinner,
  .powered-by {
    display: none;
  }
  
  .semantix-product-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>

<script>
(function () {
  const SEARCH_HOST = <?php echo wp_json_encode( $search_host ); ?>;
  const DB_NAME     = <?php echo wp_json_encode( $db_name ); ?>;
  const API_KEY     = <?php echo wp_json_encode( $api_key ); ?>;

  if ( ! SEARCH_HOST ) {
    console.error('Semantix API endpoint is not configured.');
    return;
  }
  console.log('Semantix SEARCH_HOST:', SEARCH_HOST);
  console.log('Semantix API_KEY:', API_KEY);

  const params     = new URLSearchParams( window.location.search );
  const searchTerm = params.get( 's' ) || '';
  if ( ! searchTerm ) return;

  document.getElementById('search-title').textContent =
    `תוצאות חיפוש עבור - ${ searchTerm }`;

  const container = document.getElementById('semantix-products-container');
  const spinner   = container.querySelector('.semantix-spinner');

  const KEY            = `semantix-products-${ encodeURIComponent( searchTerm ) }`;
  const CACHE_DURATION = 5 * 60 * 1000;

  const cached = sessionStorage.getItem( KEY );
  if ( cached ) {
    try {
      const { t, data } = JSON.parse( cached );
      if ( Date.now() - t < CACHE_DURATION ) {
        renderProducts( data );
        return;
      }
    } catch (e) {
      sessionStorage.removeItem( KEY );
    }
  }

  spinner.style.display = 'block';

  fetch(`https://dashboard-server-ae00.onrender.com/search`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...( API_KEY ? { 'x-api-key': API_KEY } : {} )
    },
    body: JSON.stringify({
      query      : searchTerm,
      useImages  : true
    })
  })
  .then( r => {
    if ( r.status === 401 ) {
      console.error('Unauthorized: check your API key and header name');
      throw new Error('Unauthorized');
    }
    if ( ! r.ok ) throw new Error('API error ' + r.status);
    return r.json();
  })
  .then( data => {
    sessionStorage.setItem( KEY, JSON.stringify({ t: Date.now(), data }) );
    renderProducts( data );
  })
  .catch( err => {
    console.error(err);
    container.innerHTML = '<p>שגיאה בטעינת התוצאות</p>';
  })
  .finally( () => spinner.style.display = 'none' );

  function renderProducts ( products = [] ) {
    if ( ! products.length ) {
      container.innerHTML = '<p>לא נמצאו תוצאות.</p>';
      return;
    }
    container.innerHTML = products.map( cardHTML ).join('');
    container.querySelectorAll('.semantix-product-card').forEach( c => {
      const url = c.dataset.url;
      c.addEventListener('click', () => url && (location.href = url));
      c.addEventListener('keydown', e => {
        if ( e.key === 'Enter' || e.key === ' ' ) {
          e.preventDefault();
          url && (location.href = url);
        }
      });
    });
  }

  function cardHTML ( p ) {
    return `
      <div class="semantix-product-card" data-url="${ p.url }" tabindex="0">
        <div class="semantix-product-image-container">
          <img class="semantix-product-image" src="${ p.image }" alt="${ p.name }" loading="lazy">
        </div>
        <div class="semantix-product-info">
          ${ p.highlight ? `<div class="highlight-text">
              <img src="https://alcohome.co.il/wp-content/uploads/2024/09/ai_stars_icon-removebg-preview.png" alt="" width="16" height="16">
              <span>Perfect Match</span>
          </div>` : '' }
          <h3 class="semantix-product-name">${ p.name }</h3>
          ${ p.type?.length > 1 ? `<p class="text-black font-bold text-lg mb-4">
              ${ p.type[0] }, ${ p.type[1] }
          </p>` : '' }
          <p class="semantix-product-price">₪${ p.price }</p>
        </div>
      </div>`;
  }
})();
</script>

<?php get_footer(); ?>