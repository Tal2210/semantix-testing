export const SUBSCRIPTION_TIERS = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    priceId: null, // Free tier doesn't need a price ID
    features: [
      'Up to 100 searches per month',
      'Basic product recommendations',
      'Standard search accuracy',
      'Email support',
      'Basic analytics dashboard'
    ],
    popular: false
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 99,
    priceId: 'pri_01jw1ec6avbnxq701j8dpkm4m6', // Main price ID for Premium tier
    features: [
      'Unlimited searches',
      'Advanced AI recommendations',
      'Enhanced search accuracy',
      'Priority support',
      'Advanced analytics & insights',
      'Custom integrations',
      'A/B testing tools',
      'Revenue tracking'
    ],
    popular: true
  }
};

// Helper function to get all price IDs for a given tier
export function getAllPriceIdsForTier(tier) {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return [];
  
  const allIds = [tierConfig.priceId];
  if (tierConfig.additionalPriceIds && Array.isArray(tierConfig.additionalPriceIds)) {
    allIds.push(...tierConfig.additionalPriceIds);
  }
  
  return allIds.filter(id => id !== null);
}
