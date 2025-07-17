import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "/lib/mongodb";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbName, productId, updates } = await request.json();
    
    if (!dbName || !productId || !updates) {
      return Response.json({ 
        error: "Database name, product ID, and updates are required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    // Prepare the update object
    const updateObject = {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    };

    // Update the product
    const result = await collection.updateOne(
      { id: productId },
      updateObject
    );

    if (result.matchedCount === 0) {
      return Response.json({ 
        error: "Product not found" 
      }, { status: 404 });
    }

    return Response.json({ 
      success: true,
      message: "Product updated successfully",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json({ 
      error: "Failed to update product",
      details: error.message 
    }, { status: 500 });
  }
} 