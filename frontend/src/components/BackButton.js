import { useLocation, useNavigate } from 'react-router-dom';

const BackButton = ({ customPath, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're in customer or seller section
  const isSellerSection = location.pathname.includes('/seller');
  const isCustomerSection = location.pathname.includes('/customer');
  
  // Determine button color based on section
  const buttonColor = isSellerSection 
    ? 'text-seller-600 hover:text-seller-800 bg-seller-50 hover:bg-seller-100' 
    : isCustomerSection 
      ? 'text-customer-600 hover:text-customer-800 bg-customer-50 hover:bg-customer-100'
      : 'text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100';
  
  const handleBack = () => {
    if (customPath) {
      navigate(customPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${buttonColor} ${className || ''}`}
    >
      <svg 
        className="h-5 w-5 mr-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      Back
    </button>
  );
};

export default BackButton;