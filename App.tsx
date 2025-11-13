import React, { useState, useCallback, useEffect } from 'react';
import { Case, UserSubmission } from './types';
import { CASES_DATA } from './constants';
import CaseDashboard from './components/CaseDashboard';
import CaseView from './components/CaseView';
import Header from './components/Header';

const App: React.FC = () => {
  // Cases are now static challenges, not state.
  const cases: Case[] = CASES_DATA;
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // State is now for the user's answers/progress
  const [userSubmissions, setUserSubmissions] = useState<Record<string, UserSubmission>>(() => {
    try {
      const saved = window.localStorage.getItem('qaClinicSubmissions');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to load submissions from localStorage", error);
      return {};
    }
  });

  // Save submissions to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem('qaClinicSubmissions', JSON.stringify(userSubmissions));
    } catch (error) {
      console.error("Failed to save submissions to localStorage", error);
    }
  }, [userSubmissions]);

  const handleSelectCase = useCallback((caseData: Case) => {
    setSelectedCase(caseData);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedCase(null);
  }, []);

  const handleUpdateSubmission = useCallback((caseId: string, submission: UserSubmission) => {
    setUserSubmissions(prev => ({
      ...prev,
      [caseId]: submission,
    }));
  }, []);

  return (
    <div className="bg-brand-ivory min-h-screen text-brand-green-dark font-sans antialiased">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        {selectedCase ? (
          <CaseView
            caseData={selectedCase}
            userSubmission={userSubmissions[selectedCase.id] || {}}
            onGoHome={handleGoHome}
            onUpdateSubmission={handleUpdateSubmission}
          />
        ) : (
          <CaseDashboard
            cases={cases}
            userSubmissions={userSubmissions}
            onSelectCase={handleSelectCase}
          />
        )}
      </main>
    </div>
  );
};

export default App;