import React from 'react';

export const AuthForm = ({ title, subtitle, onSubmit, isLoading, error, children, submitText }) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(80,45,22,0.06)] border border-neutral-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-on-surface mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {children}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wide hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            submitText
          )}
        </button>
      </form>
    </div>
  );
};
