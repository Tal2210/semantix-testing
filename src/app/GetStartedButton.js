"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function GetStartedButton() {
  const { data: session } = useSession();

  // Don't render anything if user is logged in
  if (session) {
    return null;
  }

  // Only show Get Started button for non-logged in users
  return (
    <Link 
      href="/login" 
      className="hidden sm:inline-flex bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
    >
      Get Started
    </Link>
  );
} 