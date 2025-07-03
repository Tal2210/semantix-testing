"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SUBSCRIPTION_TIERS } from '/lib/paddle-config'; // Make sure this path is correct
import { Shield, Crown, CheckCircle, TrendingUp } from "lucide-react";

// Re-usable fullscreen message with improved styling
const FullScreenMsg = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-xl text-gray-700 font-medium shadow-lg bg-white p-8 rounded-xl">
      {children}
    </div>
  </div>
);

export default function SubscriptionPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  // Handle subscription checkout
  const handleCheckout = async (tier) => {
    setCheckoutLoading(tier);
    setMessage('');

    try {
      // 1. Load Paddle.js if needed
      if (!window.Paddle) {
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      // 2. Tell Paddle we're in sandbox mode (only if using test_ token)
      window.Paddle.Environment.set('sandbox');

      // 3. Initialize with your client-side token only
      window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY  // e.g. 'test_…'
      });

      // 4. Open overlay
      window.Paddle.Checkout.open({
        items: [{
          price_id: SUBSCRIPTION_TIERS[tier].priceId, // Use the price ID from your config
          quantity: 1
        }],
        // For a public pricing page, success might redirect to login/dashboard or a thank you page
        // If user provides email during Paddle checkout, session might be created by webhook handler
        successUrl: `${window.location.origin}/dashboard?new_subscription=true`, // Or a dedicated success page
        cancelUrl: `${window.location.origin}/subscription?checkout_canceled=true`,
        // Customer email can be pre-filled if known, but for a public page, it's often not.
        // Paddle will ask for email if not provided.
      });

    } catch (err) {
      console.error('Subscription error:', err);
      setMessage(`Failed to start checkout: ${err.message}`);
    } finally {
      setCheckoutLoading(null);
    }
  };
  
  // Check for URL parameters (e.g., from Paddle redirect)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_canceled')) {
      setMessage('Checkout process was canceled.');
    }
    if (params.get('error')) {
      setMessage(`An error occurred: ${params.get('error')}`);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      {/* Launch Era Banner */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold shadow-lg mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
          🚀 Launch Special - Everything Free!
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Complete Access During Launch Era
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Get <span className="font-bold text-purple-600">unlimited access</span> to all premium features at no cost during our launch period. 
          No credit card required, no hidden fees.
        </p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <span className="text-lg font-semibold text-green-800">Launch Era Benefits</span>
          </div>
          <ul className="text-green-700 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Unlimited searches and AI recommendations
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Advanced analytics and revenue tracking
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Priority support and custom integrations
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              A/B testing tools and advanced features
            </li>
          </ul>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl mb-8 ${
          message.includes('Failed') || message.includes('error') || message.includes('canceled')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-sm underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Launch Offer - Single Card */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative rounded-2xl border-2 border-purple-500 bg-gradient-to-b from-purple-50 to-indigo-50 shadow-2xl p-8 pt-12 transform hover:scale-105 transition-all">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold rounded-full shadow-lg">
            🚀 Launch Special
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Complete Access</h3>
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 text-xl">/month</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xl text-gray-400 line-through">$99/month</span>
                <span className="text-lg font-medium text-purple-600">Launch Special!</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Everything you need to grow your business - completely free during launch
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Unlimited searches and AI recommendations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Advanced analytics dashboard with insights</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Priority support and custom integrations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">A/B testing tools and revenue tracking</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">WooCommerce & Shopify integrations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">No usage limits or restrictions</span>
            </li>
          </ul>

          <div className="mt-auto">
            <Link href="/login">
              <button className="w-full py-4 px-6 rounded-xl font-semibold transition-all text-lg shadow-md hover:shadow-lg transform hover:translate-y-px bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                <Crown className="w-5 h-5 mr-2 inline" />
                Get Complete Access (Free)
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 
      COMMENTED OUT FOR LAUNCH - FUTURE PRICING TIERS
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-2xl border-2 p-8 pt-12 transition-all transform hover:scale-105 flex flex-col ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-indigo-50 shadow-2xl'
                  : 'border-gray-200 hover:border-indigo-300 bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
                  ⭐ Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full">
                  {plan.tier === 'free' ? (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-extrabold text-gray-900">$0</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xl text-gray-400 line-through">${plan.price}/month</span>
                    <span className="text-base font-medium text-purple-600">Free for now!</span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">
                  {plan.tier === 'free' ? 'Perfect for getting started' : 'Everything you need to grow your business'}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {plan.tier === 'free' ? (
                   <Link href="/login"> 
                    <button
                      className="w-full py-4 px-6 rounded-xl font-semibold transition-all text-lg bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-md hover:shadow-lg"
                    >
                      Get Started (Free)
                    </button>
                   </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={checkoutLoading === plan.tier}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all text-lg shadow-md hover:shadow-lg transform hover:translate-y-px ${
                      'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    } ${
                      checkoutLoading === plan.tier ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {checkoutLoading === plan.tier ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Crown className="w-5 h-5 mr-2 inline" />
                        Get Early Access
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      */}

      {/* 
      COMMENTED OUT FOR LAUNCH - FUTURE FEATURE COMPARISON TABLE
      
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white text-center">Feature Comparison</h3>
            <p className="text-purple-100 text-center mt-2">See what's included in each plan</p>
          </div>
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-lg">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-lg">Free</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-lg">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Monthly Searches</td>
                    <td className="py-4 px-6 text-center text-gray-600">100</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">AI Recommendations</td>
                    <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold">Advanced</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Analytics Dashboard</td>
                    <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold">Advanced</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Support</td>
                    <td className="py-4 px-6 text-center text-gray-600">Email</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold">Priority</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Custom Integrations</td>
                    <td className="py-4 px-6 text-center text-gray-400 text-xl">✗</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold text-xl">✓</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">A/B Testing</td>
                    <td className="py-4 px-6 text-center text-gray-400 text-xl">✗</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold text-xl">✓</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Revenue Tracking</td>
                    <td className="py-4 px-6 text-center text-gray-400 text-xl">✗</td>
                    <td className="py-4 px-6 text-center text-green-600 font-semibold text-xl">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      */}
       <div className="mt-16 text-center">
        <div className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-indigo-700 font-medium">Launch Era - No Payment Required</span>
        </div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Simply sign up to get instant access to all features. No credit card needed, no trials, no limits.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Using Semantix Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}