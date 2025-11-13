export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Department {
  UI = 'UI Clinic',
  API = 'API Clinic',
  Data = 'SQL/Data Clinic',
  Mobile = 'Mobile Clinic',
  Billing = 'Billing Clinic',
  Healthcare = 'Healthcare Clinic',
  Auth = 'Auth Clinic',
  RaceCondition = 'Race Condition Clinic',
  Performance = 'Performance Clinic',
  Security = 'Security Clinic',
  TestData = 'Test Data Clinic',
  Regression = 'Regression Clinic',
}

export interface Artifact {
  type: 'log' | 'api' | 'sql' | 'ui' | 'note' | 'network';
  title: string;
  content: string;
}

export interface Solution {
  rootCause: string;
  reproSteps: string;
  expectedVsActual: string;
  severity: string;
  affectedComponents: string[];
  testCases: string[];
}

export interface UserSubmission {
  rootCause?: string;
  reproSteps?: string;
  expectedVsActual?: string;
  severity?: string;
  affectedComponents?: string;
  testCases?: string;
  regressionIdeas?: string;
}

export interface Case {
  id: string;
  title: string;
  difficulty: Difficulty;
  department: Department;
  description: string;
  symptoms: string;
  artifacts: Artifact[];
  solution: Solution; // The hidden "answer key" for AI comparison
}

// Helper to define which fields count towards completion
export const SUBMISSION_FIELDS: (keyof UserSubmission)[] = [
    'rootCause',
    'reproSteps',
    'expectedVsActual',
    'severity',
    'affectedComponents',
    'testCases',
    'regressionIdeas'
];