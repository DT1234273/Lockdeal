import React from 'react';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const CustomerLayout = () => {
  // Apply customer theme when component mounts
  useEffect(() => {
    document.body.classList.add('customer-theme');
    document.body.classList.remove('seller-theme');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('customer-theme');
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8 px-4 container mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;