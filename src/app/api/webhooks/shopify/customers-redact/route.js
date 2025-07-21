import { NextResponse } from "next/server";
import clientPromise from "/lib/mongodb";
import { verifyShopifyWebhook } from "/lib/shopify-webhook-verifier";

// Handle GET requests (webhook verification)
export async function GET(request) {
  console.log("--- Shopify GDPR Redaction Webhook GET Request ---");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  // Return 200 OK for webhook verification
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  console.log("--- Shopify GDPR Customer Redaction Webhook Received ---");
  const body = await request.text();

  const isValid = await verifyShopifyWebhook(request, body);
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("GDPR Customer Redaction signature verified.");

  try {
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