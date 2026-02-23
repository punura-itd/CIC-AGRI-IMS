import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
// import { supabase } from '../lib/supabase';
import InputField from './inputFeild';
import Button from './button';
import Logo from './logo';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        if (error.message.includes('not configured')) {
          setError('Email service is not configured yet. Please contact support or set up Supabase.');
        } else {
          setError(error.message);
        }
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-8 bg-slate-900 flex flex-col items-center">
            <Logo className="h-24 w-24 mb-1" />
            <p className="text-slate-300 text-sm">Inventory Management System</p>
          </div>
          
          <div className="px-6 sm:px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Check your email!</h1>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            
            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={onBack}
              >
                Back to Login
              </Button>
              
              <p className="text-sm text-slate-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="px-6 py-8 bg-slate-900 flex flex-col items-center">
          <Logo className="h-24 w-24 mb-1" />
          <p className="text-slate-300 text-sm">Inventory Management System</p>
        </div>
        
        <div className="px-6 sm:px-8 py-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="mr-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          </div>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <Mail className="absolute right-3 top-9 h-5 w-5 text-slate-400" />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Remember your password? <span className="font-medium text-teal-600">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;