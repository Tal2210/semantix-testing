import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "/lib/mongodb";
import { exchangeCodeForToken, generateAuthUrl, APP_URL } from "/lib/shopify-app-config";
import crypto from "crypto";
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');
  
  const storedState = cookies().get('shopify_oauth_state')?.value;

  // 1. Verify the state parameter
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=Invalid state parameter`);
  }

  // Clear the state cookie
  cookies().set('shopify_oauth_state', '', { maxAge: -1 });

  // 2. Exchange the authorization code for an access token
  if (!code || !shop) {
    return NextResponse.redirect(`${APP_URL}/dashboard?error=Invalid request`);
  }

  try {
    const tokenData = await exchangeCodeForToken(shop, code);
    
    // TODO: Save the access token and shop data to your database
    // For example: await saveShopData({ shop, accessToken: tokenData.access_token, scopes: tokenData.scope });

    // 3. Redirect to the app's dashboard
    return NextResponse.redirect(`${APP_URL}/dashboard`);
    
  } catch (error) {
    console.error("Shopify auth callback error:", error);
    return NextResponse.redirect(`${APP_URL}/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Register webhooks for the shop
 * @param {string} shop - The shop domain
 * @param {string} accessToken - The access token
 * @param {Object} db - MongoDB database connection
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The results of webhook registration
 */
async function registerWebhooks(shop, accessToken, db, user) {
  try {
    // Register webhooks for each topic
    const results = await Promise.all(
      WEBHOOK_TOPICS.map(topic => registerWebhook(shop, accessToken, topic))
    );
    
    // Save webhook registrations to the database
    const successfulWebhooks = results
      .filter(result => result.success)
      .map(result => ({
        topic: result.topic,
        webhookId: result.webhookId,
        shop,
        createdAt: new Date(),
        userId: user.id,
        userEmail: user.email
      }));
    
    if (successfulWebhooks.length > 0) {
      await db.collection("shopify_webhook_registrations").insertMany(successfulWebhooks);
    }
    
    return {
      registered: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  } catch (error) {
    console.error("Error registering webhooks:", error);
    return {
      registered: 0,
      failed: WEBHOOK_TOPICS.length,
      error: error.message
    };
  }
}

/**
 * Register a webhook for a specific topic
 * @param {string} shop - The shop domain
 * @param {string} accessToken - The access token
 * @param {string} topic - The webhook topic
 * @returns {Promise<Object>} - The result of the registration
 */
async function registerWebhook(shop, accessToken, topic) {
  try {
    const formattedShop = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const apiVersion = '2023-10'; // Update this to the latest stable version
    
    const response = await fetch(`https://${formattedShop}/admin/api/${apiVersion}/webhooks.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address: `${APP_URL}/api/webhooks/shopify`,
          format: 'json'
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to register webhook for ${topic}:`, errorText);
      return {
        topic,
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }
    
    const data = await response.json();
    return {
      topic,
      success: true,
      webhookId: data.webhook.id
    };
  } catch (error) {
    console.error(`Error registering webhook for ${topic}:`, error);
    return {
      topic,
      success: false,
      error: error.message
    };
  }
} 