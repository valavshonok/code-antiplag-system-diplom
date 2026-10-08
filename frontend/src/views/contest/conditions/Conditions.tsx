import { FC, Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  setConditionModalSubmissions,
  setConditionSettings,
  setMenuActivePage,
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
import { ModalConditionsAll } from "./ModalConditionsAll";
import { ModalConditionsCritical } from "./ModalConditionsCritical";

interface ConditionsProps {
  contest: Contest;
}

type ContestMatrix = Map<number, Map<string, Submission[]>>;

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

export function getContestantMap(
  contestants: Contestant[],
): Map<number, Contestant> {
  const map = new Map<number, Contestant>();

  for (const contestant of contestants) {
    map.set(contestant.id, contestant);
  }

  return map;
}

export const Conditions: FC<ConditionsProps> = ({ contest }) => {
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

  const { conditions } = useAppSelector(
    (state) => state.conditions.fetchConditions,
  );

  const { processes } = useAppSelector(
    (state) => state.contests.fetchContestProcesses,
  );

  const conditionSettings = useAppSelector(
    (state) => state.store.conditions.settings,
  );

  const conditionProcess = processes.find(
    (p: Process) => p.processType === "condition",
  );

  useEffect(() => {
    if (conditionProcess && conditionProcess.status == "done") {
      dispatch(setMenuActivePage("conditions"));
      dispatch(fetchConditions(contest.id));
      dispatch(fetchSubmissions(contest.id));
      dispatch(fetchContestants(contest.id));
    }
  }, [conditionProcess]);

  useEffect(() => {
    dispatch(setMenuActivePage("conditions"));
    dispatch(fetchContestProcesses(contest.id));
  }, []);

  const submissionConditionMap = buildSubmissionConditionMap(conditions);
  const problems = getContestProblems(submissions);
  const contestMap = buildContestMatrix(submissions);
  const contestantsRow = getContestantsSortedByUniqueSubmissions(
    contestants,
    submissions,
  );

  return (
    <>
      <div className="h-screen w-full box-border p-[10px] pr-[5px] border-liquid-border border-l-[1px] text-liquid-white">
        <div className="h-full flex flex-col">
          <div className="h-[50px] text-[40px] font-bold text-liquid-white flex items-center mb-4">
            Проверка
          </div>

          <div className="flex-1 overflow-auto thin-dark-scrollbar pr-[5px]">
            {!conditionProcess || conditionProcess.status != "done" ? (
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

                        let totalConditions = 0;
                        let maxSatisfied = 0;
                        let hasUnreviewedByExpert = false;

                        for (const submission of submissions) {
                          const condition = submissionConditionMap.get(
                            submission.id,
                          );
                          if (!condition) continue;

                          // Берём totalConditions из первой найденной посылки
                          if (totalConditions === 0) {
                            totalConditions =
                              condition.conditionResults.conditions.length;
                          }

                          const satisfiedCount =
                            condition.conditionResults.conditions.reduce(
                              (acc, cond) => {
                                if (
                                  cond.expert_verdict === null &&
                                  !cond.satisfied
                                ) {
                                  hasUnreviewedByExpert = true;
                                }

                                const isSatisfied =
                                  cond.expert_verdict === true ||
                                  (cond.expert_verdict === null &&
                                    cond.satisfied);

                                return acc + (isSatisfied ? 1 : 0);
                              },
                              0,
                            );

                          maxSatisfied = Math.max(maxSatisfied, satisfiedCount);
                        }

                        const displayText = `${maxSatisfied}/${totalConditions}`;

                        return (
                          <div
                            key={problem}
                            className={cn(
                              "border-liquid-border border-[1px] p-2 flex items-center justify-center cursor-pointer hover:bg-liquid-lighter hover:text-liquid-brightmain transition-all duration-300 relative",

                              maxSatisfied === totalConditions &&
                                "text-liquid-green",

                              maxSatisfied === 0 &&
                                totalConditions > 0 &&
                                "text-liquid-red",

                              maxSatisfied > 0 &&
                                maxSatisfied !== totalConditions &&
                                totalConditions > 0 &&
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
                            {displayText}
                            {hasUnreviewedByExpert && (
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

      <ModalConditionsAll
        active={conditionSettings.activeModalConditionsAll}
        setActive={(v: boolean) => {
          dispatch(
            setConditionSettings({
              ...conditionSettings,
              activeModalConditionsAll: v,
            }),
          );
        }}
        setModalConditionActive={setModalConditionActive}
      />
      <ModalConditionsCritical
        active={conditionSettings.activeModalConditionsCritical}
        setActive={(v: boolean) => {
          dispatch(
            setConditionSettings({
              ...conditionSettings,
              activeModalConditionsCritical: v,
            }),
          );
        }}
        setModalConditionActive={setModalConditionActive}
      />
      <ModalCondition
        active={modalConditionActive}
        setActive={setModalConditionActive}
      />
      <ModalSubmissions
        active={modalSubmissionsActive}
        setActive={setModalSubmissionsActive}
        setModalConditionActive={setModalConditionActive}
      />
    </>
  );
};
