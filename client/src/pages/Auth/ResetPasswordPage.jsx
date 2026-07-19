import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../../utils/api';
import logo from '../../assets/logo.png';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setStatus({ type: 'success', message: response.data.message });
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).join('. ');
        setStatus({ type: 'error', message: errorMessages });
      } else {
        setStatus({
          type: 'error',
          message: err.response?.data?.message || 'Failed to reset password. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface-container-low p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center justify-center gap-2 text-xl font-semibold mb-8 text-[#BAA38C]">
          <div className="size-12 flex items-center justify-center">
            <img src={logo} alt="Velvet Bytes Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <span>Velvet Bytes</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-on-surface">Set New Password</h1>
          <p className="text-on-surface-variant text-sm font-medium">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-bold text-on-surface">New Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="w-full h-11 px-4 pr-12 rounded-xl bg-surface-container-lowest border-2 border-outline-variant focus:border-brown focus:ring-0 outline-none transition-colors text-on-surface placeholder:text-outline-variant font-medium tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-brown transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {isTyping && (
              <p className="text-xs text-on-surface-variant mt-1">
                Must be at least 8 characters, with 1 uppercase and 1 number.
              </p>
            )}
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
            ) : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};
