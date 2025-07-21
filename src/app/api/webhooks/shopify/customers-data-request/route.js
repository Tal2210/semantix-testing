import { NextResponse } from "next/server";
import clientPromise from "/lib/mongodb";
import { verifyShopifyWebhook } from "/lib/shopify-webhook-verifier";

// Handle GET requests (webhook verification)
export async function GET(request) {
  console.log("--- Shopify GDPR Webhook GET Request ---");
  console.log("Request URL:", request.url);
  console.log("Request Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  // Return 200 OK for webhook verification
  return new Response("OK", { status: 200 });
}

export async function POST(request) {
  console.log("--- Shopify GDPR Customer Data Request Webhook Received ---");
  const body = await request.text();
  
  const isValid = await verifyShopifyWebhook(request, body);
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  console.log("GDPR Customer Data Request signature verified.");

  try {
    const data = JSON.parse(body);
    const shop = request.headers.get("x-shopify-shop-domain");
    
    console.log(`Processing GDPR customer data request for shop: ${shop}`);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("users");
    
    // Extract customer info from the webhook data
    const { shop_id, shop_domain, customer, orders_requested } = data;
    const customerId = customer.id;
    const customerEmail = customer.email;
    
    // Log the request in a dedicated GDPR collection
    await db.collection("gdpr_requests").insertOne({
      type: "data_request",
      shop,
      shopId: shop_id,
      customerId,
      customerEmail,
      ordersRequested: orders_requested,
      requestedAt: new Date(),
      status: "received",
      completedAt: null
    });
    
    // Collect customer data (this would be your actual data collection logic)
    const customerData = await collectCustomerData(db, shop, customerId, customerEmail);
    
    // Store the collected data
    await db.collection("gdpr_data").insertOne({
      requestId: customerId,
      shop,
      customerId,
      customerEmail,
      data: customerData,
      collectedAt: new Date()
    });
    
    // Update the request status
    await db.collection("gdpr_requests").updateOne(
      { customerId, shop },
      { $set: { status: "completed", completedAt: new Date() } }
    );
    
    console.log(`--- Finished processing GDPR customer data request for ${customerEmail} ---`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("GDPR webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * Collect customer data for GDPR compliance
 * @param {Object} db - MongoDB database connection
 * @param {string} shop - The shop domain
 * @param {string} customerId - The customer ID
 * @param {string} customerEmail - The customer email
 * @returns {Object} The collected customer data
 */
async function collectCustomerData(db, shop, customerId, customerEmail) {
  const customerData = {
    customer: {
      id: customerId,
      email: customerEmail,
      shop: shop
    },
    products: [],
    analytics: [],
    settings: []
  };
  
  try {
    // Collect product data associated with this customer
    const products = await db.collection("products").find({
      userEmail: customerEmail,
      shop
    }).toArray();
    
    customerData.products = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description1,
      category: product.category,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    // Collect analytics data
    const analytics = await db.collection("cart_analytics").find({
      userEmail: customerEmail,
      shop
    }).toArray();
    
    customerData.analytics = analytics.map(analytic => ({
      id: analytic._id,
      searchQuery: analytic.searchQuery,
      timestamp: analytic.timestamp,
      results: analytic.results
    }));
    
    // Collect user settings
    const user = await db.collection("users").findOne({
      email: customerEmail,
      shopifyShop: shop
    });
    
    if (user) {
      customerData.settings = {
        shopifyConnected: user.shopifyConnected,
        woocommerceConnected: user.woocommerceConnected,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    }
    
  } catch (error) {
    console.error("Error collecting customer data:", error);
  }
  
  return customerData;
} 