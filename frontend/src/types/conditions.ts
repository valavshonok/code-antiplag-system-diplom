export interface ConditionResult {
  title: string;
  penalty: number;
  comment: string;
  satisfied: boolean;
  description: string;
  expert_verdict: boolean | null;
}

export interface SubmissionConditionResults {
  score: number;
  conditions: ConditionResult[];
}

export interface SubmissionCondition {
  id: number;
  processId: number;
  submissionId: number;
  conditionResults: SubmissionConditionResults;
}

export const defaultSubmissionCondition: SubmissionCondition = {
  id: 0,
  processId: 0,
  submissionId: 0,
  conditionResults: {
    score: 0,
    conditions: [],
  },
};
