import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "/lib/mongodb";
import { SHOPIFY_API_SECRET } from "/lib/shopify-app-config";

/**
 * Verify the webhook signature according to Shopify documentation
 * @param {Request} request - The incoming request
 * @param {string} body - The request body as a string
 * @returns {boolean} - Whether the signature is valid
 */
async function verifyWebhookSignature(request, body) {
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  if (!hmacHeader) {
    console.error("Missing x-shopify-hmac-sha256 header");
    return false;
  }
  
  const secret = SHOPIFY_API_SECRET;
  if (!secret) {
    console.error("Missing SHOPIFY_API_SECRET");
    return false;
  }
  
  // Create HMAC using the secret and request body
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body, "utf8");
  const calculatedDigest = hmac.digest("base64");
  
  // Compare the calculated digest with the header using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(calculatedDigest, "utf8"),
    Buffer.from(hmacHeader, "utf8")
  );
}

// Handle GET requests (webhook verification)
export async function GET(request) {
  console.log("--- Shopify GDPR Shop Redaction Webhook GET Request ---");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  // Return 200 OK for webhook verification
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  try {
    console.log("--- Shopify GDPR Shop Redaction Webhook Received ---");
    console.log("Request URL:", request.url);
    console.log("Request Method:", request.method);
    console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    // Check if SHOPIFY_API_SECRET is configured
    if (!SHOPIFY_API_SECRET) {
      console.error("SHOPIFY_API_SECRET is not configured");
      return new Response("Server Configuration Error", { status: 500 });
    }

    // Get the raw request body as a string
    const body = await request.text();
    console.log("Request body length:", body.length);
    
    // Verify the webhook signature
    const isValid = await verifyWebhookSignature(request, body);
    if (!isValid) {
      console.error("Invalid webhook signature - returning HTTP 401");
      return new Response("Unauthorized", { status: 401 });
    }
    
    console.log("Webhook signature verified successfully");
    
    // Parse the request body
    const data = JSON.parse(body);
    const shop = request.headers.get("x-shopify-shop-domain");
    
    console.log(`Processing GDPR shop redaction for shop: ${shop}`);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("users");
    
    // Extract shop info from the webhook data
    const { shop_id, shop_domain } = data;
    
    // Log the redaction request
    await db.collection("gdpr_requests").insertOne({
      type: "shop_redact",
      shop,
      shopId: shop_id,
      requestedAt: new Date(),
      status: "received",
      completedAt: null
    });
    
    // Perform shop data redaction
    await redactShopData(db, shop, shop_id);
    
    // Update the request status
    await db.collection("gdpr_requests").updateOne(
      { shop, type: "shop_redact" },
      { $set: { status: "completed", completedAt: new Date() } }
    );
    
    console.log(`--- Finished processing GDPR shop redaction for ${shop} ---`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("GDPR shop redaction webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Redact shop data for GDPR compliance
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 * @param {string} shopId - The shop ID
 */
async function redactShopData(db, shop, shopId) {
  try {
    // Redact all shop data from products collection
    await db.collection("products").updateMany(
      { shop },
      {
        $set: {
          shop: "[REDACTED]",
          shopifyId: "[REDACTED]",
          title: "[REDACTED]",
          description: "[REDACTED]",
          redactedAt: new Date()
        }
      }
    );
    
    // Redact all shop data from analytics collection
    await db.collection("cart_analytics").updateMany(
      { shop },
      {
        $set: {
          shop: "[REDACTED]",
          searchQuery: "[REDACTED]",
          results: [],
          redactedAt: new Date()
        }
      }
    );
    
    // Redact all shop data from users collection
    await db.collection("users").updateMany(
      { shopifyShop: shop },
      {
        $set: {
          shopifyShop: "[REDACTED]",
          shopifyConnected: false,
          redactedAt: new Date()
        }
      }
    );
    
    // Redact all shop data from webhooks collection
    await db.collection("shopify_webhooks").updateMany(
      { shop },
      {
        $set: {
          shop: "[REDACTED]",
          data: { redacted: true },
          redactedAt: new Date()
        }
      }
    );
    
    // Redact all shop data from installations collection
    await db.collection("shopify_installations").updateMany(
      { shop },
      {
        $set: {
          shop: "[REDACTED]",
          active: false,
          redactedAt: new Date()
        }
      }
    );
    
    // Redact all shop data from GDPR data collection
    await db.collection("gdpr_data").updateMany(
      { shop },
      {
        $set: {
          shop: "[REDACTED]",
          data: { redacted: true },
          redactedAt: new Date()
        }
      }
    );
    
    console.log(`Successfully redacted all data for shop ${shop}`);
  } catch (error) {
    console.error("Error redacting shop data:", error);
    throw error;
  }
} 