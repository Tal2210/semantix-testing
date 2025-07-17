"use client";

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import useUserDetails from '../hooks/useUserDetails';

export default function TrialBanner() {
  const { 
    trialDaysRemaining, 
    trialStatus, 
    isTrialActive, 
    isTrialExpired,
    trialStartedAt,
    trialExpiresAt,
    loading 
  } = useUserDetails();

  // Don't show banner if loading or no trial info
  if (loading || trialStatus === 'no_trial') {
    return null;
  }

  // Don't show if user has an active subscription (not on trial)
  if (trialStatus === 'subscribed') {
    return null;
  }

  // Trial expired
  if (isTrialExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Trial Expired
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Your 14-day trial has ended. Please subscribe to continue using Semantix AI Search.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  // Active trial
  if (isTrialActive) {
    const urgencyLevel = trialDaysRemaining <= 3 ? 'urgent' : trialDaysRemaining <= 7 ? 'warning' : 'normal';
    
    const colors = {
      urgent: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      normal: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconColors = {
      urgent: 'text-red-500',
      warning: 'text-yellow-500',
      normal: 'text-blue-500'
    };

    return (
      <div className={`${colors[urgencyLevel]} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center">
          <Clock className={`h-5 w-5 ${iconColors[urgencyLevel]} mr-3`} />
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your trial
            </h3>
            <p className="text-sm mt-1">
              {trialExpiresAt && (
                <>Trial expires on {trialExpiresAt.toLocaleDateString()}. </>
              )}
              Subscribe to continue using all features.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Optional: Trial info component for settings/dashboard
export function TrialInfo() {
  const { 
    trialDaysRemaining, 
    trialStatus, 
    isTrialActive, 
    isTrialExpired,
    trialStartedAt,
    trialExpiresAt,
    loading 
  } = useUserDetails();

  if (loading || trialStatus === 'no_trial') {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Trial Information</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Trial Status:</span>
          <span className={`font-medium ${
            isTrialActive ? 'text-green-600' : 
            isTrialExpired ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {isTrialActive ? 'Active' : isTrialExpired ? 'Expired' : trialStatus}
          </span>
        </div>
        
        {trialStartedAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Trial Started:</span>
            <span className="font-medium">{trialStartedAt.toLocaleDateString()}</span>
          </div>
        )}
        
        {trialExpiresAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Trial Expires:</span>
            <span className="font-medium">{trialExpiresAt.toLocaleDateString()}</span>
          </div>
        )}
        
        {isTrialActive && (
          <div className="flex justify-between">
            <span className="text-gray-600">Days Remaining:</span>
            <span className={`font-medium ${
              trialDaysRemaining <= 3 ? 'text-red-600' : 
              trialDaysRemaining <= 7 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {trialDaysRemaining}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 