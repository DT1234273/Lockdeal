import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecommendedProducts from '../components/RecommendedProducts';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'customer' ? '/customer/dashboard' : '/seller/dashboard';
  };

  return (
    <div className={`flex flex-col min-h-screen ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 transition-all-standard">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-slide-in-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 transition-all-standard hover:text-white hover:tracking-wide">
                  Buy Together, Save Smartly
                </h1>
                <p className="text-xl mb-8 transition-all-standard">
                  Join product buying groups and purchase from local sellers at a group discount price.
                  No delivery fees – pick up your orders directly from sellers.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-bounce-in" style={{animationDelay: '0.3s'}}>
                  <Link
                    to={getDashboardLink()}
                    className="btn-primary text-center px-8 py-3 rounded-lg text-lg font-medium transition-all-standard hover:scale-105"
                  >
                    {user ? 'Go to Dashboard' : 'Get Started'}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-secondary text-center px-8 py-3 rounded-lg text-lg font-medium transition-all-standard hover:scale-105"
                  >
                    {user ? 'Browse Products' : 'Sign Up'}
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                <div className="bg-white p-6 rounded-lg shadow-xl transition-all-standard hover:shadow-2xl hover:scale-105">
                  <img
                    src="/images/group-buying-modern.svg"
                    alt="Group Buying Illustration"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/marketplace-illustration.svg';
                    }}
                  />
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 transition-all-standard hover:text-customer-600 hover:tracking-wide">How LockDeal Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all-standard hover:shadow-lg hover:scale-105 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="bg-customer-100 text-customer-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-bounce hover:scale-110">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 transition-all-standard hover:text-customer-600">Join a Group</h3>
              <p className="text-gray-600 transition-all-standard">
                Browse products and join an existing group or create a new one. Set your desired quantity and see the group progress.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all-standard hover:shadow-lg hover:scale-105 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-customer-100 text-customer-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-bounce hover:scale-110">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 transition-all-standard hover:text-customer-600">Wait for Lock</h3>
              <p className="text-gray-600 transition-all-standard">
                Groups lock automatically every Saturday if they reach ₹1,000 total value and have 10+ members. Sellers then accept the group order.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all-standard hover:shadow-lg hover:scale-105 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="bg-customer-100 text-customer-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-bounce hover:scale-110">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 transition-all-standard hover:text-customer-600">Local Pickup</h3>
              <p className="text-gray-600 transition-all-standard">
                Pick up your order from the seller's location using the OTP sent to your email. Rate the seller after successful pickup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 transition-all-standard hover:text-customer-600 hover:tracking-wide">Why Choose LockDeal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">Group Discounts</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    Save money by buying in groups. The more people join, the better the price gets.
                  </p>
                </div>
              </div>

              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">No Delivery Fees</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    Pick up your orders directly from sellers. No delivery charges means more savings for you.
                  </p>
                </div>
              </div>

              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-left" style={{animationDelay: '0.3s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">Community Building</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    Connect with local buyers and sellers. Support local businesses in your community.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-right" style={{animationDelay: '0.1s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">Secure Transactions</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    OTP verification ensures secure pickups. Rate sellers after successful transactions.
                  </p>
                </div>
              </div>

              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">Transparent Process</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    Track your group's progress in real-time. See member count and total order value.
                  </p>
                </div>
              </div>

              <div className="flex transition-all-standard hover:transform hover:translate-x-2 animate-slide-in-right" style={{animationDelay: '0.3s'}}>
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white transition-transform-bounce hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium transition-all-standard hover:text-customer-600">Fast & Efficient</h3>
                  <p className="mt-2 text-gray-600 transition-all-standard">
                    Weekly locking ensures quick turnaround. Get your products without long waiting periods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products Section */}
      {isAuthenticated && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center transition-all-standard hover:text-primary-600">Recommended For You</h2>
            <RecommendedProducts />
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-customer-700 to-customer-600 text-white">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 transition-all-standard hover:tracking-wide">Ready to Start Saving?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto transition-all-standard">Join LockDeal today and experience the benefits of group buying with your local community.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-bounce-in">
            <Link to="/register" className="bg-white text-customer-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg transition-all-standard hover:shadow-lg hover:scale-105">Sign Up Now</Link>
            <Link to="/login" className="bg-customer-700 hover:bg-customer-800 border border-white/20 px-8 py-3 rounded-lg font-medium text-lg transition-all-standard hover:shadow-lg hover:scale-105">Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;