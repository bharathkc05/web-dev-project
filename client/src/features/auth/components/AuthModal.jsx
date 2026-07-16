import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { LoginPage } from '../../../pages/Auth/LoginPage';
import { SignupPage } from '../../../pages/Auth/SignupPage';

import { ForgotPasswordPage } from '../../../pages/Auth/ForgotPasswordPage';

export const AuthModal = () => {
  const { isAuthModalOpen, authModalView, closeAuthModal } = useUIStore();
  const modalRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeAuthModal();
      }
    };

    if (isAuthModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-[900px] h-auto max-h-[90vh] overflow-hidden rounded-2xl bg-surface shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-black/5 text-on-surface-variant transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {authModalView === 'login' && <LoginPage />}
        {authModalView === 'signup' && <SignupPage />}
        {authModalView === 'forgot-password' && <ForgotPasswordPage />}
      </div>
    </div>
  );
};
