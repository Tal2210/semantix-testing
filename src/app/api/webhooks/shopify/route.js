import { NextResponse } from "next/server";
import clientPromise from "/lib/mongodb";
import { verifyShopifyWebhook } from "/lib/shopify-webhook-verifier";


// Handle GET requests (webhook verification)
export async function GET(request) {
  console.log("--- Shopify Webhook GET Request ---");
  // This endpoint is hit by Shopify to verify the URL.
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  console.log("--- Shopify Webhook Received ---");
  
  const body = await request.text();

  // Unified verification
  const isValid = await verifyShopifyWebhook(request, body);
  if (!isValid) {
    // The verifier already logs the specific reason for failure.
    return new Response("Unauthorized", { status: 401 });
  }
  
  console.log("Webhook signature verified successfully.");
  
  // Process the verified webhook
  try {
    const data = JSON.parse(body);
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");

    console.log(`Processing webhook: ${topic} from ${shop}`);
    
    const client = await clientPromise;
    const db = client.db("users");
    
    // Store all incoming webhooks for auditing and debugging.
    await db.collection("shopify_webhooks").insertOne({
        topic,
        shop,
        data,
        receivedAt: new Date()
    });

    // Route to the correct handler based on the topic
    switch (topic) {
        case "products/create":
        case "products/update":
            await processProductUpdate(db, shop, data);
            break;
            
        case "products/delete":
            await processProductDeletion(db, shop, data);
            break;
            
        case "app/uninstalled":
            await handleAppUninstall(db, shop);
            break;
        
        // GDPR webhooks are handled by their own dedicated endpoints now,
        // but we log them here if they are ever sent to the main endpoint.
        case "customers/data_request":
        case "customers/redact":
        case "shop/redact":
            console.warn(`Received GDPR webhook topic '${topic}' on the main endpoint. This should be configured to use its dedicated API route.`);
            break;
            
        default:
            console.log(`Unhandled webhook topic received: ${topic}`);
    }
    
    console.log(`--- Finished processing webhook: ${topic} ---`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error after signature validation:", error);
    // Return 500 if the error happens after successful validation
    return new Response("Internal Server Error", { status: 500 });
  }
}

// --- HELPER FUNCTIONS ---

/**
 * Processes product creation and update webhooks.
 */
async function processProductUpdate(db, shop, data) {
  try {
    const user = await db.collection("users").findOne({ shopifyShop: shop });
    if (!user) {
      console.error(`Product update webhook received, but no user found for shop: ${shop}`);
      return; // Or handle as an error case
    }
    
    await db.collection("products").updateOne(
      { shopifyId: data.id.toString(), shop },
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
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    
    console.log(`Processed product update for: ${data.title} (ID: ${data.id})`);
  } catch (error) {
    console.error("Error in processProductUpdate:", error);
  }
}

/**
 * Processes product deletion webhooks.
 */
async function processProductDeletion(db, shop, data) {
  try {
    await db.collection("products").updateOne(
      { shopifyId: data.id.toString(), shop },
      { $set: { deleted: true, deletedAt: new Date() } }
    );
    console.log(`Processed product deletion for product ID: ${data.id}`);
  } catch (error) {
    console.error("Error in processProductDeletion:", error);
  }
}

/**
 * Handles the app uninstallation webhook.
 */
async function handleAppUninstall(db, shop) {
  try {
    // Here you would deactivate the user, cancel subscriptions, etc.
    await db.collection("users").updateMany(
      { shopifyShop: shop },
      { $set: { shopifyConnected: false, shopifyUninstalledAt: new Date(), active: false } }
    );
    console.log(`Processed app uninstallation for shop: ${shop}`);
  } catch (error)
  {
    console.error("Error in handleAppUninstall:", error);
  }
} 