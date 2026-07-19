import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { AuthVisualPanel } from '../../features/auth/components/AuthVisualPanel';
import { api } from '../../utils/api';

import logo from '../../assets/logo.png';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { setAuthModalView } = useUIStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus({ type: 'success', message: response.data.message });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to request password reset. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 bg-surface h-full min-h-[500px]">
      {/* Left Visual Panel */}
      <AuthVisualPanel
        isTyping={isTyping}
        passwordLength={0}
        showPassword={false}
      />

      {/* Right Forgot Password Section */}
      <div className="flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[380px]">

          <button
            onClick={() => setAuthModalView('login')}
            className="flex items-center text-sm font-bold text-on-surface-variant hover:text-brown transition-colors mb-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to login
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-8 text-[#BAA38C]">
            <div className="size-10 flex items-center justify-center">
              <img src={logo} alt="Velvet Bytes Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <span>Velvet Bytes</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Reset Password</h1>
            <p className="text-on-surface-variant text-sm font-medium">Enter your email and we'll send you a reset link.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-bold text-on-surface">Email</label>
              <input
                id="email"
                type="email"
                placeholder="john@gmail.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border-2 border-outline-variant focus:border-brown focus:ring-0 outline-none transition-colors text-on-surface placeholder:text-outline-variant font-medium"
              />
            </div>

            {status.message && (
              <div className={`p-3 text-sm font-medium border rounded-lg flex items-center ${status.type === 'error'
                  ? 'text-red-600 bg-red-50 border-red-100'
                  : 'text-green-700 bg-green-50 border-green-200'
                }`}>
                {status.type === 'error' ? (
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || status.type === 'success'}
              className="w-full h-11 bg-[#BAA38C] hover:bg-[#A68F77] text-white text-base font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm mt-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
