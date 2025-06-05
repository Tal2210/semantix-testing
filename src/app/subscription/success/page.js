/* File: app/subscription/success/page.jsx */

"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaddleSubscriptionSuccess() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // Extract checkout details from query string
  const checkoutId = searchParams.get('checkout_id');
  const plan = searchParams.get('plan');

  useEffect(() => {
    // Paddle checkout success
    console.log('✅ Paddle subscription successful!', { checkoutId, plan });
    // Simulate waiting for your backend webhook or data refresh
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, [checkoutId, plan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-gray-600">Processing your subscription...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your premium features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">🎉 Welcome to Premium!</h1>
        <p className="text-gray-600 mb-4">Your subscription has been activated successfully.</p>

        {/* Display checkout info if available */}
        {checkoutId && (
          <p className="text-sm text-gray-500 mb-4">
            Checkout ID: <span className="font-mono">{checkoutId}</span>
          </p>
        )}
        {plan && (
          <p className="text-sm text-gray-500 mb-6">
            Plan: <span className="font-medium capitalize">{plan}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/onboarding"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Continue Setup
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">Powered by Paddle • Secure payments</p>
      </motion.div>
    </div>
  );
}