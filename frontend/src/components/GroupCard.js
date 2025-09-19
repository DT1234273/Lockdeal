import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ratingAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const GroupCard = ({ group, onStatusChange }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pickup verification functionality removed

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    setIsSubmittingRating(true);
    try {
      await ratingAPI.createRating({
        seller_id: group.seller_id,
        score: rating,
        feedback,
        product_id: group.product.id,
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Determine card color based on status
  const getCardClass = () => {
    if (group.is_completed) return 'border-green-500';
    if (group.is_locked) return 'border-yellow-500';
    return 'border-gray-300';
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${getCardClass()}`}>
        <div className="p-4">
          {/* Group header with status */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{group.product?.name || 'Product'}</h3>
            <div>
              {group.is_completed ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              ) : group.is_locked ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Locked
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Group details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Your Quantity:</span>
              <span>{group.user_quantity} {group.product?.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Your Total:</span>
              <span>₹{(group.user_quantity * group.product?.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Group Members:</span>
              <span>{group.members}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Group Total:</span>
              <span>₹{group.total_price?.toFixed(2)}</span>
            </div>
            {group.locked_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Locked On:</span>
                <span>{formatDate(group.locked_at)}</span>
              </div>
            )}
            {group.seller && (
              <div className="flex justify-between">
                <span className="text-gray-500">Seller:</span>
                <span>{group.seller.shop_name}</span>
              </div>
            )}
          </div>

          {/* Progress bar for active groups */}
          {!group.is_locked && !group.is_completed && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress: ₹{group.total_price?.toFixed(2)}</span>
                <span>Goal: ₹1,000</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary-500 rounded-full" 
                  style={{ width: `${Math.min((group.total_price / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{group.members} members</span>
                <span>Goal: 10 members</span>
              </div>
            </div>
          )}

          {/* Action buttons based on status */}
          <div className="mt-4">
            {/* Pickup verification button removed */}

            {group.is_locked && !group.is_completed && !group.is_accepted && (
              <div className="text-center py-2 px-4 bg-yellow-50 text-yellow-700 rounded">
                Waiting for seller to accept
              </div>
            )}

            {group.is_completed && !group.has_rating && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="btn-primary w-full"
              >
                Rate Seller
              </button>
            )}

            {group.is_completed && group.has_rating && (
              <div className="text-center py-2 px-4 bg-green-50 text-green-700 rounded">
                Order completed & rated
              </div>
            )}
          </div>

          {/* Seller details for locked groups */}
          {group.is_locked && group.seller && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <h4 className="font-medium mb-2">Pickup Details</h4>
              <p><span className="text-gray-500">Shop:</span> {group.seller.shop_name}</p>
              <p><span className="text-gray-500">Address:</span> {group.seller.address}</p>
              <p><span className="text-gray-500">Contact:</span> {group.seller.contact}</p>
              <p className="mt-2 text-xs text-gray-500">
                {group.is_accepted 
                  ? 'Visit the shop on pickup day.'
                  : 'Waiting for seller to accept the group order.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pickup verification modal removed */}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => !isSubmittingRating && setShowRatingModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Your Experience</h3>
                <p className="mb-4 text-sm text-gray-600">
                  How was your experience with {group.seller?.shop_name}?
                </p>
                
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="mx-1 focus:outline-none"
                    >
                      <svg 
                        className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    rows="3"
                    className="form-input"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience..."
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={handleSubmitRating}
                  disabled={isSubmittingRating}
                >
                  {isSubmittingRating ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    'Submit Rating'
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowRatingModal(false)}
                  disabled={isSubmittingRating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupCard;