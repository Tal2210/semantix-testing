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
      className="hidden sm:inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full hover:shadow-lg transition-all duration-300 text-sm font-medium"
    >
      Get Started
    </Link>
  );
} 