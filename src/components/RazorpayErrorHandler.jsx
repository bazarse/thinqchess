"use client";
import React from 'react';

const RazorpayErrorHandler = ({ error, onRetry, onCancel }) => {
  const getErrorMessage = (error) => {
    if (!error) return 'Payment failed. Please try again.';
    
    const errorCode = error.code || error.error?.code;
    const errorDescription = error.description || error.error?.description || error.reason;
    
    switch (errorCode) {
      case 'BAD_REQUEST_ERROR':
        return 'Invalid payment details. Please check your information and try again.';
      case 'GATEWAY_ERROR':
        return 'Payment gateway error. Please try again or use a different payment method.';
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection and try again.';
      case 'SERVER_ERROR':
        return 'Server error occurred. Please try again after some time.';
      case 'INVALID_PIN':
        return 'Invalid PIN entered. Please enter the correct PIN for your card.';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds in your account. Please check your balance or use a different payment method.';
      case 'CARD_DECLINED':
        return 'Your card was declined. Please contact your bank or use a different card.';
      case 'EXPIRED_CARD':
        return 'Your card has expired. Please use a different card.';
      case 'INVALID_CVV':
        return 'Invalid CVV entered. Please check your card details and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Payment authentication failed. Please verify your details and try again.';
      case 'PAYMENT_CANCELLED':
        return 'Payment was cancelled by user.';
      case 'PAYMENT_TIMEOUT':
        return 'Payment timed out. Please try again.';
      default:
        if (errorDescription) {
          return errorDescription;
        }
        return 'Payment failed. Please try again or contact support if the issue persists.';
    }
  };

  const getErrorIcon = (error) => {
    const errorCode = error?.code || error?.error?.code;
    
    switch (errorCode) {
      case 'INVALID_PIN':
      case 'INVALID_CVV':
      case 'AUTHENTICATION_ERROR':
        return '🔐';
      case 'INSUFFICIENT_FUNDS':
        return '💳';
      case 'NETWORK_ERROR':
        return '🌐';
      case 'CARD_DECLINED':
      case 'EXPIRED_CARD':
        return '❌';
      case 'PAYMENT_CANCELLED':
        return '⏹️';
      case 'PAYMENT_TIMEOUT':
        return '⏰';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {getErrorIcon(error)}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Failed
          </h3>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              className="flex-1 bg-[#2B3AA0] text-white px-4 py-2 rounded-lg hover:bg-[#1e2a70] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {error?.code === 'INVALID_PIN' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Make sure you're entering the correct PIN for your card. 
                If you've forgotten your PIN, contact your bank.
              </p>
            </div>
          )}
          
          {(error?.code === 'NETWORK_ERROR' || error?.code === 'GATEWAY_ERROR') && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Check your internet connection and try again. 
                If the problem persists, try using a different network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RazorpayErrorHandler;