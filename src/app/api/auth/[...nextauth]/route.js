// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "/lib/mongodb.js"; // Adjust path if necessary
import bcrypt from "bcryptjs";
import next from "next";

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
        const db = client.db("users"); // Connect to your "users" database
        const user = await db.collection("users").findOne({ username: credentials.username });
        if (!user) {
          throw new Error("No user found with that username");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        return { id: user._id, name: user.username, dbName: user.dbName || "defaultDb" };
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  session: { strategy: "jwt" }, // Use JWT session strategy instead of database sessions
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.dbName = user.dbName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.dbName = token.dbName;
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",  // Error code passed in query string as ?error=
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };