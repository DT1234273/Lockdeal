import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MyDeals from '../../components/customer/MyDeals';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { groupAPI, productAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsData = await productAPI.getAllProducts();
        setProducts(productsData.slice(0, 6)); // Show only 6 products on dashboard

        // Fetch user's groups
        const groupsData = await groupAPI.getMyGroups();
        setUserGroups(groupsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not locked yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Function to check if today is weekend (Saturday or Sunday)
  const isWeekend = () => {
    const today = new Date().getDay();
    return today === 6 || today === 0; // 6 is Saturday, 0 is Sunday
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title={`Welcome ${user?.name || 'Customer'}!`}
        subtitle="Join product groups to get amazing discounts on local products. Groups lock every Saturday when they reach ₹1000 total value and 10+ members."
        showBackButton={true}
        className="p-8 bg-gradient-to-r from-customer-600 to-customer-500 text-white rounded-xl shadow-lg"
        backButtonPath="/"
      >
        <div className="flex justify-center md:justify-start mt-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-customer-600 animate-bounce-in shadow-md">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </PageHeader>
      
      {/* My Deals */}
      <MyDeals />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Left column - User stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 duration-300">
          <h2 className="text-xl font-semibold mb-4 text-customer-700 flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Your Stats
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-customer-50 rounded-lg border-l-4 border-customer-500">
              <span className="text-gray-700 font-medium">Active Groups</span>
              <span className="font-bold text-lg text-customer-600 bg-white py-1 px-3 rounded-full shadow-sm">
                {userGroups.filter(g => !g.locked_at).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-customer-50 rounded-lg border-l-4 border-customer-500">
              <span className="text-gray-700 font-medium">{isWeekend() ? 'Locked' : 'Unlock'} Groups</span>
              <span className="font-bold text-lg text-customer-600 bg-white py-1 px-3 rounded-full shadow-sm">
                {userGroups.filter(g => g.locked_at).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-customer-50 rounded-lg border-l-4 border-green-500">
              <span className="text-gray-700 font-medium">Total Savings</span>
              <span className="font-bold text-lg text-green-600 bg-white py-1 px-3 rounded-full shadow-sm">₹{userGroups.reduce((acc, group) => {
                // Calculate approximate savings (10% of total)
                return acc + (group.total_price * 0.1);
              }, 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/customer/group-status" className="btn-secondary w-full text-center py-3 rounded-lg flex items-center justify-center font-medium transition-all hover:shadow-lg">
              View All Groups
            </Link>
          </div>
        </div>

        {/* Middle column - Recent groups */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Recent Groups</h2>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : userGroups.length > 0 ? (
            <div className="space-y-4">
              {userGroups.slice(0, 3).map((group) => (
                <div key={group.id} className="border rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{group.product.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${group.locked_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {group.locked_at ? (isWeekend() ? 'Locked' : 'Unlock') : 'Active'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total: ₹{group.total_price}</span>
                      <span>Members: {group.members}</span>
                    </div>
                    <div className="mt-1">
                      <span>{isWeekend() ? 'Locked' : 'Unlock'}: {formatDate(group.locked_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/customer/group-status" className="block text-center text-primary-600 hover:text-primary-500 text-sm font-medium mt-2">
                View all groups →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
              <Link to="/customer/products" className="btn-primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>

        {/* Right column - Featured products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Products</h2>
            <Link to="/customer/products" className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center">
              View all
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 mx-auto text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 flex items-center hover:shadow-md transition-shadow duration-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-md mr-4 overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-primary-600 font-medium">₹{product.price} per {product.unit}</p>
                      <Link to="/customer/products" className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors duration-200">
                        Join Group
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Sold by: {product.seller?.shop_name || 'Local Market'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">No products available at the moment.</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for new arrivals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;