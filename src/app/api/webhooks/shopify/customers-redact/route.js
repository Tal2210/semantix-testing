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
  console.log("--- Shopify GDPR Redaction Webhook GET Request ---");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  // Return 200 OK for webhook verification
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  try {
    console.log("--- Shopify GDPR Customer Redaction Webhook Received ---");
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
    
    console.log(`Processing GDPR customer redaction for shop: ${shop}`);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("users");
    
    // Extract customer info from the webhook data
    const { shop_id, shop_domain, customer, orders_to_redact } = data;
    const customerId = customer.id;
    const customerEmail = customer.email;
    
    // Log the redaction request
    await db.collection("gdpr_requests").insertOne({
      type: "redact",
      shop,
      shopId: shop_id,
      customerId,
      customerEmail,
      ordersToRedact: orders_to_redact,
      requestedAt: new Date(),
      status: "received",
      completedAt: null
    });
    
    // Perform customer data redaction
    await redactCustomerData(db, shop, customerId, customerEmail);
    
    // Update the request status
    await db.collection("gdpr_requests").updateOne(
      { customerId, shop, type: "redact" },
      { $set: { status: "completed", completedAt: new Date() } }
    );
    
    console.log(`--- Finished processing GDPR customer redaction for ${customerEmail} ---`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("GDPR redaction webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Redact customer data for GDPR compliance
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 * @param {string} customerId - The customer ID
 * @param {string} customerEmail - The customer email
 */
async function redactCustomerData(db, shop, customerId, customerEmail) {
  try {
    // Redact customer data from products collection
    await db.collection("products").updateMany(
      { userEmail: customerEmail, shop },
      {
        $set: {
          userEmail: "[REDACTED]",
          userId: "[REDACTED]",
          redactedAt: new Date()
        }
      }
    );
    
    // Redact customer data from analytics collection
    await db.collection("cart_analytics").updateMany(
      { userEmail: customerEmail, shop },
      {
        $set: {
          userEmail: "[REDACTED]",
          searchQuery: "[REDACTED]",
          results: [],
          redactedAt: new Date()
        }
      }
    );
    
    // Redact customer data from users collection
    await db.collection("users").updateMany(
      { email: customerEmail, shopifyShop: shop },
      {
        $set: {
          email: "[REDACTED]",
          name: "[REDACTED]",
          shopifyShop: "[REDACTED]",
          redactedAt: new Date()
        }
      }
    );
    
    // Redact customer data from GDPR data collection
    await db.collection("gdpr_data").updateMany(
      { customerEmail, shop },
      {
        $set: {
          customerEmail: "[REDACTED]",
          data: { redacted: true },
          redactedAt: new Date()
        }
      }
    );
    
    console.log(`Successfully redacted data for customer ${customerEmail} from shop ${shop}`);
  } catch (error) {
    console.error("Error redacting customer data:", error);
    throw error;
  }
} 