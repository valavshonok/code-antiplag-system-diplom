import { FC, Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setComparisonModalSubmissions,
  setComparisonSettings,
  setMenuActivePage,
} from "../../../redux/slices/store";
// import { cn } from "../../../lib/cn";
import { Contest } from "../../../types/contest";
import { fetchComparisons } from "../../../redux/slices/comparisons";
import { fetchSubmissions } from "../../../redux/slices/submissions";
import { fetchContestants } from "../../../redux/slices/contestants";
import { Submission } from "../../../types/submissions";
import { SubmissionComparisonSummary } from "../../../types/comparisons";
import { Contestant } from "../../../types/contestants";
import { cn } from "../../../lib/cn";
import { ModalSubmissions } from "./ModalSubmissions";
import { ModalComparison } from "./ModalComparison";
import { ModalComparisons } from "./ModalComparisons";
import { fetchContestProcesses } from "../../../redux/slices/contests";
import { Process } from "../../../types/process";
import { useNavigate } from "react-router-dom";
import { ModalComparisonPairs } from "./ModalComparisonPairs";
import { ModalComparisonContestants } from "./ModalComparisonContestants";

interface ComparisonsProps {
  contest: Contest;
}

type ContestMatrix = Map<number, Map<string, Submission[]>>;

export function getContestProblems(submissions: Submission[]): string[] {
  const unique = new Set<string>();

  for (const s of submissions) {
    if (s.problem && s.problem.trim() !== "") {
      unique.add(s.problem.trim());
    }
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function calculateSubmissionSimilarity(
  submissions: Submission[],
  comparisons: SubmissionComparisonSummary[],
): Record<number, number> {
  const result: Record<number, number> = {};

  const { useNormalization } = useAppSelector(
    (state) => state.store.comparison.settings,
  );

  for (const submission of submissions) {
    result[submission.id] = 0;
  }

  for (const comparison of comparisons) {
    const {
      submission1Id,
      submission2Id,
      matchPercentNormalized,
      matchPercent,
    } = comparison;

    if (result[submission1Id] !== undefined) {
      result[submission1Id] = Math.max(
        result[submission1Id],
        useNormalization ? matchPercentNormalized : matchPercent,
      );
    }

    if (result[submission2Id] !== undefined) {
      result[submission2Id] = Math.max(
        result[submission2Id],
        useNormalization ? matchPercentNormalized : matchPercent,
      );
    }
  }

  return result;
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
    return "text-liquid-comparisons-plagiat0";
  }

  const range = 100 - originalityColorThreshold;

  if (range <= 0) {
    return "text-liquid-comparisons-plagiat6";
  }

  const segmentSize = range / 6;
  const delta = percent - originalityColorThreshold;
  const index = Math.floor(delta / segmentSize);

  switch (index) {
    case 0:
      return "text-liquid-comparisons-plagiat2";
    case 1:
      return "text-liquid-comparisons-plagiat2";
    case 2:
      return "text-liquid-comparisons-plagiat3";
    case 3:
      return "text-liquid-comparisons-plagiat4";
    case 4:
      return "text-liquid-comparisons-plagiat5";
    default:
      return "text-liquid-comparisons-plagiat6";
  }
}

export function getPlagiators(
  submissions: Submission[],
  comparisons: SubmissionComparisonSummary[],
): Set<number> {
  const submissionToContestant = new Map<number, number>();

  for (const submission of submissions) {
    submissionToContestant.set(submission.id, submission.contestantId);
  }

  const plagiarists = new Set<number>();

  for (const comparison of comparisons) {
    if (!comparison.plagiarism) continue;

    const contestant1 = submissionToContestant.get(comparison.submission1Id);
    const contestant2 = submissionToContestant.get(comparison.submission2Id);

    if (
      contestant1 !== undefined &&
      contestant2 !== undefined &&
      contestant1 !== contestant2
    ) {
      plagiarists.add(contestant1);
      plagiarists.add(contestant2);
    }
  }

  return plagiarists;
}

export function getPlagiatSubmissions(
  submissions: Submission[],
  comparisons: SubmissionComparisonSummary[],
): Set<number> {
  const submissionToContestant = new Map<number, number>();

  for (const submission of submissions) {
    submissionToContestant.set(submission.id, submission.contestantId);
  }

  const plagiarists = new Set<number>();

  for (const comparison of comparisons) {
    if (!comparison.plagiarism) continue;

    const contestant1 = submissionToContestant.get(comparison.submission1Id);
    const contestant2 = submissionToContestant.get(comparison.submission2Id);

    if (
      contestant1 !== undefined &&
      contestant2 !== undefined &&
      contestant1 !== contestant2
    ) {
      plagiarists.add(comparison.submission1Id);
      plagiarists.add(comparison.submission2Id);
    }
  }

  return plagiarists;
}

export function getPlagiatComparisons(
  submissions: Submission[],
  comparisons: SubmissionComparisonSummary[],
): Set<number> {
  const submissionToContestant = new Map<number, number>();

  for (const submission of submissions) {
    submissionToContestant.set(submission.id, submission.contestantId);
  }

  const plagiarists = new Set<number>();

  for (const comparison of comparisons) {
    if (!comparison.plagiarism) continue;

    const contestant1 = submissionToContestant.get(comparison.submission1Id);
    const contestant2 = submissionToContestant.get(comparison.submission2Id);

    if (
      contestant1 !== undefined &&
      contestant2 !== undefined &&
      contestant1 !== contestant2
    ) {
      plagiarists.add(comparison.id);
    }
  }

  return plagiarists;
}

export const Comparisons: FC<ComparisonsProps> = ({ contest }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [modalSubmissionsActive, setModalSubmissionsActive] =
    useState<boolean>(false);

  const [modalComparisonsActive, setModalComparisonsActive] =
    useState<boolean>(false);

  const [modalComparisonActive, setModalComparisonActive] =
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

  const { processes } = useAppSelector(
    (state) => state.contests.fetchContestProcesses,
  );

  const {
    redNamePlagiators,
    fillRedFieldPlagiat,
    fillRedRowPlagiator,
    originalityColorThreshold,
    activeModalComparisonContestants,
    activeModalComparisonPairs,
  } = useAppSelector((state) => state.store.comparison.settings);

  const comparisonSettings = useAppSelector(
    (state) => state.store.comparison.settings,
  );

  const comparisonProcess = processes.find(
    (p: Process) => p.processType === "comparison",
  );

  useEffect(() => {
    if (comparisonProcess && comparisonProcess.status == "done") {
      dispatch(setMenuActivePage("comparisons"));
      dispatch(fetchComparisons(contest.id));
      dispatch(fetchSubmissions(contest.id));
      dispatch(fetchContestants(contest.id));
    }
  }, [comparisonProcess]);

  useEffect(() => {
    dispatch(setMenuActivePage("comparisons"));
    dispatch(fetchContestProcesses(contest.id));
  }, []);

  const submissionSimularity = calculateSubmissionSimilarity(
    submissions,
    comparisons,
  );
  const problems = getContestProblems(submissions);
  const contestMap = buildContestMatrix(submissions);
  const contestantsRow = getContestantsSortedByUniqueSubmissions(
    contestants,
    submissions,
  );

  const plagiators = getPlagiators(submissions, comparisons);
  const plagiatSubmissions = getPlagiatSubmissions(submissions, comparisons);
  const plagiatComparisons = getPlagiatComparisons(submissions, comparisons);

  return (
    <>
      <div className="h-screen w-full box-border p-[10px] pr-[5px] border-liquid-border border-l-[1px]">
        <div className="h-full flex flex-col  text-liquid-white">
          <div className="h-[50px] text-[40px] font-bold flex items-center mb-4">
            Сравнение
          </div>

          <div className="flex-1 overflow-auto thin-dark-scrollbar pr-[5px]">
            {!comparisonProcess || comparisonProcess.status != "done" ? (
              <>
                {comparisonProcess?.status == "running" ? (
                  <>
                    <div className="text-[20px] mb-[10px]">
                      Сравнение в процессе... {comparisonProcess.progress}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[20px] mb-[10px]">
                      Сравнение посылок не начато.
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
                    gridTemplateColumns: `1fr repeat(${problems.length}, ${problems.length <= 10 ? "80px" : "50px"})`,
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

                  {/* Rows */}
                  {contestantsRow.map((contestant) => (
                    <Fragment key={contestant.id}>
                      {/* Имя */}
                      <div
                        className={cn(
                          "border-liquid-border border-[1px] p-2 font-medium leading-[20px] relative transition-all duration-300 ",
                          redNamePlagiators &&
                            plagiators.has(contestant.id) &&
                            "text-red-700",
                          fillRedRowPlagiator &&
                            plagiators.has(contestant.id) &&
                            "text-liquid-red bg-liquid-comparisons-plagbg border-liquid-comparisons-plagborder",
                        )}
                      >
                        {contestant.name}
                        {plagiators.has(contestant.id) && (
                          <span className=" absolute bg-red-600 h-[5px] w-[5px] top-[3px] left-[3px] rounded-full"></span>
                        )}
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
                                "border-liquid-border border-[1px] p-2 text-center relative  transition-all duration-300  bg-liquid-comparisons-cellbg",
                                fillRedRowPlagiator &&
                                  plagiators.has(contestant.id) &&
                                  "bg-liquid-comparisons-plagbg border-liquid-comparisons-plagborder ",
                              )}
                            ></div>
                          );
                        }

                        const maxSimilarity = submissions.reduce(
                          (max, s) =>
                            Math.max(max, submissionSimularity[s.id] ?? 0),
                          0,
                        );

                        const hasPlagiarism = submissions.some((s) =>
                          plagiatSubmissions.has(s.id),
                        );

                        return (
                          <div
                            key={problem}
                            className={cn(
                              "border-liquid-border border-[1px] p-2 flex items-center justify-center cursor-pointer hover:bg-liquid-lighter hover:text-liquid-brightmain transition-all duration-300 relative ",

                              getSimilarityColor(
                                maxSimilarity,
                                originalityColorThreshold,
                              ),
                              ((fillRedRowPlagiator &&
                                plagiators.has(contestant.id)) ||
                                (fillRedFieldPlagiat && hasPlagiarism)) &&
                                "bg-liquid-comparisons-plagbg border-liquid-comparisons-plagborder hover:bg-liquid-comparisons-hoverplagbg hover:text-liquid-comparisons-hoverplagtext",
                            )}
                            onClick={() => {
                              const payloadSubmissions = submissions.map(
                                (s) => ({
                                  submission: s,
                                  matchPercent: submissionSimularity[s.id] ?? 0,
                                }),
                              );

                              dispatch(
                                setComparisonModalSubmissions({
                                  problem,
                                  contestant,
                                  submissions: payloadSubmissions,
                                }),
                              );

                              setModalSubmissionsActive(true);
                            }}
                          >
                            {maxSimilarity}%
                            {hasPlagiarism && (
                              <span className=" absolute bg-red-600 h-[5px] w-[5px] top-[3px] left-[3px] rounded-full"></span>
                            )}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </>
            )}

            {/*  */}
          </div>
        </div>
      </div>

      <ModalComparisonContestants
        active={activeModalComparisonContestants}
        setActive={(v: boolean) => {
          dispatch(
            setComparisonSettings({
              ...comparisonSettings,
              activeModalComparisonContestants: v,
            }),
          );
        }}
        plagiators={plagiators}
      />
      <ModalComparisonPairs
        active={activeModalComparisonPairs}
        setActive={(v: boolean) => {
          dispatch(
            setComparisonSettings({
              ...comparisonSettings,
              activeModalComparisonPairs: v,
            }),
          );
        }}
        setModalComparisonActive={setModalComparisonActive}
        plagiatComparisons={plagiatComparisons}
      />
      <ModalComparison
        active={modalComparisonActive}
        setActive={setModalComparisonActive}
      />
      <ModalComparisons
        active={modalComparisonsActive}
        setActive={setModalComparisonsActive}
        setModalComparisonActive={setModalComparisonActive}
        plagiatComparisons={plagiatComparisons}
        plagiatSubmissions={plagiatSubmissions}
      />
      <ModalSubmissions
        active={modalSubmissionsActive}
        setActive={setModalSubmissionsActive}
        setModalComparisonsActive={setModalComparisonsActive}
        plagiatSubmissions={plagiatSubmissions}
      />
    </>
  );
};
