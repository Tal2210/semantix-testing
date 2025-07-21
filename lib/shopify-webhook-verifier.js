import crypto from "crypto";
import { SHOPIFY_API_SECRET } from "/lib/shopify-app-config";

/**
 * Verify a Shopify webhook signature in a way that is safe against timing attacks.
 *
 * @param {Request} request - The incoming Next.js request object.
 * @param {string} body - The raw request body as a string.
 * @returns {Promise<boolean>} - A promise that resolves to true if the signature is valid, and false otherwise.
 */
export async function verifyShopifyWebhook(request, body) {
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!hmacHeader) {
    console.error("Cannot verify webhook: Missing 'x-shopify-hmac-sha256' header.");
    return false;
  }

  const secret = SHOPIFY_API_SECRET;
  if (!secret) {
    console.error("Cannot verify webhook: SHOPIFY_API_SECRET is not set. Please check environment variables.");
    // We return false here to prevent a 500 error, which would happen if we throw.
    return false;
  }

  // Calculate the HMAC digest from the request body.
  const calculatedHmac = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  const hmacBuffer = Buffer.from(hmacHeader, 'base64');
  const calculatedHmacBuffer = Buffer.from(calculatedHmac, 'base64');

  // The HMACs must be of equal length to be valid.
  // This check prevents an error in crypto.timingSafeEqual.
  if (hmacBuffer.length !== calculatedHmacBuffer.length) {
    console.warn("Webhook verification failed: HMAC length mismatch.");
    return false;
  }

  // We use crypto.timingSafeEqual to perform a constant-time comparison,
  // which helps prevent timing attacks.
  const isValid = crypto.timingSafeEqual(hmacBuffer, calculatedHmacBuffer);

  if (!isValid) {
    console.warn("Webhook verification failed: Invalid HMAC signature.");
  }

  return isValid;
} 