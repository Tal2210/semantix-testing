// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri =  'mongodb+srv://galpaz2210:HwTqxxAn6XF8xerm@cluster0.qiplrsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
