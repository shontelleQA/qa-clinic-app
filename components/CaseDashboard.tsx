import React, { useState, useMemo } from 'react';
import { Case, Department, Difficulty, UserSubmission } from '../types';
import CaseCard from './CaseCard';
import { SearchIcon } from './Icons';

interface CaseDashboardProps {
  cases: Case[];
  userSubmissions: Record<string, UserSubmission>;
  onSelectCase: (caseData: Case) => void;
}

const CaseDashboard: React.FC<CaseDashboardProps> = ({ cases, userSubmissions, onSelectCase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');

  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      const matchesDifficulty = difficultyFilter === 'All' || caseItem.difficulty === difficultyFilter;
      const matchesDepartment = departmentFilter === 'All' || caseItem.department === departmentFilter;
      const matchesSearch =
        searchQuery === '' ||
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesDepartment && matchesSearch;
    });
  }, [cases, searchQuery, difficultyFilter, departmentFilter]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-serif text-brand-green-dark">Case Dashboard</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'All')}
          className="block w-full sm:w-48 rounded-lg border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm"
        >
          <option value="All">All Difficulties</option>
          {Object.values(Difficulty).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value as Department | 'All')}
          className="block w-full sm:w-48 rounded-lg border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm"
        >
          <option value="All">All Departments</option>
          {Object.values(Department).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem) => (
          <CaseCard 
            key={caseItem.id} 
            caseData={caseItem} 
            userSubmission={userSubmissions[caseItem.id]}
            onSelect={onSelectCase} 
           />
        ))}
      </div>
    </div>
  );
};

export default CaseDashboard;