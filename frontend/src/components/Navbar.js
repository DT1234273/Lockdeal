import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);

  const handleLogout = () => {
    setShowLogoutAnimation(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 300);
  };

  const isCustomerSection = location.pathname.includes('/customer');
  const isSellerSection = location.pathname.includes('/seller');
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Reset logout animation when user changes
  useEffect(() => {
    setShowLogoutAnimation(false);
  }, [user]);

  // Determine gradient based on section
  const navbarGradient = isSellerSection
    ? 'bg-gradient-to-r from-seller-700 to-seller-600'
    : 'bg-gradient-to-r from-customer-700 to-customer-600';
    
  const navbarClasses = `${navbarGradient} text-white shadow-lg sticky top-0 z-50 transition-all-standard ${isScrolled ? 'py-2' : 'py-3'}`;
  
  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <svg className="h-8 w-8 transition-transform-bounce group-hover:scale-110" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold transition-all-standard group-hover:tracking-wider">
              {isSellerSection ? 'LockDeal Seller' : 'LockDeal'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-8 flex-grow">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link 
                      to="/customer/dashboard" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/customer/dashboard' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link 
                      to="/customer/products" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/customer/products' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Products
                    </Link>
                    <Link 
                      to="/customer/group-status" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/customer/group-status' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      My Groups
                    </Link>
                    <Link 
                      to="/customer/reviews" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/customer/reviews' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Reviews
                    </Link>
                    <Link 
                      to="/customer/profile" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/customer/profile' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                  </>
                )}
                {user.role === 'seller' && (
                  <>
                    <Link 
                      to="/seller/dashboard" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/seller/dashboard' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link 
                      to="/seller/upload-product" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/seller/upload-product' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Upload Product
                    </Link>
                    <Link 
                      to="/seller/view-groups" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/seller/view-groups' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Groups
                    </Link>
                    <Link 
                      to="/seller/ratings" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/seller/ratings' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Ratings
                    </Link>
                    <Link 
                      to="/seller/customer-orders" 
                      className={`transition-all-standard hover:text-white hover:scale-105 flex items-center ${location.pathname === '/seller/customer-orders' ? 'font-bold border-b-2 border-white' : ''}`}
                    >
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order Confirmation
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="transition-all-standard hover:text-white hover:scale-105 font-medium">Home</Link>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.getElementById('how-it-works');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth' });
                    } else if (window.location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => {
                        const section = document.getElementById('how-it-works');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                      }, 500);
                    }
                  }}
                  className="transition-all-standard hover:text-white hover:scale-105 font-medium cursor-pointer"
                >
                  How It Works
                </a>
                <a 
                  href="#benefits" 
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.getElementById('benefits');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth' });
                    } else if (window.location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => {
                        const section = document.getElementById('benefits');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                      }, 500);
                    }
                  }}
                  className="transition-all-standard hover:text-white hover:scale-105 font-medium cursor-pointer"
                >
                  Benefits
                </a>
              </>
            )}
          </div>

          {/* Profile / Login / Register */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all-standard ${isSellerSection ? 'bg-seller-700 hover:bg-seller-800' : 'bg-customer-700 hover:bg-customer-800'} ${showLogoutAnimation ? 'opacity-0 transform translate-y-2' : ''}`}
                >
                  <span className="font-medium">{user.name || 'User'}</span>
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10 hidden group-hover:block border border-gray-200 animate-scale-in">
                  <div className={`px-4 py-3 text-sm text-gray-700 border-b border-gray-100 ${isSellerSection ? 'bg-seller-50' : 'bg-customer-50'}`}>
                    <p className="font-medium text-gray-900">{user.name || 'User'}</p>
                    <p className="text-gray-500 truncate">{user.email}</p>
                    <p className={`text-xs mt-1 capitalize font-semibold ${isSellerSection ? 'text-seller-600' : 'text-customer-600'}`}>{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all-standard"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 animate-slide-in-right">
                <Link 
                  to="/login" 
                  className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-full font-medium transition-all-standard hover:shadow-md"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`${isSellerSection ? 'bg-seller-600 hover:bg-seller-700' : 'bg-customer-600 hover:bg-customer-700'} px-4 py-2 rounded-full font-medium border border-white/20 transition-all-standard hover:shadow-md`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className={`p-2 rounded-full focus:outline-none transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'}`}
            >
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden pb-4 overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {user ? (
            <div className="border-t border-white/10 pt-4 pb-3 px-2 space-y-1 animate-slide-down">
              {user.role === 'customer' && (
                <>
                  <Link 
                    to="/customer/dashboard" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-customer-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link 
                    to="/customer/products" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-customer-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Products
                  </Link>
                  <Link 
                    to="/customer/group-status" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-customer-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Groups
                  </Link>
                  <Link 
                    to="/customer/reviews" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-customer-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Reviews
                  </Link>
                  <Link 
                    to="/customer/profile" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-customer-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                </>
              )}
              {user.role === 'seller' && (
                <>
                  <Link 
                    to="/seller/dashboard" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-seller-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link 
                    to="/seller/upload-product" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-seller-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Upload Product
                  </Link>
                  <Link 
                    to="/seller/view-groups" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-seller-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Groups
                  </Link>
                  <Link 
                    to="/seller/ratings" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-seller-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Ratings
                  </Link>
                  <Link 
                    to="/seller/customer-orders" 
                    className="flex items-center px-3 py-2 rounded-md transition-all-standard hover:bg-seller-700 hover:pl-4"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Confirmation
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-3 mt-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4 hover:bg-red-600 ${showLogoutAnimation ? 'opacity-0 transform translate-x-4' : ''}`}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-white/10 pt-4 pb-3 px-2 space-y-2 animate-slide-down">
              <Link 
                to="/" 
                className={`flex items-center px-3 py-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <a 
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMobileMenu();
                  const section = document.getElementById('how-it-works');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  } else if (window.location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      const section = document.getElementById('how-it-works');
                      if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                  }
                }}
                className={`flex items-center px-3 py-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4 cursor-pointer`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </a>
              <a 
                href="#benefits"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMobileMenu();
                  const section = document.getElementById('benefits');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  } else if (window.location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      const section = document.getElementById('benefits');
                      if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                  }
                }}
                className={`flex items-center px-3 py-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4 cursor-pointer`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Benefits
              </a>
              <Link 
                to="/login" 
                className={`flex items-center px-3 py-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
              <Link 
                to="/register" 
                className={`flex items-center px-3 py-2 rounded-md transition-all-standard ${isSellerSection ? 'hover:bg-seller-700' : 'hover:bg-customer-700'} hover:pl-4`}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
