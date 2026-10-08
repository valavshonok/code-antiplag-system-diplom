import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setConditionModalSubmissions,
  setMenuActivePage,
  setStatisticsSettings,
} from "../../../redux/slices/store";
// import { cn } from "../../../lib/cn";
import { Contest } from "../../../types/contest";
import { fetchSubmissions } from "../../../redux/slices/submissions";
import { fetchContestants } from "../../../redux/slices/contestants";
import { Submission } from "../../../types/submissions";
import { Contestant } from "../../../types/contestants";
import { cn } from "../../../lib/cn";
import { ModalSubmissions } from "./ModalSubmissions";
import { ModalCondition } from "./ModalCondition";
import { fetchContestProcesses } from "../../../redux/slices/contests";
import { Process } from "../../../types/process";
import { useNavigate } from "react-router-dom";
import { fetchConditions } from "../../../redux/slices/conditions";
import { SubmissionCondition } from "../../../types/conditions";
import {
  getPlagiators,
  getPlagiatSubmissions,
} from "../comparisons/Comparisons";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchComparisons } from "../../../redux/slices/comparisons";
import { SubmissionComparisonSummary } from "../../../types/comparisons";
import { ModalDownload } from "./ModalDownload";

interface StatisticsProps {
  contest: Contest;
}

type ContestMatrix = Map<number, Map<string, Submission[]>>;

export function roundToStep(value: number, step = 0.05) {
  const scaled = value / step;
  const rounded = Math.round(scaled) * step;
  return Number(rounded.toFixed(2));
}

export function calculateFinalScore(
  submissionCondition: SubmissionCondition,
  trustAINetworks: boolean = true,
): number {
  const { score: baseScore, conditions } = submissionCondition.conditionResults;

  if (!Array.isArray(conditions) || conditions.length === 0) {
    return baseScore;
  }

  const totalPenalty = conditions.reduce((sum, condition) => {
    return condition.expert_verdict === false ||
      (trustAINetworks &&
        condition.expert_verdict === null &&
        condition.satisfied === false)
      ? sum + (condition.penalty ?? 0)
      : sum;
  }, 0);

  return Math.max(0, baseScore - totalPenalty);
}

export function buildSubmissionConditionMap(
  conditions: SubmissionCondition[],
): Map<number, SubmissionCondition> {
  const map = new Map<number, SubmissionCondition>();

  for (const condition of conditions) {
    map.set(condition.submissionId, condition);
  }

  return map;
}

export function getContestProblems(submissions: Submission[]): string[] {
  const unique = new Set<string>();

  for (const s of submissions) {
    if (s.problem && s.problem.trim() !== "") {
      unique.add(s.problem.trim());
    }
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function buildContestMatrix(submissions: Submission[]): ContestMatrix {
  const matrix: ContestMatrix = new Map();

  for (const submission of submissions) {
    const { contestantId, problem } = submission;

    if (!matrix.has(contestantId)) {
      matrix.set(contestantId, new Map());
    }

    const contestantMap = matrix.get(contestantId)!;

    if (!contestantMap.has(problem)) {
      contestantMap.set(problem, []);
    }

    contestantMap.get(problem)!.push(submission);
  }

  return matrix;
}

export function getContestantsSortedByUniqueSubmissions(
  contestants: Contestant[],
  submissions: Submission[],
): Contestant[] {
  // contestantId -> Set<submissionId>
  const submissionMap: Record<number, Set<number>> = {};

  for (const submission of submissions) {
    const { contestantId, id } = submission;

    if (!submissionMap[contestantId]) {
      submissionMap[contestantId] = new Set();
    }

    submissionMap[contestantId].add(id);
  }

  // создаём копию, чтобы не мутировать исходный массив
  const sorted = [...contestants];

  sorted.sort((a, b) => {
    const countA = submissionMap[a.id]?.size ?? 0;
    const countB = submissionMap[b.id]?.size ?? 0;

    return countB - countA; // по убыванию
  });

  return sorted;
}

export function getSimilarityColor(
  percent: number,
  originalityColorThreshold: number = 70,
): string {
  if (percent < originalityColorThreshold) {
    return "text-inherit";
  }

  const range = 100 - originalityColorThreshold;

  if (range <= 0) {
    return "text-red-600";
  }

  const segmentSize = range / 6;
  const delta = percent - originalityColorThreshold;
  const index = Math.floor(delta / segmentSize);

  switch (index) {
    case 0:
      return "text-yellow-300";
    case 1:
      return "text-yellow-400";
    case 2:
      return "text-amber-500";
    case 3:
      return "text-orange-500";
    case 4:
      return "text-red-500";
    default:
      return "text-red-600";
  }
}

export function getContestantMap(
  contestants: Contestant[],
): Map<number, Contestant> {
  const map = new Map<number, Contestant>();

  for (const contestant of contestants) {
    map.set(contestant.id, contestant);
  }

  return map;
}

export const Statistics: FC<StatisticsProps> = ({ contest }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [modalSubmissionsActive, setModalSubmissionsActive] =
    useState<boolean>(false);

  const [modalConditionActive, setModalConditionActive] =
    useState<boolean>(false);

  const { contestants } = useAppSelector(
    (state) => state.contestants.fetchContestants,
  );

  const { submissions } = useAppSelector(
    (state) => state.submissions.fetchSubmissions,
  );

  const { comparisons } = useAppSelector(
    (state) => state.comparisons.fetchComparisons,
  );

  const { conditions } = useAppSelector(
    (state) => state.conditions.fetchConditions,
  );

  const { processes } = useAppSelector(
    (state) => state.contests.fetchContestProcesses,
  );

  const conditionProcess = processes.find(
    (p: Process) => p.processType === "condition",
  );

  const comparisonProcess = processes.find(
    (p: Process) => p.processType === "comparison",
  );

  useEffect(() => {
    if (conditionProcess && conditionProcess.status == "done") {
      dispatch(setMenuActivePage("statistics"));
      dispatch(fetchConditions(contest.id));
      dispatch(fetchComparisons(contest.id));
      dispatch(fetchSubmissions(contest.id));
      dispatch(fetchContestants(contest.id));
    }
  }, [conditionProcess]);

  useEffect(() => {
    dispatch(setMenuActivePage("statistics"));
    dispatch(fetchContestProcesses(contest.id));
  }, []);

  const submissionConditionMap = buildSubmissionConditionMap(conditions);
  const problems = getContestProblems(submissions);
  const contestMap = buildContestMatrix(submissions);
  const contestantsRow = getContestantsSortedByUniqueSubmissions(
    contestants,
    submissions,
  );
  const statisticSettings = useAppSelector(
    (state) => state.store.statistics.settings,
  );
  const plagiatSubmissions = getPlagiatSubmissions(submissions, comparisons);
  const plagiators = getPlagiators(submissions, comparisons);

  const submissionsMap = useMemo(() => {
    const map = new Map<number, Submission>();
    submissions.forEach((s) => map.set(s.id, s));
    return map;
  }, [submissions]);

  const comparisonsMap = useMemo(() => {
    const map = new Map<number, SubmissionComparisonSummary>();
    comparisons.forEach((c) => map.set(c.id, c));
    return map;
  }, [comparisons]);

  const contestantsMap = useMemo(() => {
    const map = new Map<number, Contestant>();
    contestants.forEach((c) => map.set(c.id, c));
    return map;
  }, [contestants]);

  const sortedComparisons = useMemo(() => {
    return comparisons.filter((c) => c.plagiarism);
  }, [comparisons, submissions]);

  const contestMaxScore = contest.config.problems.reduce(
    (sum, problem) => sum + (problem.score ?? 0),
    0,
  );

  const handleDownloadPlagiarismPairsExcel = () => {
    const sorted = [...sortedComparisons].sort((a, b) => {
      const subA1 = submissionsMap.get(a.submission1Id);
      const subB1 = submissionsMap.get(b.submission1Id);

      const authorA1 = contestantsMap.get(subA1?.contestantId ?? 0)?.name ?? "";
      const authorB1 = contestantsMap.get(subB1?.contestantId ?? 0)?.name ?? "";

      if (authorA1 !== authorB1) {
        return authorA1.localeCompare(authorB1);
      }

      const subA2 = submissionsMap.get(a.submission2Id);
      const subB2 = submissionsMap.get(b.submission2Id);

      const authorA2 = contestantsMap.get(subA2?.contestantId ?? 0)?.name ?? "";
      const authorB2 = contestantsMap.get(subB2?.contestantId ?? 0)?.name ?? "";

      return authorA2.localeCompare(authorB2);
    });

    const data = sorted.map((v) => {
      const c = comparisonsMap.get(v.id);
      const problem = submissionsMap.get(c?.submission1Id ?? 0)?.problem ?? "";

      const sub1 = submissionsMap.get(v.submission1Id);
      const sub2 = submissionsMap.get(v.submission2Id);

      const author1 = contestantsMap.get(sub1?.contestantId ?? 0);
      const author2 = contestantsMap.get(sub2?.contestantId ?? 0);

      return {
        Задача: problem,
        "ID Посылка 1": v.submission1Id,
        "Автор 1": author1?.name ?? "",
        "ID Посылка 2": v.submission2Id,
        "Автор 2": author2?.name ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 50 },
      { wch: 15 },
      { wch: 50 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Посылки с плагиатом");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "plagiarism_comparisons.xlsx");
  };
  // Участники с плагиатом
  const handleDownloadPlagiatorsExcel = () => {
    const data = [...plagiators].map((v) => {
      return {
        "Участники с плагиатом": contestantsMap.get(v)?.name ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 100 }, // "Участники с плагиатом"
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Участники с плагиатом");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "plagiarism_contestants.xlsx");
  };
  // Оценки
  const handleDownloadScoreExcel = () => {
    // Сначала формируем промежуточную структуру с итоговым баллом
    const rowsWithScores = contestantsRow.map((contestant) => {
      let sumMaxScore = 0;

      const isPlagiarized =
        statisticSettings.resetResultForPlagiarism &&
        plagiators.has(contestant.id);

      const row: Record<string, any> = {
        Участник: contestant.name,
        _sumMaxScore: 0, // временное поле для сортировки
      };

      for (const problem of problems) {
        const submissions = contestMap.get(contestant.id)?.get(problem) ?? [];

        if (submissions.length === 0) {
          row[problem] = "";
          continue;
        }

        let totalScore = 0;
        let maxScore = 0;
        let plagiat = false;

        for (const submission of submissions) {
          const condition = submissionConditionMap.get(submission.id);
          if (!condition) continue;

          if (totalScore === 0) {
            totalScore = condition.conditionResults.score;
          }

          maxScore = Math.max(
            maxScore,
            calculateFinalScore(condition, statisticSettings.trustAINetworks),
          );

          if (plagiatSubmissions.has(submission.id)) {
            plagiat = true;
          }
        }

        if (statisticSettings.resetScoreOnPlagiarismTask && plagiat) {
          maxScore = 0;
        }

        if (isPlagiarized) {
          maxScore = 0;
        }

        sumMaxScore += maxScore;

        row[problem] = `${roundToStep(maxScore)} / ${roundToStep(totalScore)}`;
      }

      row["Итого"] = roundToStep(sumMaxScore);
      row["Плагиат"] = isPlagiarized ? "плагиат" : "";

      row._sumMaxScore = sumMaxScore;

      return row;
    });

    // Сортировка по убыванию итогового балла
    rowsWithScores.sort((a, b) => b._sumMaxScore - a._sumMaxScore);

    // Удаляем служебное поле
    const data = rowsWithScores.map(({ _sumMaxScore, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(data);

    const cols = Object.keys(data[0] ?? {});
    worksheet["!cols"] = cols.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? String(row[key]).length : 0)),
      );
      return { wch: maxLength + 2 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Оценки");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `contest_${contest.id}_statistics.xlsx`);
  };
  // Невыполненные ограничения
  const handleDownloadConditionsExcel = () => {
    const rows: Record<string, any>[] = [];

    for (const contestant of contestantsRow) {
      // 1. Проверка полного обнуления за плагиат
      // const isPlagiarizedContestant =
      //   statisticSettings.resetResultForPlagiarism &&
      //   plagiators.has(contestant.id);

      // if (isPlagiarizedContestant) continue;

      for (const problem of problems) {
        const submissions = contestMap.get(contestant.id)?.get(problem) ?? [];

        if (submissions.length === 0) continue;

        // 2. Выбираем посылку с максимальным итоговым баллом
        let bestSubmission: Submission | null = null;
        let bestScore = -1;

        for (const submission of submissions) {
          const condition = submissionConditionMap.get(submission.id);
          if (!condition) continue;

          // if (
          //   statisticSettings.resetScoreOnPlagiarismTask &&
          //   plagiatSubmissions.has(submission.id)
          // ) {
          //   continue;
          // }

          // if (
          //   statisticSettings.resetResultForPlagiarism &&
          //   plagiators.has(submission.contestantId)
          // ) {
          //   continue;
          // }

          const score = calculateFinalScore(
            condition,
            statisticSettings.trustAINetworks,
          );

          if (score > bestScore) {
            bestScore = score;
            bestSubmission = submission;
          }
        }

        if (!bestSubmission) continue;

        const condition = submissionConditionMap.get(bestSubmission.id);
        if (!condition) continue;

        // 3. Выписываем только НЕВЫПОЛНЕННЫЕ условия
        for (const cond of condition.conditionResults.conditions) {
          const isSatisfied =
            cond.expert_verdict === true ||
            (cond.expert_verdict === null && cond.satisfied);

          if (isSatisfied) continue;

          rows.push({
            Участник: contestant.name,
            Задача: problem,
            "Невыполненные условия": cond.title,
            Штраф: cond.penalty ?? 0,
          });
        }
      }
    }

    // Сортировка: участник → задача
    rows.sort((a, b) => {
      if (a.Участник === b.Участник) {
        return a.Задача.localeCompare(b.Задача);
      }
      return a.Участник.localeCompare(b.Участник);
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const cols = Object.keys(rows[0] ?? {});
    worksheet["!cols"] = cols.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...rows.map((row) => (row[key] ? String(row[key]).length : 0)),
      );
      return { wch: maxLength + 2 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Невыполнение условий");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `contest_${contest.id}_violations.xlsx`);
  };

  const addSheet = (
    workbook: XLSX.WorkBook,
    data: any[],
    sheetName: string,
  ) => {
    const worksheet = XLSX.utils.json_to_sheet(data);

    const cols = Object.keys(data[0] ?? {});
    worksheet["!cols"] = cols.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? String(row[key]).length : 0)),
      );
      return { wch: maxLength + 2 };
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  };

  const getPlagiarismPairsData = () => {
    const sorted = [...sortedComparisons].sort((a, b) => {
      const subA1 = submissionsMap.get(a.submission1Id);
      const subB1 = submissionsMap.get(b.submission1Id);

      const authorA1 = contestantsMap.get(subA1?.contestantId ?? 0)?.name ?? "";
      const authorB1 = contestantsMap.get(subB1?.contestantId ?? 0)?.name ?? "";

      if (authorA1 !== authorB1) {
        return authorA1.localeCompare(authorB1);
      }

      const subA2 = submissionsMap.get(a.submission2Id);
      const subB2 = submissionsMap.get(b.submission2Id);

      const authorA2 = contestantsMap.get(subA2?.contestantId ?? 0)?.name ?? "";
      const authorB2 = contestantsMap.get(subB2?.contestantId ?? 0)?.name ?? "";

      return authorA2.localeCompare(authorB2);
    });

    return sorted.map((v) => {
      const c = comparisonsMap.get(v.id);
      const problem = submissionsMap.get(c?.submission1Id ?? 0)?.problem ?? "";

      const sub1 = submissionsMap.get(v.submission1Id);
      const sub2 = submissionsMap.get(v.submission2Id);

      const author1 = contestantsMap.get(sub1?.contestantId ?? 0);
      const author2 = contestantsMap.get(sub2?.contestantId ?? 0);

      return {
        Задача: problem,
        "ID Посылка 1": v.submission1Id,
        "Автор 1": author1?.name ?? "",
        "ID Посылка 2": v.submission2Id,
        "Автор 2": author2?.name ?? "",
      };
    });
  };

  const getPlagiarismContestantsData = () => {
    return [...plagiators].map((id) => ({
      "Участники с плагиатом": contestantsMap.get(id)?.name ?? "",
    }));
  };

  const getStatisticsData = () => {
    const rowsWithScores = contestantsRow.map((contestant) => {
      let sumMaxScore = 0;

      const isPlagiarized =
        statisticSettings.resetResultForPlagiarism &&
        plagiators.has(contestant.id);

      const row: Record<string, any> = {
        Участник: contestant.name,
        _sumMaxScore: 0,
      };

      for (const problem of problems) {
        const submissions = contestMap.get(contestant.id)?.get(problem) ?? [];

        if (submissions.length === 0) {
          row[problem] = "";
          continue;
        }

        let totalScore = 0;
        let maxScore = 0;
        let plagiat = false;

        for (const submission of submissions) {
          const condition = submissionConditionMap.get(submission.id);
          if (!condition) continue;

          if (totalScore === 0) {
            totalScore = condition.conditionResults.score;
          }

          maxScore = Math.max(
            maxScore,
            calculateFinalScore(condition, statisticSettings.trustAINetworks),
          );

          if (plagiatSubmissions.has(submission.id)) {
            plagiat = true;
          }
        }

        if (statisticSettings.resetScoreOnPlagiarismTask && plagiat) {
          maxScore = 0;
        }

        if (isPlagiarized) {
          maxScore = 0;
        }

        sumMaxScore += maxScore;

        row[problem] = `${roundToStep(maxScore)} / ${roundToStep(totalScore)}`;
      }

      row["Итого"] = roundToStep(sumMaxScore);
      row["Плагиат"] = isPlagiarized ? "плагиат" : "";

      row._sumMaxScore = roundToStep(sumMaxScore);

      return row;
    });

    rowsWithScores.sort((a, b) => b._sumMaxScore - a._sumMaxScore);

    return rowsWithScores.map(({ _sumMaxScore, ...rest }) => rest);
  };

  const getConditionsData = () => {
    const rows: Record<string, any>[] = [];

    for (const contestant of contestantsRow) {
      // const isPlagiarizedContestant =
      //   statisticSettings.resetResultForPlagiarism &&
      //   plagiators.has(contestant.id);

      // if (isPlagiarizedContestant) continue;

      for (const problem of problems) {
        const submissions = contestMap.get(contestant.id)?.get(problem) ?? [];

        if (submissions.length === 0) continue;

        let bestSubmission: Submission | null = null;
        let bestScore = -1;

        for (const submission of submissions) {
          const condition = submissionConditionMap.get(submission.id);
          if (!condition) continue;

          // if (
          //   statisticSettings.resetScoreOnPlagiarismTask &&
          //   plagiatSubmissions.has(submission.id)
          // ) {
          //   continue;
          // }

          const score = calculateFinalScore(
            condition,
            statisticSettings.trustAINetworks,
          );

          if (score > bestScore) {
            bestScore = score;
            bestSubmission = submission;
          }
        }

        if (!bestSubmission) continue;

        const condition = submissionConditionMap.get(bestSubmission.id);
        if (!condition) continue;

        for (const cond of condition.conditionResults.conditions) {
          const isSatisfied =
            cond.expert_verdict === true ||
            (cond.expert_verdict === null && cond.satisfied);

          if (isSatisfied) continue;

          rows.push({
            Участник: contestant.name,
            Задача: problem,
            "Невыполненные условия": cond.title,
            Штраф: cond.penalty ?? 0,
          });
        }
      }
    }

    rows.sort((a, b) => {
      if (a.Участник === b.Участник) {
        return a.Задача.localeCompare(b.Задача);
      }
      return a.Участник.localeCompare(b.Участник);
    });

    return rows;
  };

  const handleDownloadAllExcel = () => {
    const workbook = XLSX.utils.book_new();

    addSheet(workbook, getStatisticsData(), "Оценки");

    addSheet(workbook, getConditionsData(), "Невыполнение условий");

    addSheet(workbook, getPlagiarismContestantsData(), "Участники с плагиатом");

    addSheet(workbook, getPlagiarismPairsData(), "Посылки с плагиатом");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `contest_${contest.id}_full_export.xlsx`);
  };

  const getDownloadChildren = ({
    useScore = false,
    useConditions = false,
    usePlagiators = false,
    usePlagiatPairs = false,
  }) => {
    return (
      <div className="flex flex-col gap-[16px] text-[14px] text-liquid-white">
        <div>
          <div className="text-[16px] font-bold">Структура выгрузки:</div>
          <div className=" opacity-75 mt-[5px]">
            {useScore && (
              <div>
                Лист «Оценки» - баллы по задачам, итог, отметка о плагиате.
              </div>
            )}
            {useConditions && (
              <div>
                Лист «Невыполнение условий» - список нарушенных ограничений по
                лучшей посылке.
              </div>
            )}
            {usePlagiators && (
              <div>
                Лист «Участники с плагиатом» - перечень дисквалифицированных
                участников.
              </div>
            )}
            {usePlagiatPairs && (
              <div>
                Лист «Посылки с плагиатом» - пары в которых был найден плагиат.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-[16px] font-bold">
            Применённые настройки расчёта:
          </div>
          <div className=" mt-[5px] flex gap-[5px] flex-col">
            {statisticSettings.trustAINetworks && (
              <div>
                <div className="font-bold">Доверие оценке нейросети</div>
                <div className="opacity-80 pl-[5px]">
                  Если доверие нейросети включено - невыполненные условия,
                  отмеченные только нейросетью (без экспертного подтверждения)
                  считаються невыполненными и не учитываются при расчёте
                  итогового балла.
                </div>
              </div>
            )}

            {statisticSettings.resetResultForPlagiarism && (
              <div>
                <div className="font-bold">
                  Полное обнуление результата участника при плагиате
                </div>
                <div className="opacity-80 pl-[5px]">
                  Если включено полное обнуление - участник с подтверждённым
                  плагиатом получает итоговый балл 0 по всему конкурсу.
                </div>
              </div>
            )}

            {statisticSettings.resetScoreOnPlagiarismTask && (
              <div>
                <div className="font-bold">
                  Обнуление балла за задачу при плагиате посылки
                </div>
                <div className="opacity-80 pl-[5px]">
                  Если включено обнуление по задаче - задача, содержащая посылку
                  с плагиатом, для данного участника оценивается в 0 баллов.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-screen w-full box-border p-[10px] pr-[5px] border-liquid-border border-l-[1px] text-liquid-white">
        <div className="h-full flex flex-col">
          <div className="h-[50px] text-[40px] font-bold text-liquid-white flex items-center mb-4">
            Результаты
          </div>

          <div className="flex-1 overflow-auto thin-dark-scrollbar pr-[5px]">
            {!conditionProcess ||
            conditionProcess.status != "done" ||
            (comparisonProcess && comparisonProcess.status == "running") ? (
              <>
                {conditionProcess?.status == "running" ? (
                  <>
                    <div className="text-[20px] mb-[10px]">
                      Проверка в процессе... {conditionProcess.progress}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[20px] mb-[10px]">
                      Проверка посылок не начато.
                    </div>

                    <div className="text-[20px] mb-[10px]">
                      Запустить процесс сравнения посылок можно{" "}
                      <span
                        onClick={() => {
                          navigate(`/contest/${contest.id}/processes`);
                        }}
                        className="hover:underline text-blue-500 cursor-pointer"
                      >
                        тут
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {" "}
                {/*  */}
                <div
                  className="grid "
                  style={{
                    gridTemplateColumns: `1fr repeat(${problems.length + 1}, ${problems.length <= 10 ? "80px" : "50px"})`,
                  }}
                >
                  {/* Header */}
                  <div className="border-liquid-border border-[2px] p-2 font-black text-[24px]">
                    Участник
                  </div>
                  {problems.map((p) => (
                    <div
                      key={p}
                      className="border-liquid-border border-[2px] p-2 text-center font-black text-[24px]"
                    >
                      {p}
                    </div>
                  ))}
                  <div className="border-liquid-border border-[2px] p-2 text-center font-black text-[24px]">
                    =
                  </div>
                  {/* Rows */}
                  {contestantsRow.map((contestant) => {
                    let sumMaxScore = 0;
                    return (
                      <Fragment key={contestant.id}>
                        {/* Имя */}
                        <div
                          className={cn(
                            "border-liquid-border border-[1px] p-2 font-medium leading-[20px] relative transition-all duration-300 ",
                          )}
                        >
                          {contestant.name}
                        </div>

                        {/* Ячейки по задачам */}
                        {problems.map((problem) => {
                          const submissions = contestMap
                            .get(contestant.id)
                            ?.get(problem);
                          if (!submissions || submissions.length === 0) {
                            return (
                              <div
                                key={problem}
                                className={cn(
                                  "border-liquid-border border-[1px] p-2 text-center relative  transition-all duration-300 ",
                                )}
                              ></div>
                            );
                          }

                          let totalScore = 0;
                          let maxScore = 0;
                          let hasUnreviewedByExpert = false;
                          let plagiat = false;

                          for (const submission of submissions) {
                            const condition = submissionConditionMap.get(
                              submission.id,
                            );
                            if (!condition) continue;

                            hasUnreviewedByExpert ||=
                              condition.conditionResults.conditions.some(
                                (cond) =>
                                  cond.expert_verdict === null &&
                                  !cond.satisfied,
                              );

                            if (totalScore === 0) {
                              totalScore = condition.conditionResults.score;
                            }

                            maxScore = Math.max(
                              maxScore,
                              calculateFinalScore(
                                condition,
                                statisticSettings.trustAINetworks,
                              ),
                            );

                            if (
                              statisticSettings.resetResultForPlagiarism &&
                              plagiators.has(submission.contestantId)
                            ) {
                              maxScore = 0;
                            }

                            if (plagiatSubmissions.has(submission.id))
                              plagiat = true;
                          }

                          if (
                            statisticSettings.resetScoreOnPlagiarismTask &&
                            plagiat
                          )
                            maxScore = 0;
                          sumMaxScore += maxScore;

                          return (
                            <div
                              key={problem}
                              className={cn(
                                "border-liquid-border border-[1px] p-2 flex items-center justify-center cursor-pointer hover:bg-liquid-lighter hover:text-liquid-brightmain transition-all duration-300 relative",

                                "text-liquid-green",

                                totalScore &&
                                  maxScore / totalScore <= 0.25 &&
                                  "text-liquid-red",

                                totalScore &&
                                  maxScore / totalScore > 0.25 &&
                                  maxScore / totalScore < 0.85 &&
                                  "text-liquid-orange",
                              )}
                              onClick={() => {
                                dispatch(
                                  setConditionModalSubmissions({
                                    problem,
                                    contestant,
                                    submissions,
                                  }),
                                );
                                setModalSubmissionsActive(true);
                              }}
                            >
                              <span>{roundToStep(maxScore)}</span>
                              <span className="absolute top-0 right-[4px] text-liquid-light text-[12px]">
                                {roundToStep(totalScore)}
                              </span>
                              {hasUnreviewedByExpert && (
                                <span className=" absolute bg-red-600 h-[5px] w-[5px] top-[3px] left-[3px] rounded-full"></span>
                              )}
                            </div>
                          );
                        })}
                        {/* Сумма баллов */}
                        <div
                          className={cn(
                            "border-liquid-border border-[1px] p-2 flex items-center justify-center cursor-pointer hover:bg-liquid-lighter hover:text-liquid-brightmain transition-all duration-300 relative",

                            "text-liquid-green",

                            contestMaxScore &&
                              sumMaxScore / contestMaxScore <= 0.25 &&
                              "text-liquid-red",

                            contestMaxScore &&
                              sumMaxScore / contestMaxScore > 0.25 &&
                              sumMaxScore / contestMaxScore < 0.85 &&
                              "text-liquid-orange",
                          )}
                        >
                          <span>{roundToStep(sumMaxScore)}</span>
                          <span className="absolute top-0 right-[4px] text-liquid-light text-[12px]">
                            {roundToStep(contestMaxScore)}
                          </span>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </>
            )}

            {/*  */}
          </div>
        </div>
      </div>

      <ModalDownload
        active={statisticSettings.modalDownloadAllActive}
        setActive={() => {
          dispatch(
            setStatisticsSettings({
              ...statisticSettings,
              modalDownloadAllActive: !statisticSettings.modalDownloadAllActive,
            }),
          );
        }}
        title="Скачать все"
        children={getDownloadChildren({
          useConditions: true,
          usePlagiators: true,
          usePlagiatPairs: true,
          useScore: true,
        })}
        downloadClick={() => {
          handleDownloadAllExcel();
        }}
      />

      <ModalDownload
        active={statisticSettings.modalDownloadScoreActive}
        setActive={() => {
          dispatch(
            setStatisticsSettings({
              ...statisticSettings,
              modalDownloadScoreActive:
                !statisticSettings.modalDownloadScoreActive,
            }),
          );
        }}
        title="Скачать оценки"
        children={getDownloadChildren({ useScore: true })}
        downloadClick={() => {
          handleDownloadScoreExcel();
        }}
      />

      <ModalDownload
        active={statisticSettings.modalDownloadConditionsActive}
        setActive={() => {
          dispatch(
            setStatisticsSettings({
              ...statisticSettings,
              modalDownloadConditionsActive:
                !statisticSettings.modalDownloadConditionsActive,
            }),
          );
        }}
        title="Скачать выполнение ограничений"
        children={getDownloadChildren({ useConditions: true })}
        downloadClick={() => {
          handleDownloadConditionsExcel();
        }}
      />

      <ModalDownload
        active={statisticSettings.modalDownloadPlagiatorsActive}
        setActive={() => {
          dispatch(
            setStatisticsSettings({
              ...statisticSettings,
              modalDownloadPlagiatorsActive:
                !statisticSettings.modalDownloadPlagiatorsActive,
            }),
          );
        }}
        title="Скачать участников с плагиатом"
        children={getDownloadChildren({ usePlagiators: true })}
        downloadClick={() => {
          handleDownloadPlagiatorsExcel();
        }}
      />

      <ModalDownload
        active={statisticSettings.modalDownloadPlagiatPairsActive}
        setActive={() => {
          dispatch(
            setStatisticsSettings({
              ...statisticSettings,
              modalDownloadPlagiatPairsActive:
                !statisticSettings.modalDownloadPlagiatPairsActive,
            }),
          );
        }}
        title="Скачать пары посылок с плагиатом"
        children={getDownloadChildren({ usePlagiatPairs: true })}
        downloadClick={() => {
          handleDownloadPlagiarismPairsExcel();
        }}
      />

      <ModalCondition
        active={modalConditionActive}
        setActive={setModalConditionActive}
      />
      <ModalSubmissions
        active={modalSubmissionsActive}
        setActive={setModalSubmissionsActive}
        setModalConditionActive={setModalConditionActive}
        plagiators={plagiators}
        plagiatSubmissions={plagiatSubmissions}
      />
    </>
  );
};
