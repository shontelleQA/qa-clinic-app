
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-brand-green-light to-emerald-50 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-serif font-semibold text-brand-green-dark">
          QA Clinic
        </h1>
      </div>
    </header>
  );
};

export default Header;
