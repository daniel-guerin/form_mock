import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, isValid, className = '', ...props }) => {
  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          className={`
            w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 outline-none appearance-none
            disabled:bg-gray-100 disabled:text-gray-500
            ${error 
              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
              : isValid
                ? 'border-green-500 bg-green-50 focus:border-green-600'
                : 'border-gray-300 bg-white focus:border-ga-blue focus:ring-2 focus:ring-blue-100'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={20} />
          </div>
        )}
        {!error && isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none">
            <CheckCircle2 size={20} />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium animate-pulse">{error}</p>}
    </div>
  );
};
