import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg">
      <button
        className="w-full flex justify-between items-center p-3 text-left font-semibold text-brand-green-dark bg-brand-green-light/30 hover:bg-brand-green-light/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDownIcon className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3 border-t border-slate-200 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
