import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role is required'),
});

const Register = () => {
  const { register, setTempEmail } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await register(values.name, values.email, values.password, values.confirmPassword, values.role);
      setTempEmail(values.email);
      toast.success('OTP sent to your email');
      navigate('/otp');
    } catch (error) {
      toast.error(error.detail || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-secondary-300 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl"></div>
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo192.svg" 
            alt="LockDeal Logo" 
            className="h-16 w-auto mx-auto animate-bounce-in" 
          />
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 animate-fade-in">LockDeal</h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-slide-up">
            Buy Together, Save Smartly – Local Pickup, No Delivery
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-6 shadow-2xl sm:rounded-xl sm:px-12 animate-scale-in transition-all-standard hover:shadow-xl backdrop-blur-sm bg-white/95 border border-white/50 relative z-10">
          <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-br from-primary-300 to-secondary-300 rounded-xl opacity-20 z-0"></div>
          <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Your Account</h2>
          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: 'customer',
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values }) => (
              <Form className="space-y-6">
                <div className="relative">
                  <label htmlFor="name" className="form-label text-gray-700">
                    Full Name
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      className="form-input pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <ErrorMessage name="name" component="div" className="form-error mt-1" />
                </div>

                <div className="relative">
                  <label htmlFor="email" className="form-label text-gray-700">
                    Email address
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="form-input pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="form-error mt-1" />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="form-label text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="form-input pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="form-error mt-1" />
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="form-label text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="form-input pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="form-error mt-1" />
                </div>

                <div className="relative">
                  <label className="form-label text-gray-700 block mb-2">I want to register as</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${values.role === 'customer' ? 'bg-blue-50 border-primary-500 ring-2 ring-primary-500 ring-opacity-50' : 'border-gray-300 hover:border-primary-300'}`}>
                      <Field
                        type="radio"
                        name="role"
                        value="customer"
                        className="form-radio text-primary-600 h-5 w-5"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Customer</span>
                        <span className="block text-xs text-gray-500">Buy products in groups</span>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${values.role === 'seller' ? 'bg-blue-50 border-primary-500 ring-2 ring-primary-500 ring-opacity-50' : 'border-gray-300 hover:border-primary-300'}`}>
                      <Field
                        type="radio"
                        name="role"
                        value="seller"
                        className="form-radio text-primary-600 h-5 w-5"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Seller</span>
                        <span className="block text-xs text-gray-500">Sell products to groups</span>
                      </div>
                    </label>
                  </div>
                  <ErrorMessage name="role" component="div" className="form-error mt-1" />
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg overflow-hidden"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-all duration-200"></span>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-300 group-hover:text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </span>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 py-1 bg-white text-gray-500 rounded-full shadow-sm border border-gray-100">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 inline-flex items-center group">
                  Sign in
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} LockDeal. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;