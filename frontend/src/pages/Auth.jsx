import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestOtp, verifyOtp } from '../services/api';
import { Mail, KeyRound, Loader2 } from 'lucide-react';

const Auth = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      await requestOtp({ email, name });
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      login(res.data); // updates context and localStorage
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="Omniflow Logo" className="h-16 w-16 mx-auto mb-1 object-contain dark:invert-0 invert" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Omniflow</h2>
        <p className="text-gray-500 dark:text-gray-300 mt-1 text-sm bg-white/50 dark:bg-gray-700 inline-block px-3 py-1 rounded-full border border-gray-100 shadow-xs">Secure passwordless login</p>
      </div>

      <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">

        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label htmlFor="authEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-300">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="email" 
                  id="authEmail"
                  name="authEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-2.5 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="authName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Optional unless new)</label>
              <input 
                type="text" 
                id="authName"
                name="authName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                placeholder="What should we call you?"
              />
              <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">Leave blank if you are already registered.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send OTP Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="authOtp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter 6-digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-200">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  id="authOtp"
                  name="authOtp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pl-10 w-full p-2.5 text-center tracking-widest text-xl font-mono border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                  placeholder="------"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-3">
                We sent a secure code to <strong>{email}</strong>
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-medium rounded-lg transition-colors disabled:opacity-70 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Login
            </button>
            <button
               type="button"
               onClick={() => setStep(1)}
               className="w-full text-center text-sm text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
