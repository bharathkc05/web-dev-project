import React, { useState } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { AuthVisualPanel } from '../../features/auth/components/AuthVisualPanel';

import logo from '../../assets/logo.png';

export const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { signup } = useAuth();
  const { closeAuthModal, setAuthModalView } = useUIStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup({ name, email, password });
      closeAuthModal(); // Close modal on success
    } catch (err) {
      if (err.errors) {
        // If there are detailed validation errors from Zod, join them
        const errorMessages = Object.values(err.errors).join('. ');
        setError(errorMessages);
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 bg-surface h-full min-h-[500px]">
      {/* Left Visual Panel */}
      <AuthVisualPanel
        isTyping={isTyping}
        passwordLength={password.length}
        showPassword={showPassword}
      />

      {/* Right Signup Section */}
      <div className="flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[380px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-8 text-[#BAA38C]">
            <div className="size-10 flex items-center justify-center">
              <img src={logo} alt="Velvet Bytes Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <span>Velvet Bytes</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Create an account</h1>
            <p className="text-on-surface-variant text-sm font-medium">Join us for delicious rewards!</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-bold text-on-surface">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border-2 border-outline-variant focus:border-brown focus:ring-0 outline-none transition-colors text-on-surface placeholder:text-outline-variant font-medium"
              />
            </div>

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

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-bold text-on-surface">Password</label>
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
            </div>

            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#BAA38C] hover:bg-[#A68F77] text-white text-base font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm mt-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Create Account"}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-4">
            <button
              type="button"
              className="w-full h-11 bg-surface-container-lowest border-2 border-outline-variant hover:border-outline hover:bg-surface-container-low text-on-surface text-sm font-bold rounded-xl transition-all flex items-center justify-center shadow-sm"
            >
              <Mail className="mr-3 size-4 text-on-surface-variant" />
              Sign up with Google
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-on-surface-variant font-medium mt-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setAuthModalView('login')}
              className="text-[#BAA38C] font-bold hover:underline"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
