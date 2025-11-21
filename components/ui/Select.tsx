import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 outline-none appearance-none bg-white
            ${error 
              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-ga-blue focus:ring-2 focus:ring-blue-100'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <ChevronDown size={20} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
};
