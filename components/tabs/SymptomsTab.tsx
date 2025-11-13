
import React from 'react';

interface SymptomsTabProps {
  content: string;
}

const SymptomsTab: React.FC<SymptomsTabProps> = ({ content }) => {
  return (
    <div>
      <h3 className="text-xl font-serif text-brand-green-dark mb-4">Symptoms</h3>
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
};

export default SymptomsTab;
