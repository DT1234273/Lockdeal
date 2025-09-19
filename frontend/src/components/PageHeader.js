import BackButton from './BackButton';

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backButtonPath,
  children,
  className = ''
}) => {
  // Determine if we're in customer or seller section based on the current URL
  const isSellerSection = window.location.pathname.includes('/seller');
  const isCustomerSection = window.location.pathname.includes('/customer');
  
  // Set gradient based on section
  const headerGradient = isSellerSection
    ? 'from-seller-50 to-white border-seller-100'
    : isCustomerSection
      ? 'from-customer-50 to-white border-customer-100'
      : 'from-primary-50 to-white border-primary-100';
  
  // Set text color based on section
  const titleColor = isSellerSection
    ? 'text-seller-800'
    : isCustomerSection
      ? 'text-customer-800'
      : 'text-primary-800';

  return (
    <div className={`bg-gradient-to-r ${headerGradient} rounded-xl shadow-sm p-6 mb-6 border ${className}`}>
      <div className="flex flex-col space-y-4">
        {showBackButton && (
          <div className="-mt-1 -ml-1">
            <BackButton customPath={backButtonPath} />
          </div>
        )}
        
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${titleColor}`}>{title}</h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;