import React from 'react';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const SellerLayout = () => {
  // Apply seller theme when component mounts
  useEffect(() => {
    document.body.classList.add('seller-theme');
    document.body.classList.remove('customer-theme');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('seller-theme');
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      <main className="flex-grow py-6 px-4 container mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default SellerLayout;