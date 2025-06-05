import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { ObjectId } from "mongodb";

import clientPromise from "/lib/mongodb"; // ✅ FIX path
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Your username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db("users"); // Use explicit database name
        const user = await db.collection("users").findOne({ username: credentials.username });
        if (!user) throw new Error("No user found with that username");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id,
          name: user.username,
          dbName: user.dbName || "defaultDb",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // Force account selection every time
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  adapter: MongoDBAdapter(clientPromise),

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,

  callbacks: {
    async jwt({ token, user }) {
     const client = await clientPromise;
        const doc = await client
          .db("users")
          .collection("users")
          .findOne({ email: token.email }, { projection:{ onboardingComplete:1 } });

        token.onboardingComplete = doc?.onboardingComplete ?? false;
      return token;
    },
    async session({ session, token }) {
      session.user.onboardingComplete = token.onboardingComplete;
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      console.log("🔥 createUser triggered for:", user.email);
      console.log("User data:", user);
      console.log("User ID:", user.id);
  
      const client = await clientPromise;
      const db = client.db("users"); // Use explicit database name
  
      const apiKey = `semantix_${user.id}_${Date.now()}`;
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) }, // ✅ הפוך את המזהה ל-ObjectId
        {
          $set: {
            apiKey,
            tier: "basic",
            onboardingComplete: false,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    },
  },
  
  debug: true,

  pages: {
    signIn: "/",
    signOut: "/",
    error: "/", // You can improve this later
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
