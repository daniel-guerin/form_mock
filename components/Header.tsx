import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-ga-blue border-b border-blue-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo utilizing GA brand colors */}
          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center relative overflow-hidden shadow-sm">
             <div className="absolute bottom-0 right-0 w-4 h-4 bg-ga-green rounded-tl-full"></div>
             <span className="text-ga-blue font-bold text-lg relative z-10">GA</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Galvanizers Association</h1>
            <p className="text-xs text-blue-100 font-medium">CPD Certificate Registration</p>
          </div>
        </div>
      </div>
    </header>
  );
};