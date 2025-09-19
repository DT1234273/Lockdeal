import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { ratingAPI } from '../../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Assuming there's an API endpoint to get user's reviews
        const data = await ratingAPI.getMyRatings();
        setReviews(data || []);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast.error('Failed to load your reviews');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="My Reviews"
        subtitle="View and manage your product and seller reviews"
        showBackButton={true}
        backButtonPath="/customer/dashboard"
        className="p-8 bg-gradient-to-r from-customer-600 to-customer-500 text-white rounded-xl shadow-lg mb-8"
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-customer-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">You haven't submitted any reviews for products or sellers yet.</p>
          <button 
            onClick={() => window.location.href = '/customer/products'}
            className="btn-primary py-3 px-6 rounded-lg transition-all hover:shadow-lg"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{review.product_name || 'Product'}</h3>
                    <p className="text-sm text-gray-500">{review.seller_name || 'Seller'}</p>
                  </div>
                  <span className="bg-customer-100 text-customer-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                
                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>
                
                <p className="text-gray-700 mb-4">{review.feedback || 'No feedback provided'}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button className="text-customer-600 hover:text-customer-800 text-sm font-medium flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;