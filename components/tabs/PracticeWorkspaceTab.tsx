import React, { useState } from 'react';
import { Case, UserSubmission } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import CodeBlock from '../CodeBlock';
import { SparklesIcon } from '../Icons';
import { GoogleGenAI } from '@google/genai';

interface PracticeWorkspaceTabProps {
  caseData: Case;
  userSubmission: UserSubmission;
  onSubmissionChange: (field: keyof UserSubmission, value: string) => void;
}

const PracticeWorkspaceTab: React.FC<PracticeWorkspaceTabProps> = ({ caseData, userSubmission, onSubmissionChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmitForFeedback = async () => {
        setIsLoading(true);
        setFeedback('');

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const prompt = `
          You are a Senior QA Mentor reviewing a bug report and test plan from a junior tester.
          Your tone should be helpful, encouraging, and educational. Do not be harsh.
          
          Here is the ideal analysis for the bug:
          <IDEAL_ANALYSIS>
          Root Cause: ${caseData.solution.rootCause}
          Repro Steps: ${caseData.solution.reproSteps}
          Expected vs Actual: ${caseData.solution.expectedVsActual}
          Severity: ${caseData.solution.severity}
          Affected Components: ${caseData.solution.affectedComponents.join(', ')}
          Test Cases:
          ${caseData.solution.testCases.map(tc => `- ${tc}`).join('\n')}
          </IDEAL_ANALYSIS>

          Here is the user's submission:
          <USER_SUBMISSION>
          Root Cause: ${userSubmission.rootCause || 'Not provided'}
          Repro Steps: ${userSubmission.reproSteps || 'Not provided'}
          Expected vs Actual: ${userSubmission.expectedVsActual || 'Not provided'}
          Severity: ${userSubmission.severity || 'Not provided'}
          Affected Components: ${userSubmission.affectedComponents || 'Not provided'}
          Test Cases: ${userSubmission.testCases || 'Not provided'}
          Regression Ideas: ${userSubmission.regressionIdeas || 'Not provided'}
          </USER_SUBMISSION>

          Please provide feedback on the user's submission by comparing it to the ideal analysis.
          1. Start with overall positive reinforcement.
          2. Go through each section (Root Cause, Repro Steps, etc.) and comment on what they did well and where they can improve.
          3. For areas of improvement, gently guide them toward the ideal answer without giving it away directly. Ask leading questions.
          4. If they missed something important (like identifying a key affected component), point it out as something to consider.
          5. Conclude with an encouraging summary.
          Format your response using Markdown for readability (headings, bold text, bullet points).
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setFeedback(response.text);
        } catch (error) {
            console.error("Error getting feedback from AI:", error);
            setFeedback("Sorry, I encountered an error while generating feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Investigation */}
            <div className="space-y-4">
                <h3 className="text-xl font-serif text-brand-green-dark">Investigation Artifacts</h3>
                <p className="text-sm text-slate-600">Review the following clues to understand the issue.</p>
                {caseData.artifacts.map((artifact, index) => (
                    <CollapsibleSection key={index} title={artifact.title}>
                        <CodeBlock code={artifact.content} />
                    </CollapsibleSection>
                ))}
            </div>

            {/* Right side: User Input */}
            <div className="space-y-4">
                 <h3 className="text-xl font-serif text-brand-green-dark">Your Analysis</h3>
                 <p className="text-sm text-slate-600">Based on your investigation, fill out the fields below.</p>
                
                 <div>
                    <label className="form-label">Suspected Root Cause</label>
                    <textarea value={userSubmission.rootCause || ''} onChange={e => onSubmissionChange('rootCause', e.target.value)} rows={3} className="w-full form-input" />
                 </div>
                 <div>
                    <label className="form-label">Test Steps to Reproduce</label>
                    <textarea value={userSubmission.reproSteps || ''} onChange={e => onSubmissionChange('reproSteps', e.target.value)} rows={4} className="w-full form-input" />
                 </div>
                 <div>
                    <label className="form-label">Expected vs. Actual Results</label>
                    <textarea value={userSubmission.expectedVsActual || ''} onChange={e => onSubmissionChange('expectedVsActual', e.target.value)} rows={3} className="w-full form-input" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Severity / Priority</label>
                        <input type="text" value={userSubmission.severity || ''} onChange={e => onSubmissionChange('severity', e.target.value)} className="w-full form-input" />
                    </div>
                    <div>
                        <label className="form-label">Affected Components</label>
                        <input type="text" value={userSubmission.affectedComponents || ''} onChange={e => onSubmissionChange('affectedComponents', e.target.value)} className="w-full form-input" placeholder="e.g., Checkout, API, Database" />
                    </div>
                 </div>
                 <div>
                    <label className="form-label">Proposed Test Cases (one per line)</label>
                    <textarea value={userSubmission.testCases || ''} onChange={e => onSubmissionChange('testCases', e.target.value)} rows={4} className="w-full form-input" />
                 </div>
                  <div>
                    <label className="form-label">Regression Ideas (one per line)</label>
                    <textarea value={userSubmission.regressionIdeas || ''} onChange={e => onSubmissionChange('regressionIdeas', e.target.value)} rows={3} className="w-full form-input" />
                 </div>

                 <div className="pt-4">
                    <button
                        onClick={handleSubmitForFeedback}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-brand-pink text-brand-pink-dark font-semibold py-2.5 px-4 rounded-lg hover:bg-brand-pink-dark hover:text-white transition-colors duration-200 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                       {isLoading ? 'Thinking...' : <><SparklesIcon /> Get Feedback (AI)</>}
                    </button>
                 </div>

                 {feedback && (
                    <div className="mt-6 p-4 bg-brand-green-light/50 rounded-lg border border-brand-green-light animate-fade-in">
                        <h4 className="text-lg font-serif text-brand-green-dark mb-2">Mentor Feedback</h4>
                        <div
                            className="prose prose-sm max-w-none text-slate-800"
                            dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(feedback) }}
                        />
                    </div>
                 )}
            </div>
             <style>{`
                .form-input {
                    border-radius: 0.375rem; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    width: 100%; padding: 0.5rem 0.75rem;
                }
                .form-input:focus {
                    outline: 2px solid transparent; outline-offset: 2px;
                    --tw-ring-color: #A8C3B8; border-color: #A8C3B8;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                }
                .prose h1, .prose h2, .prose h3, .prose h4 { color: #3D5C52; }
                .prose strong { color: #3D5C52; }
                .prose ul > li::before { background-color: #A8C3B8; }
            `}</style>
        </div>
    );
};

export default PracticeWorkspaceTab;
