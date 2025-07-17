import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function useUserDetails() {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUserDetails = useCallback(async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/get-onboarding');
      const data = await response.json();
      
      if (data.onboarding) {
        const user = data.onboarding;
        
        // Calculate trial information
        const trialInfo = calculateTrialInfo(user);
        
        setUserDetails({
          ...user,
          ...trialInfo
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) {
      setUserDetails(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchUserDetails();
  }, [session]);

  const fetchUserDetails = async () => {
    try {
      console.log('🔍 Fetching user details...');
      
      const response = await fetch('/api/subscription-status');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User details fetched:', data);
        
        setUserDetails({
          tier: data.tier || 'free',
          subscriptionStatus: data.subscriptionStatus,
          paddleSubscriptionId: data.paddleSubscriptionId,
          nextBillDate: data.nextBillDate,
          lastPaymentDate: data.lastPaymentDate,
          loading: false,
          error: null
        });
      } else {
        console.log('⚠️ Failed to fetch user details:', response.status);
        setUserDetails(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch user details'
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      setUserDetails(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  return {
    userDetails,
    // ... existing returns ...
    // Add trial-specific returns
    trialDaysRemaining: userDetails?.trialDaysRemaining || 0,
    trialStatus: userDetails?.trialStatus || 'unknown',
    isTrialActive: userDetails?.isTrialActive || false,
    isTrialExpired: userDetails?.isTrialExpired || false,
    trialStartedAt: userDetails?.trialStartedAt,
    trialExpiresAt: userDetails?.trialExpiresAt,
    loading,
    refreshUserDetails
  };
}

// Helper function to calculate trial information
function calculateTrialInfo(user) {
  const TRIAL_DURATION_DAYS = 14;
  const now = new Date();
  
  // If no trial start date, return default values
  if (!user.trialStartedAt) {
    return {
      trialDaysRemaining: 0,
      trialStatus: 'no_trial',
      isTrialActive: false,
      isTrialExpired: false,
      trialStartedAt: null,
      trialExpiresAt: null
    };
  }
  
  const trialStartDate = new Date(user.trialStartedAt);
  const trialEndDate = new Date(trialStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);
  
  const millisecondsRemaining = trialEndDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24));
  
  const isTrialActive = daysRemaining > 0 && user.trialStatus === 'active';
  const isTrialExpired = daysRemaining <= 0 || user.trialStatus === 'expired';
  
  return {
    trialDaysRemaining: Math.max(0, daysRemaining),
    trialStatus: user.trialStatus || 'active',
    isTrialActive,
    isTrialExpired,
    trialStartedAt: trialStartDate,
    trialExpiresAt: trialEndDate
  };
}