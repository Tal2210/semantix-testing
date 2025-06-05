import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "/lib/mongodb";
import { SHOPIFY_API_SECRET } from "/lib/shopify-app-config";

/**
 * Verify the webhook signature
 * @param {Request} request - The incoming request
 * @param {string} body - The request body as a string
 * @returns {boolean} - Whether the signature is valid
 */
async function verifyWebhookSignature(request, body) {
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  if (!hmacHeader) return false;
  
  const secret = SHOPIFY_API_SECRET;
  if (!secret) return false;
  
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("base64");
  
  return crypto.timingSafeEqual(
    Buffer.from(hmacHeader),
    Buffer.from(digest)
  );
}

export async function POST(request) {
  try {
    // Get the raw request body as a string
    const body = await request.text();
    
    // Verify the webhook signature
    const isValid = await verifyWebhookSignature(request, body);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    // Parse the request body
    const data = JSON.parse(body);
    
    // Get the webhook topic from the headers
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");
    
    console.log(`Received webhook: ${topic} from ${shop}`);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("users");
    
    // Store the webhook in the database
    await db.collection("shopify_webhooks").insertOne({
      topic,
      shop,
      data,
      receivedAt: new Date()
    });
    
    // Handle different webhook topics
    switch (topic) {
      case "products/create":
      case "products/update":
        // Process product update
        await processProductUpdate(db, shop, data);
        break;
        
      case "products/delete":
        // Process product deletion
        await processProductDeletion(db, shop, data);
        break;
        
      case "app/uninstalled":
        // Handle app uninstallation
        await handleAppUninstall(db, shop);
        break;
        
      default:
        // Log other webhook topics
        console.log(`Unhandled webhook topic: ${topic}`);
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Process a product update webhook
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 * @param {Object} data - The webhook data
 */
async function processProductUpdate(db, shop, data) {
  try {
    // Find the user associated with this shop
    const user = await db.collection("users").findOne({ shopifyShop: shop });
    if (!user) {
      console.error(`No user found for shop: ${shop}`);
      return;
    }
    
    // Update or create the product in the database
    await db.collection("products").updateOne(
      { 
        shopifyId: data.id.toString(),
        shop 
      },
      {
        $set: {
          title: data.title,
          description: data.body_html,
          handle: data.handle,
          productType: data.product_type,
          vendor: data.vendor,
          tags: data.tags?.split(",").map(tag => tag.trim()) || [],
          variants: data.variants || [],
          images: data.images || [],
          updatedAt: new Date(),
          userId: user._id,
          userEmail: user.email
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`Processed product update for ${data.title} (${data.id})`);
  } catch (error) {
    console.error("Error processing product update:", error);
  }
}

/**
 * Process a product deletion webhook
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 * @param {Object} data - The webhook data
 */
async function processProductDeletion(db, shop, data) {
  try {
    // Mark the product as deleted in the database
    await db.collection("products").updateOne(
      { 
        shopifyId: data.id.toString(),
        shop 
      },
      {
        $set: {
          deleted: true,
          deletedAt: new Date()
        }
      }
    );
    
    console.log(`Processed product deletion for product ID: ${data.id}`);
  } catch (error) {
    console.error("Error processing product deletion:", error);
  }
}

/**
 * Handle app uninstallation webhook
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 */
async function handleAppUninstall(db, shop) {
  try {
    // Update the installation record
    await db.collection("shopify_installations").updateMany(
      { shop },
      {
        $set: {
          active: false,
          uninstalledAt: new Date()
        }
      }
    );
    
    // Update the user record
    await db.collection("users").updateMany(
      { shopifyShop: shop },
      {
        $set: {
          shopifyConnected: false,
          shopifyUninstalledAt: new Date()
        }
      }
    );
    
    console.log(`Processed app uninstallation for shop: ${shop}`);
  } catch (error) {
    console.error("Error handling app uninstall:", error);
  }
} 