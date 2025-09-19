import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './services/axiosConfig'; // Import axios configuration

// Override default toast configuration
const originalToast = { ...toast };
toast.success = originalToast.success; // Enable success toasts
toast.info = () => {};    // Disable info toasts
toast.warning = () => {}; // Disable warning toasts
toast.error = () => {};   // Disable error toasts

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
          toastClassName={(context) => {
            // Only show green success popups, hide all other types
            if (context?.type !== 'success') {
              return 'hidden';
            }
            
            // Hide blank popups (empty or undefined content)
            if (!context?.defaultValue || context?.defaultValue.trim() === '') {
              return 'hidden';
            }
            
            // Only show toast with actual content
            return 'Toastify__toast';
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);