export interface ComparisonConfig {
  format_code: boolean;
  normalize_types: boolean;
  remove_comments: boolean;
  rename_variables: boolean;
  remove_empty_lines: boolean;
  apply_preprocessing: boolean;
  remove_using_namespace: boolean;
  use_depersonalization: boolean;
}

export interface ConditionConfig {
  title: string;
  penalty: number;
  description: string;
}

export interface ProblemsConfig {
  score: number;
  problem: string;
  conditions: ConditionConfig[];
}

export interface ContestConfig {
  comparison: ComparisonConfig;
  problems: ProblemsConfig[];
}

export interface Contest {
  id: number;
  name: string;
  config: ContestConfig;
}

export const defaultComparisonConfig: ComparisonConfig = {
  format_code: true,
  normalize_types: true,
  remove_comments: true,
  rename_variables: true,
  remove_empty_lines: true,
  apply_preprocessing: true,
  remove_using_namespace: true,
  use_depersonalization: true,
};

export const defaultContestConfig: ContestConfig = {
  comparison: { ...defaultComparisonConfig },
  problems: [],
};

export const defaultContest: Contest = {
  id: 0,
  name: "",
  config: { ...defaultContestConfig },
};
