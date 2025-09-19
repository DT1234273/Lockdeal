import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { ratingAPI } from '../../services/api';

const Ratings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0] // 1-5 stars
  });

  useEffect(() => {
    const fetchRatings = async () => {
      setIsLoading(true);
      try {
        const data = await ratingAPI.getSellerRatings(user.id);
        setRatings(data);
        
        // Calculate stats
        if (data.length > 0) {
          const total = data.length;
          const sum = data.reduce((acc, rating) => acc + rating.score, 0);
          const average = sum / total;
          
          // Calculate distribution
          const distribution = [0, 0, 0, 0, 0];
          data.forEach(rating => {
            distribution[rating.score - 1]++;
          });
          
          setStats({
            average,
            total,
            distribution
          });
        }
      } catch (error) {
        toast.error('Failed to load ratings');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      fetchRatings();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="Customer Ratings"
        subtitle="View feedback from your customers"
        showBackButton={true}
        backButtonPath="/seller/dashboard"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Rating summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Rating Summary</h2>
            
            {isLoading ? (
              <p className="text-center py-4">Loading...</p>
            ) : ratings.length > 0 ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="text-4xl font-bold text-yellow-500 mr-3">
                    {stats.average.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className={`h-5 w-5 ${star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{stats.total} ratings</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[star - 1];
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center">
                        <div className="w-12 text-sm text-gray-600">{star} star</div>
                        <div className="flex-1 mx-3">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-9 text-sm text-gray-600 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No ratings yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  Ratings will appear here after customers pick up their orders.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Rating list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
            
            {isLoading ? (
              <p className="text-center py-4">Loading...</p>
            ) : ratings.length > 0 ? (
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`h-5 w-5 ${star <= rating.score ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm font-medium">{rating.user?.name || 'Anonymous User'}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(rating.created_at)}</span>
                    </div>
                    
                    {rating.feedback && (
                      <p className="mt-3 text-gray-700">{rating.feedback}</p>
                    )}
                    
                    {rating.product && (
                      <div className="mt-3 text-sm text-gray-500">
                        Product: {rating.product.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  When customers leave reviews, they'll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;