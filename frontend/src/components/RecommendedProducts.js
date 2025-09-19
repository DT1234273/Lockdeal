import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { recommendationsAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setIsLoading(true);
      try {
        const data = await recommendationsAPI.getRecommendedProducts(4);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        // Don't show toast for recommendations as it's not critical
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No recommendations available yet. Start rating products to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link 
          to={`/product/${product.id}`} 
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:scale-105"
        >
          <div className="h-48 overflow-hidden">
            <img 
              src={product.image_url || '/placeholder-product.jpg'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 truncate">{product.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-primary-600 font-bold">₹{product.price}/{product.unit}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecommendedProducts;