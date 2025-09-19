import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  // Determine the size of the spinner
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }[size];

  // The spinner component
  const spinner = (
    <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
      role="status"
      aria-label="loading"
      style={{ color: 'var(--color-primary-600)' }}
>
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
  );

  // If fullPage is true, center the spinner on the page
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  // Otherwise, just return the spinner
  return spinner;
};

export default LoadingSpinner;