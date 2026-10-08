export type ProcessType = "import" | "comparison" | "condition";
export type ProcessStatus = "none" | "running" | "error" | "done";

export interface Process {
  id: number;
  contestId: number;
  processType: ProcessType;
  status: ProcessStatus;
  progress: number;
  message?: any;
}

export const defaultProcess: Process = {
  id: 0,
  contestId: 0,
  processType: "import",
  status: "none",
  progress: 0,
};
