import React from 'react';

const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <div
        className="animate-spin rounded-full border-t-2 border-b-2 border-primary-blue"
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;