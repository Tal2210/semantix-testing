import { MongoClient } from "mongodb";
import { GraphQLClient, gql } from "graphql-request";
import pLimit from "p-limit";
import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parse } from "node-html-parser";

// Environment variables
const {
  MONGODB_URI,
  OPENAI_API_KEY,
  IMG_CONCURRENCY = "3" // how many products to process in parallel
} = process.env;

/* ---------- OpenAI helpers --------------------------------------- */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: OPENAI_API_KEY
});

async function embed(text) {
  try {
    return await embeddings.embedQuery(text);
  } catch (e) {
    console.warn("Embedding failed:", e);
    return null;
  }
}

async function classify(text, name, categories) {
  const list = categories.join(", ");
  const prompt = `Pick the single most fitting category from: ${list}.\n\nName: ${name}\nDescription: ${text}`;
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }]
  });
  const out = res.choices?.[0]?.message?.content?.trim();
  return out === "None" ? null : out;
}

/* Helper to convert HTML to plain text */
function parseHtmlToPlainText(html) {
  // Use node-html-parser to remove any HTML tags
  const root = parse(html || "");
  return root.textContent.trim();
}

/* ----------------------------------------------------------------- */

/**
 * Process Shopify product descriptions.
 * Instead of analyzing images, this function analyzes the product description.
 *
 * @param {object} params
 * @param {string} params.shopifyDomain - The shop's domain (e.g., "mystore")
 * @param {string} params.shopifyToken - Shopify Admin API token
 * @param {string} params.dbName - MongoDB database name
 * @param {array}  params.categories - Array of categories for classification
 */
export default async function processShopifyDescriptions({ shopifyDomain, shopifyToken, dbName, categories }) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log(shopifyDomain, shopifyToken, dbName, categories);

  const db = client.db(dbName);
  const productsCol = db.collection("products");
  const statusCol = db.collection("sync_status");

  // Mark job as running
  await statusCol.updateOne(
    { dbName },
    { $set: { state: "running", startedAt: new Date(), done: 0, total: 0 } },
    { upsert: true }
  );

  // Setup GraphQL Client for Shopify
  const endpoint = `https://${shopifyDomain}.myshopify.com/admin/api/2025-01/graphql.json`;
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Access-Token': shopifyToken,
      'Content-Type': 'application/json',
    },
  });

  // GraphQL query to fetch products including product description (bodyHtml)
  const query = gql`
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            onlineStoreUrl
            handle
            bodyHtml
            priceRange {
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `;
  const data = await graphQLClient.request(query, { first: 100 });
  const products = data.products.edges.map(edge => edge.node);

  await statusCol.updateOne(
    { dbName },
    { $set: { total: products.length } }
  );

  // Process products with limited concurrency
  const limit = pLimit(Number(IMG_CONCURRENCY));
  let done = 0;

  await Promise.all(
    products.map(prod =>
      limit(async () => {
        // Extract and clean up the product description from HTML
        const rawDescription = prod.bodyHtml || "";
        const description = parseHtmlToPlainText(rawDescription);
        const embedding = await embed(description);
        const category = await classify(description, prod.title, categories);
        const price = prod.priceRange?.minVariantPrice?.amount || 0;
        // Use onlineStoreUrl if available, otherwise build a URL using shopifyDomain and product handle
        const url = prod.onlineStoreUrl || `https://${shopifyDomain}.myshopify.com/products/${prod.handle}`;

        await productsCol.updateOne(
          { id: prod.id },
          {
            $set: {
              name: prod.title,
              description1: description,
              embedding,
              category,
              price: Number(price),
              url,
              fetchedAt: new Date()
            }
          },
          { upsert: true }
        );

        // Update progress
        done += 1;
        await statusCol.updateOne({ dbName }, { $set: { done } });
      })
    )
  );

  // Mark job as done
  await statusCol.updateOne(
    { dbName },
    { $set: { state: "done", finishedAt: new Date(), done: products.length } }
  );

  await client.close();
}