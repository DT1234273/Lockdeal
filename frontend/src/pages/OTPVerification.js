import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

const OTPVerification = () => {
  const { verifyOTP, resendOTP, tempEmail, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    // Redirect if no email in context
    if (!tempEmail) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    // Redirect if already verified
    if (user && user.is_verified) {
      const redirectPath = user.role === 'seller' ? '/seller/dashboard' : '/customer/dashboard';
      navigate(redirectPath);
      return;
    }

    // Set up countdown timer
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [tempEmail, user, navigate]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await verifyOTP(tempEmail, values.otp);
      toast.success('OTP verified successfully');
      
      // Redirect based on user role
      const redirectPath = user.role === 'seller' ? '/seller/dashboard' : '/customer/dashboard';
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.detail || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(tempEmail);
      toast.info('OTP resent to your email');
      setTimer(300); // Reset timer
    } catch (error) {
      toast.error(error.detail || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">LockDeal</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Buy Together, Save Smartly – Local Pickup, No Delivery
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify OTP</h2>
          <p className="mb-4 text-sm text-gray-600">
            We've sent a 6-digit OTP to <span className="font-medium">{tempEmail}</span>.
            Please enter it below to verify your account.
          </p>
          
          <Formik
            initialValues={{ otp: '' }}
            validationSchema={OTPSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="otp" className="form-label">
                    Enter 6-digit OTP
                  </label>
                  <Field
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    className="form-input text-center text-2xl tracking-widest"
                    placeholder="------"
                  />
                  <ErrorMessage name="otp" component="div" className="form-error" />
                </div>

                

                <div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isSubmitting || timer === 0}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={timer > 0}
              className={`text-sm font-medium ${timer > 0 ? 'text-gray-400' : 'text-primary-600 hover:text-primary-500'}`}
            >
              {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;