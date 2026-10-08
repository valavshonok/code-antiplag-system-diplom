import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Contest, defaultContest } from "../../types/contest";
import { MenuActivePages } from "../../types/store";
import { defaultProcess, Process } from "../../types/process";
import { defaultSubmission, Submission } from "../../types/submissions";
import { Contestant, defaultContestant } from "../../types/contestants";
import {
  defaultSubmissionCondition,
  SubmissionCondition,
} from "../../types/conditions";

interface StorState {
  contests: {
    deleteContest: Contest;
    updateContest: Contest;
  };
  menu: {
    activePage: MenuActivePages;
  };
  processes: {
    stopProcess: { process: Process; contestId: number };
  };
  comparison: {
    modalSubmission: {
      problem: string;
      contestant: Contestant;
      submissions: { submission: Submission; matchPercent: number }[];
    };
    modalComparisons: {
      problem: string;
      contestant: Contestant;
      submission: Submission;
    };
    modalComparison: {
      problem: string;
      contestant: Contestant;
      comparisonId: number;
    };
    settings: {
      redNamePlagiators: boolean;
      fillRedFieldPlagiat: boolean;
      fillRedRowPlagiator: boolean;
      activeModalComparisonPairs: boolean;
      activeModalComparisonContestants: boolean;
      originalityColorThreshold: number;
      useNormalization: boolean;
    };
  };
  conditions: {
    modalSubmission: {
      problem: string;
      contestant: Contestant;
      submissions: Submission[];
    };
    modalCondition: {
      contestant: Contestant;
      submission: Submission;
      condition: SubmissionCondition;
    };
    settings: {
      activeModalConditionsAll: boolean;
      activeModalConditionsCritical: boolean;
    };
  };
  statistics: {
    settings: {
      resetResultForPlagiarism: boolean;
      resetScoreOnPlagiarismTask: boolean;
      trustAINetworks: boolean;
      modalDownloadAllActive: boolean;
      modalDownloadScoreActive: boolean;
      modalDownloadPlagiatorsActive: boolean;
      modalDownloadConditionsActive: boolean;
      modalDownloadPlagiatPairsActive: boolean;
    };
  };
}

const initialState: StorState = {
  contests: {
    deleteContest: defaultContest,
    updateContest: defaultContest,
  },
  menu: {
    activePage: "processes",
  },
  processes: {
    stopProcess: { process: defaultProcess, contestId: 0 },
  },
  comparison: {
    modalSubmission: {
      problem: "",
      contestant: defaultContestant,
      submissions: [],
    },
    modalComparisons: {
      problem: "",
      contestant: defaultContestant,
      submission: defaultSubmission,
    },
    modalComparison: {
      problem: "",
      contestant: defaultContestant,
      comparisonId: 0,
    },
    settings: {
      redNamePlagiators: true,
      fillRedFieldPlagiat: false,
      fillRedRowPlagiator: false,
      originalityColorThreshold: 70,
      activeModalComparisonPairs: false,
      activeModalComparisonContestants: false,
      useNormalization: true,
    },
  },
  conditions: {
    modalSubmission: {
      problem: "",
      contestant: defaultContestant,
      submissions: [],
    },

    modalCondition: {
      contestant: defaultContestant,
      submission: defaultSubmission,
      condition: defaultSubmissionCondition,
    },
    settings: {
      activeModalConditionsAll: false,
      activeModalConditionsCritical: false,
    },
  },
  statistics: {
    settings: {
      resetResultForPlagiarism: true,
      resetScoreOnPlagiarismTask: true,
      trustAINetworks: true,
      modalDownloadAllActive: false,
      modalDownloadScoreActive: false,
      modalDownloadPlagiatorsActive: false,
      modalDownloadConditionsActive: false,
      modalDownloadPlagiatPairsActive: false,
    },
  },
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setDeleteContest: (state, action: PayloadAction<Contest>) => {
      state.contests.deleteContest = action.payload;
    },
    setUpdateContest: (state, action: PayloadAction<Contest>) => {
      state.contests.updateContest = action.payload;
    },
    setMenuActivePage: (state, action: PayloadAction<MenuActivePages>) => {
      state.menu.activePage = action.payload;
    },
    setStopProcess: (
      state,
      action: PayloadAction<{ process: Process; contestId: number }>,
    ) => {
      state.processes.stopProcess = action.payload;
    },
    setComparisonModalSubmissions: (
      state,
      action: PayloadAction<{
        problem: string;
        contestant: Contestant;
        submissions: { submission: Submission; matchPercent: number }[];
      }>,
    ) => {
      state.comparison.modalSubmission = action.payload;
    },
    setComparisonModalComparisons: (
      state,
      action: PayloadAction<{
        problem: string;
        contestant: Contestant;
        submission: Submission;
      }>,
    ) => {
      state.comparison.modalComparisons = action.payload;
    },
    setComparisonModalComparison: (
      state,
      action: PayloadAction<{
        problem: string;
        contestant: Contestant;
        comparisonId: number;
      }>,
    ) => {
      state.comparison.modalComparison = action.payload;
    },
    setComparisonSettings: (
      state,
      action: PayloadAction<typeof state.comparison.settings>,
    ) => {
      state.comparison.settings = action.payload;
    },

    setConditionModalSubmissions: (
      state,
      action: PayloadAction<typeof state.conditions.modalSubmission>,
    ) => {
      state.conditions.modalSubmission = action.payload;
    },

    setConditionModalCondition: (
      state,
      action: PayloadAction<typeof state.conditions.modalCondition>,
    ) => {
      state.conditions.modalCondition = action.payload;
    },
    setConditionSettings: (
      state,
      action: PayloadAction<typeof state.conditions.settings>,
    ) => {
      state.conditions.settings = action.payload;
    },
    setStatisticsSettings: (
      state,
      action: PayloadAction<typeof state.statistics.settings>,
    ) => {
      state.statistics.settings = action.payload;
    },
  },
});

export const {
  setUpdateContest,
  setDeleteContest,
  setMenuActivePage,
  setStopProcess,
  setComparisonModalSubmissions,
  setComparisonModalComparisons,
  setComparisonModalComparison,
  setComparisonSettings,
  setConditionModalSubmissions,
  setConditionModalCondition,
  setConditionSettings,
  setStatisticsSettings,
} = storeSlice.actions;

export const storeReducer = storeSlice.reducer;
