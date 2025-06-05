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

function isValidImageUrl(url) {
  if (typeof url !== "string") return false;
  try { new URL(url); } catch { return false; }
  return /\.(jpe?g|png|gif|webp)$/i.test(url);
}

/* Compose image messages for Shopify products.
   Shopify returns images as edges via GraphQL. */
function composeImageMessages(product) {
  return (product.images?.edges || [])
    .map(edge => edge.node.originalSrc)
    .filter(url => isValidImageUrl(url))
    .map(url => ({ type: "image_url", image_url: { url } }));
}

async function describeImages(product) {
  const prompt = `Describe the main product details visible in the images for "${product.title}". Focus on design, shape, colors and unique attributes.`;
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        ...composeImageMessages(product)
      ]
    }
  ];
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages
  });
  return res.choices?.[0]?.message?.content?.trim() ?? "";
}

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
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });
  const out = res.choices?.[0]?.message?.content?.trim();
  return out === "None" ? null : out;
}

/* ----------------------------------------------------------------- */


export default async function processShopifyImages({ shopifyDomain, shopifyToken, dbName, categories }) {
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
// Using storeConfig to build the correct endpoint
const endpoint = `https://${shopifyDomain}.myshopify.com/admin/api/2025-01/graphql.json`;
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Access-Token': shopifyToken,
    'Content-Type': 'application/json',
  },
});

  // GraphQL query to fetch products (adjust fields as needed)
  const query = gql`
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            onlineStoreUrl
            handle
            images(first: 5) {
              edges {
                node {
                  originalSrc
                }
              }
            }
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
        const description = await describeImages(prod);
        const embedding = await embed(description);
        const category = await classify(description, prod.title, categories);
        const price = prod.priceRange?.minVariantPrice?.amount || 0;
        const image = prod.images?.edges?.[0]?.node?.originalSrc || null;
        const url = prod.onlineStoreUrl || `https://${shopifyUrl}/products/${prod.handle}`;

        await productsCol.updateOne(
          { id: prod.id },
          {
            $set: {
              name: prod.title,
              description1: description,
              embedding,
              category,
              price: Number(price),
              image,
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