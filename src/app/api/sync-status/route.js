import { getServerSession }   from "next-auth";
import { authOptions }        from "../auth/[...nextauth]/route";
import clientPromise          from "/lib/mongodb";

/* GET /api/sync-status?dbName=<n> */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  const email   = session?.user?.email;
  console.log("[sync-status]", email);
  if (!email) return Response.json({ error:"Unauthorized" }, { status:401 });

  const { searchParams } = new URL(req.url);
  const dbName = searchParams.get("dbName") || "users"; // Default to "users" if not provided

  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Get the sync status from users.sync_status collection
    const statusDoc = await client
      .db("users")
      .collection("sync_status")
      .findOne({ dbName }, { projection: { _id: 0, state: 1, processedCount: 1, totalProducts: 1, progress: 1 } });

    // Use real-time progress data if available, otherwise calculate from database
    let totalProducts = statusDoc?.totalProducts;
    let processedCount = statusDoc?.processedCount;

    // Fall back to database queries if real-time data is not available
    if (typeof totalProducts !== 'number') {
      totalProducts = await db.collection("products").countDocuments();
    }

    if (typeof processedCount !== 'number') {
      processedCount = await db
        .collection("products")
        .countDocuments({ 
          $or: [
            { embedding: { $exists: true, $ne: null } }
          ],
          fetchedAt: { $exists: true }
        });
    }

    return Response.json({ 
      state: statusDoc?.state ?? "idle", 
      progress: statusDoc?.progress ?? 0,
      totalProducts,
      processedCount
    });
  } catch (e) {
    console.error("[sync-status]", e);
    return Response.json({ 
      state:"error", 
      progress: 0,
      totalProducts: 0,
      processedCount: 0
    });
  }
}