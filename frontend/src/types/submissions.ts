export interface Submission {
  id: number;
  contestantId: number;
  code: string;
  normalizedCode?: string;
  verdict: string;
  problem: string;
  language: string;
}

export const defaultSubmission: Submission = {
  id: 0,
  contestantId: 0,
  code: "",
  normalizedCode: "",
  verdict: "",
  problem: "",
  language: "",
};
