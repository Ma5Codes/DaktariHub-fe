// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-gray-300 border-t-blue-600`}></div>
        <span className="text-gray-600 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;