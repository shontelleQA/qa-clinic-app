import React, { useState } from 'react';
import { Case, UserSubmission } from '../types';
import { HomeIcon } from './Icons';
import SymptomsTab from './tabs/SymptomsTab';
import PracticeWorkspaceTab from './tabs/PracticeWorkspaceTab';

interface CaseViewProps {
  caseData: Case;
  userSubmission: UserSubmission;
  onGoHome: () => void;
  onUpdateSubmission: (caseId: string, submission: UserSubmission) => void;
}

const TABS = ['Symptoms', 'Practice Workspace'];

const CaseView: React.FC<CaseViewProps> = ({ caseData, userSubmission, onGoHome, onUpdateSubmission }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  const handleSubmissionChange = (field: keyof UserSubmission, value: string) => {
    onUpdateSubmission(caseData.id, {
        ...userSubmission,
        [field]: value
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Symptoms':
        return <SymptomsTab content={caseData.symptoms} />;
      case 'Practice Workspace':
        return <PracticeWorkspaceTab 
                    caseData={caseData} 
                    userSubmission={userSubmission}
                    onSubmissionChange={handleSubmissionChange}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-3xl font-serif text-brand-green-dark pr-4">{caseData.title}</h2>
      </div>
      <p className="text-slate-500 mb-6">{caseData.description}</p>

      <div className="bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-1 sm:space-x-4 px-4 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab
                    ? 'border-brand-pink-dark text-brand-green-dark'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      <button
        onClick={onGoHome}
        className="fixed bottom-6 right-6 bg-brand-green text-white p-4 rounded-full shadow-lg hover:bg-brand-green-dark transition-colors duration-200 z-10"
        aria-label="Go to Dashboard"
      >
        <HomeIcon />
      </button>
    </div>
  );
};

export default CaseView;