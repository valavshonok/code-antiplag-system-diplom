export interface SubmissionComparisonSummary {
  id: number;
  processId: number;
  submission1Id: number;
  submission2Id: number;
  matchPercent: number;
  matchPercentNormalized: number;
  plagiarism: boolean;
}

export interface DiffCharBlock {
  type: "equal" | "different";
  text1: string;
  text2: string;
}

export interface DiffStringBlock {
  type: "equal" | "different";
  text1: string[];
  text2: string[];
}

export interface SubmissionComparison {
  id: number;
  processId: number;
  submission1Id: number;
  submission2Id: number;

  diffStringBlocks: DiffStringBlock[];
  diffStringBlocksNormalized: DiffStringBlock[];
  diffCharBlocks: DiffCharBlock[];
  diffCharBlocksNormalized: DiffCharBlock[];

  matchPercent: number;
  matchPercentNormalized: number;
  plagiarism: boolean;
}

export const defaultSubmissionComparisonSummary: SubmissionComparisonSummary = {
  id: 0,
  processId: 0,
  submission1Id: 0,
  submission2Id: 0,
  matchPercent: 0,
  matchPercentNormalized: 0,
  plagiarism: false,
};

export const defaultSubmissionComparison: SubmissionComparison = {
  id: 0,
  processId: 0,
  submission1Id: 0,
  submission2Id: 0,

  diffStringBlocks: [],
  diffStringBlocksNormalized: [],
  diffCharBlocks: [],
  diffCharBlocksNormalized: [],

  matchPercent: 0,
  matchPercentNormalized: 0,
  plagiarism: false,
};
