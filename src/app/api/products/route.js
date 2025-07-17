import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "/lib/mongodb";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbName } = await request.json();
    if (!dbName) {
      return Response.json({ error: "Database name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    // Fetch all products with pagination support
    const products = await collection
      .find({})
      .sort({ fetchedAt: -1 }) // Sort by most recently fetched
      .limit(1000) // Limit to prevent memory issues
      .toArray();

    // Transform the data for frontend consumption
    const transformedProducts = products.map(product => ({
      id: product.id || product._id,
      name: product.name || product.title,
      description: product.description,
      description1: product.description1, // Enhanced description
      category: product.category,
      type: product.type,
      price: product.price,
      image: product.image,
      url: product.url,
      stockStatus: product.stockStatus,
      onSale: product.onSale,
      embedding: product.embedding ? true : false, // Don't send the actual embedding
      fetchedAt: product.fetchedAt,
      categories: product.categories,
      metadata: product.metadata
    }));

    return Response.json({ 
      products: transformedProducts,
      total: transformedProducts.length
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json({ 
      error: "Failed to fetch products",
      details: error.message 
    }, { status: 500 });
  }
} 