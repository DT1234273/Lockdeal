import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const ProductCard = ({ product, onJoinSuccess }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  
  // Calculate total price based on quantity
  const totalPrice = product.price * quantity;
  
  const handleJoinGroup = async () => {
    if (!user) {
      toast.error('Please login to join a group');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }
    
    setIsJoining(true);
    try {
      // Check if there's an existing group for this product
      const groups = await groupAPI.getMyGroups();
      const existingGroup = groups.find(g => 
        g.product_id === product.id && 
        !g.is_locked && 
        !g.is_completed
      );
      
      if (existingGroup) {
        // Join existing group
        await groupAPI.joinGroup(existingGroup.id, quantity);
        toast.success(`Successfully joined group for ${product.name}`);
      } else {
        // Create new group
        const newGroup = await groupAPI.createGroup(product.id);
        // After creating group, join it with the selected quantity
        await groupAPI.joinGroup(newGroup.id, quantity);
        toast.success(`Created new group for ${product.name}`);
      }
      
      // Close modal and refresh data
      setShowModal(false);
      if (onJoinSuccess) onJoinSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        {/* Product image */}
        <div className="h-48 overflow-hidden bg-gray-200">
          <img 
            src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        </div>
        
        {/* Product details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-primary-600 font-bold">₹{product.price.toFixed(2)}/{product.unit}</span>
            
            {product.seller && (
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500">by {product.seller.shop_name}</span>
                {product.seller.address && (
                  <span className="text-xs text-gray-400 mt-1 line-clamp-1">{product.seller.address}</span>
                )}
              </div>
            )}
          </div>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          )}
          
          {/* Group status if available */}
          {product.active_group && (
            <div className="mb-4 bg-gray-50 p-2 rounded">
              <div className="flex justify-between text-sm">
                <span>Active Group:</span>
                <span className="font-medium">{product.active_group.members} members</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary-500 rounded-full" 
                  style={{ width: `${Math.min((product.active_group.total_price / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>₹{product.active_group.total_price.toFixed(2)}</span>
                <span>Goal: ₹1,000</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary w-full"
          >
            Join Group
          </button>
        </div>
      </div>
      
      {/* Quantity selection modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Join Group for {product.name}
                    </h3>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity ({product.unit})
                        </label>
                        <div className="flex items-center">
                          <button 
                            type="button" 
                            className="p-1 rounded-full bg-gray-200 text-gray-700"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            id="quantity"
                            min="1"
                            className="mx-2 w-16 text-center form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <button 
                            type="button" 
                            className="p-1 rounded-full bg-gray-200 text-gray-700"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Price per {product.unit}:</span>
                          <span>₹{product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-700">Quantity:</span>
                          <span>{quantity} {product.unit}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        <p>Groups lock automatically every Saturday if:</p>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          <li>Total value is ₹1,000 or more</li>
                          <li>Group has 10 or more members</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    'Join Group'
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowModal(false)}
                  disabled={isJoining}
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

export default ProductCard;