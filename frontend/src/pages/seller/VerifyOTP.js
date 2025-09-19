import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

const VerifyOTP = () => {
  const navigate = useNavigate();
  
  // Automatically redirect to customer orders page
  useEffect(() => {
    navigate('/seller/customer-orders');
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="Redirecting to Order Confirmation"
        subtitle="Please wait..."
        showBackButton={true}
        backButtonPath="/seller/dashboard"
      />
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-6 text-center">
        <p>Redirecting to order confirmation page...</p>
      </div>
    </div>
  );
};

export default VerifyOTP;