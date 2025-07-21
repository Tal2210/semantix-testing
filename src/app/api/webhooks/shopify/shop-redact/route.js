import { NextResponse } from "next/server";
import clientPromise from "/lib/mongodb";
import { verifyShopifyWebhook } from "/lib/shopify-webhook-verifier";

// Handle GET requests (webhook verification)
export async function GET(request) {
  console.log("--- Shopify GDPR Shop Redaction Webhook GET Request ---");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  // Return 200 OK for webhook verification
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  console.log("--- Shopify GDPR Shop Redaction Webhook Received ---");
  const body = await request.text();

  const isValid = await verifyShopifyWebhook(request, body);
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("GDPR Shop Redaction signature verified.");

  try {
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