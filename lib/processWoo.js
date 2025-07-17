const { MongoClient } = require("mongodb");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { OpenAI } = require("openai");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { parse } = require("node-html-parser");
const { GoogleGenAI, Type } = require('@google/genai');

const MONGO_URI = process.env.MONGODB_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: OPENAI_API_KEY,
});

// Initialize Google AI if you have the API key
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_AI_API_KEY || "YOUR_GOOGLE_AI_KEY"});

/** Update progress in sync_status collection */
async function updateProgress(client, dbName, processedCount, totalProducts) {
  try {
    await client
      .db("users")
      .collection("sync_status")
      .updateOne(
        { dbName },
        { 
          $set: { 
            processedCount,
            totalProducts,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
  } catch (error) {
    console.error("Failed to update progress:", error);
  }
}

/** Convert HTML to plain text */
function parseHtmlToPlainText(html) {
  if (!html) return "";
  
  const root = parse(html);
  let text = root.textContent || root.innerHTML || "";
  
  // Fallback: manual HTML tag removal
  if (!text) {
    text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  console.log("🔍 HTML input length:", html?.length || 0);
  console.log("🔍 Extracted text length:", text?.length || 0);
  
  return text;
}

/** Translate description using OpenAI */
async function translateDescription(description) {
  console.log("🌐 Translation input length:", description?.length || 0);
  
  if (!description || description.trim() === "") {
    console.log("❌ No description provided to translate");
    return null;
  }

  try {
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Translate the following text to English:\n\n${description}`,
        },
      ],
    });
    
    const translated = translationResponse.choices?.[0]?.message?.content?.trim();
    
    console.log("🌐 Translation result length:", translated?.length || 0);
    
    if (!translated || translated === "") {
      console.warn("⚠️ Empty translation result");
      return null;
    }
    
    return translated;
  } catch (error) {
    console.error("❌ Translation failed:", error.message);
    return null;
  }
}

/**
 * Use GPT to iterate over product metadata and return a summary
 * of important details for embedding.
 */
async function summarizeMetadata(metadata) {
  if (!metadata || !Array.isArray(metadata)) return '';
  
  try {
    const metadataString = JSON.stringify(metadata);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [
        {
          role: 'user',
          content: `Given the following product metadata in JSON format, iterate over each key-value pair and output a summary string that only includes the important details for product embedding. 
Metadata: ${metadataString}
Only include details that are relevant for product description embedding. Please provide only the values of the keys, not the keys themselves.`,
        },
      ],
    });
    return response.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.warn('Metadata summarization failed:', error.message);
    return '';
  }
}

/** Generate embeddings using OpenAIEmbeddings */
async function generateEmbeddings(translatedText) {
  if (!translatedText) return null;
  try {
    const result = await embeddings.embedQuery(translatedText);
    return result;
  } catch (error) {
    console.warn("❌ Embedding generation failed:", error.message);
    return null;
  }
}

/**
 * Use Google Gemini to determine product category and type based on enriched text.
 */
async function classifyCategoryAndTypeWithGemini(enrichedText, productName) {
  try {
    const messages = [
      {
        role: "user",
        parts: [{
          text: `You are an advanced AI model specialized in e-commerce.
Given the following product details:
${enrichedText}
Determine which category the product should belong to from the following list: "יין לבן, יין אדום, יין רוזה, יין מבעבע, יין כתום, ליקר, וויסקי, וודקה, טקילה, מזקל, קוניאק, בירה, קוקטייל, רום, ג׳ין, סאקה, אפריטיף, דג׳יסטיף, ביטר, מארז, יין, קוקטייל".
Also determine whether the product qualifies as "כשר" and/or "מבצע", and return those as an array.
Return ONLY a JSON object with two keys: "category" and "type". For example:
{"category": "יין אדום", "type": ["כשר"]}
If no category matches, return null for "category", and if neither type applies, return an empty array for "type".
Product name: ${productName}`
        }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: messages,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, nullable: true },
            type: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["category", "type"],
          propertyOrdering: ["category", "type"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("❌ Gemini classification failed:", error.message);
    // Fallback to GPT if Gemini fails
    return await classifyCategoryUsingGPT(enrichedText, productName);
  }
}

/** Fallback GPT classification */
async function classifyCategoryUsingGPT(translatedDescription, productName) {
  try {
    const categories = ["יין לבן", "יין אדום", "יין רוזה", "יין מבעבע", "יין כתום", "ליקר", "וויסקי", "וודקה", "טקילה", "מזקל", "קוניאק", "בירה", "קוקטייל", "רום", "ג'ין", "סאקה", "אפריטיף", "דג'יסטיף", "ביטר", "מארז", "יין"];
    const categoryList = categories.join(", ");
    
    const prompt = `Based on the following description, determine which category it belongs to from the list:
"${categoryList}".
Answer ONLY with the category name, nothing else!
If none fit, return "None" (exactly).

Description: ${translatedDescription}
Product name: ${productName}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    
    let category = response.choices?.[0]?.message?.content?.trim() || "";
    return { category: category === "None" ? null : category, type: [] };
  } catch (error) {
    console.warn("❌ GPT classification failed:", error.message);
    return { category: null, type: [] };
  }
}

/** Local category detection */
function updateLocalCategoryTypes(categories, description) {
  if (!Array.isArray(categories)) return [];
  
  const typeMarkers = [];
  
  for (const cat of categories) {
    if (!cat?.name) continue;
    const name = cat.name;
    
    // Skip if explicitly "לא כשר" or "Not Kosher"
    const isNotKosher = /לא\s*כשר|Not\s*Kosher/.test(name);
    
    if (!isNotKosher && /\bכשר\b|\bKosher\b/.test(name)) {
      typeMarkers.push("כשר");
    }
    
    // If the name contains "2 יינות ב" or "3 יינות ב" (or English variants)
    if (/2 יינות ב|3 יינות ב|2 Wines B|3 Wines B/.test(name)) {
      typeMarkers.push("מבצע");
    }
  }
  
  // Check description for "כשר" but not "לא כשר"
  if (description && /\bכשר\b/.test(description) && !/לא\s*כשר/.test(description)) {
    typeMarkers.push("כשר");
  }
  
  return [...new Set(typeMarkers)];
}

/** 
 * Fetch and process WooCommerce products with enrichment.
 */
async function processWooProducts({ wooUrl, wooKey, wooSecret, userEmail, categories, dbName }) {
  const logs = [];
  logs.push(`🚀 Starting enhanced WooCommerce processing for: ${userEmail}`);
  logs.push(`📦 Using database: ${dbName}`);

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    logs.push("✅ Connected to MongoDB");
  } catch (err) {
    logs.push(`❌ MongoDB connection failed: ${err.message}`);
    return logs;
  }
  
  const db = client.db(dbName);
  const collection = db.collection("products");

  const api = new WooCommerceRestApi({
    url: wooUrl,
    consumerKey: wooKey,
    consumerSecret: wooSecret,
    version: "wc/v3",
  });

  // Step 1: Fetch all products with pagination
  let allProducts = [];
  let page = 1;
  let hasMorePages = true;

  try {
    while (hasMorePages) {
      const response = await api.get("products", { 
        per_page: 100, 
        page: page,
        status: 'publish',
        stock_status: 'instock'
      });
      
      const products = response.data || [];
      if (products.length === 0) break;
      
      allProducts = allProducts.concat(products);
      logs.push(`📄 Fetched page ${page}: ${products.length} products`);
      
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
      hasMorePages = page < totalPages;
      page++;
    }
  } catch (err) {
    const errorMsg = `❌ Failed to fetch products from WooCommerce: ${err.message}`;
    logs.push(errorMsg);
    await client.close();
    return logs;
  }

  logs.push(`🔍 Total products fetched: ${allProducts.length}`);

  // Step 2: First pass - store basic product data
  const bulkOps = [];
  for (const product of allProducts) {
    const plainDescription = parseHtmlToPlainText(
      product.description || product.short_description || ""
    );

    bulkOps.push({
      updateOne: {
        filter: { id: product.id },
        update: {
          $set: {
            name: product.name,
            price: Number(product.sale_price || product.regular_price || product.price),
            stockStatus: product.stock_status === "onbackorder" ? "instock" : product.stock_status,
            onSale: product.on_sale === true,
            fetchedAt: new Date(),
            dateModified: product.date_modified,
            description: plainDescription,
            image: product.images?.[0]?.src || null,
            url: product.permalink,
            categories: product.categories || [],
            metadata: product.meta_data || [],
            notInStore: false,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps, { ordered: false });
    logs.push(`💾 Bulk saved ${bulkOps.length} products to database`);
  }

  // Step 3: Process products for translation, enrichment, and embeddings
  const productsToProcess = await collection.find({
    $or: [
      { embedding: { $exists: false } },
      { category: { $exists: false } },
      { description1: { $exists: false } }
    ],
    $and: [{ stockStatus: "instock" }]
  }).toArray();

  logs.push(`🔄 Processing ${productsToProcess.length} products for enrichment`);

  // Initialize progress tracking
  const totalProducts = productsToProcess.length;
  let processedCount = 0;
  
  // Update initial progress
  await updateProgress(client, dbName, processedCount, totalProducts);

  for (const product of productsToProcess) {
    try {
      logs.push(`\n🟡 Processing: ${product.name} (ID: ${product.id})`);
      
      const { _id, name, description, categories: productCategories, metadata, onSale } = product;
      
      if (!description || description.trim() === "") {
        logs.push("⚠️ Skipping - no description");
        continue;
      }

      // 1) Translate description to English
      const translatedDescription = await translateDescription(description);
      if (!translatedDescription) {
        logs.push("⚠️ Skipping - translation failed");
        continue;
      }
      logs.push("✅ Translation completed");

      // 2) Summarize metadata
      let metadataAppend = '';
      if (metadata && Array.isArray(metadata)) {
        const summarization = await summarizeMetadata(metadata);
        metadataAppend = summarization;
      }

      // 3) Extract category names
      let categoryAppend = '';
      if (productCategories && Array.isArray(productCategories)) {
        categoryAppend = productCategories
          .filter(cat => cat.name)
          .map(cat => cat.name)
          .join('\n');
      }

      // 4) Create enriched translation
      const enrichedTranslation = `${translatedDescription}\n\n${metadataAppend}\n\n${categoryAppend}`.trim();
      logs.push("✅ Enrichment completed");

      // 5) Use Gemini/GPT to classify category and type
      const classificationResult = await classifyCategoryAndTypeWithGemini(enrichedTranslation, name);
      const gptCategory = classificationResult.category;
      let productType = classificationResult.type || [];

      // 6) Add local category detection
      const localTypes = updateLocalCategoryTypes(productCategories, description);
      productType = [...new Set([...productType, ...localTypes])];

      // 7) Add sale type if product is on sale
      if (onSale && !productType.includes('מבצע')) {
        productType.push('מבצע');
      }

      logs.push(`✅ Classification: ${gptCategory || 'None'}, Types: ${productType.join(', ') || 'None'}`);

      // 8) Generate embeddings
      const embedding = await generateEmbeddings(enrichedTranslation);
      if (!embedding) {
        logs.push("⚠️ Warning - embedding generation failed");
      } else {
        logs.push("✅ Embedding generated");
      }

      // 9) Update the document
      const updateDoc = {
        embedding: embedding,
        description1: enrichedTranslation,
        type: productType,
        category: gptCategory,
        categoriesFromUser: categories,
      };

      await collection.updateOne({ _id }, { $set: updateDoc });
      logs.push(`💾 Updated product: ${name}`);

    } catch (error) {
      const errMsg = `❌ Error processing ${product.name}: ${error.message}`;
      logs.push(errMsg);
      console.error("Full error:", error);
    }
    
    // Update progress after processing each product
    processedCount++;
    await updateProgress(client, dbName, processedCount, totalProducts);
  }

  await client.close();
  logs.push(`✅ Enhanced WooCommerce processing complete for: ${userEmail}`);
  logs.push(`📊 Total processed: ${allProducts.length} products`);
  return logs;
}

module.exports = processWooProducts;