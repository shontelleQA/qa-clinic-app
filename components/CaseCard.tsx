import React from 'react';
import { Case, Difficulty, UserSubmission, SUBMISSION_FIELDS } from '../types';

interface CaseCardProps {
  caseData: Case;
  userSubmission?: UserSubmission;
  onSelect: (caseData: Case) => void;
}

const DifficultyChip: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const styles = {
    [Difficulty.Easy]: 'bg-emerald-100 text-emerald-800',
    [Difficulty.Medium]: 'bg-amber-100 text-amber-800',
    [Difficulty.Hard]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
};

const calculateProgress = (submission?: UserSubmission): number => {
    if (!submission) return 0;
    const filledFields = SUBMISSION_FIELDS.filter(field => {
        const value = submission[field];
        return value !== undefined && value !== null && String(value).trim() !== '';
    });
    return Math.round((filledFields.length / SUBMISSION_FIELDS.length) * 100);
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, userSubmission, onSelect }) => {
  const progress = calculateProgress(userSubmission);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col border border-slate-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-serif text-lg font-semibold text-brand-green-dark pr-4">{caseData.title}</h3>
        <DifficultyChip difficulty={caseData.difficulty} />
      </div>
       <div className="text-xs font-semibold text-slate-500 mb-1">{caseData.department}</div>
      <p className="text-slate-600 text-sm flex-grow mb-4">
        {caseData.description}
      </p>

      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
        </div>
        <div className="w-full bg-brand-green-light rounded-full h-2">
            <div className="bg-brand-green h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-auto">
         <button
          onClick={() => onSelect(caseData)}
          className="w-full bg-brand-green-light text-brand-green-dark font-semibold py-2 px-4 rounded-lg hover:bg-brand-green hover:text-white transition-colors duration-200"
        >
          Start Challenge
        </button>
      </div>
    </div>
  );
};

export default CaseCard;