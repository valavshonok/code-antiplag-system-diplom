import { FC } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  buildSubmissionConditionMap,
  calculateFinalScore,
  roundToStep,
} from "./Statistics";
import { cn } from "../../../lib/cn";
import { setConditionModalCondition } from "../../../redux/slices/store";
import { Submission } from "../../../types/submissions";
import { Contestant } from "../../../types/contestants";
import { defaultSubmissionCondition } from "../../../types/conditions";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalSubmissionsProps {
  active: boolean;
  setActive: (value: boolean) => void;
  setModalConditionActive: (value: boolean) => void;

  plagiatSubmissions: Set<number>;
  plagiators: Set<number>;
}

export const ModalSubmissions: FC<ModalSubmissionsProps> = ({
  active,
  setActive,
  setModalConditionActive,
  plagiatSubmissions,
  plagiators,
}) => {
  const dispatch = useAppDispatch();

  const { problem, contestant, submissions } = useAppSelector(
    (state) => state.store.conditions.modalSubmission,
  );

  const { conditions } = useAppSelector(
    (state) => state.conditions.fetchConditions,
  );

  const statisticSettings = useAppSelector(
    (state) => state.store.statistics.settings,
  );

  const submissionConditionMap = buildSubmissionConditionMap(conditions);

  const getSubmissionLabel = (
    submission: Submission,
    contestant: Contestant,
  ) => {
    return (
      <div className="flex items-center justify-center flex-col relative">
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-white font-bol",
          )}
        >
          {submission.id}
        </div>
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-light",
          )}
        >
          {contestant?.name ?? ""}
        </div>
      </div>
    );
  };

  return (
    <Modal
      className="bg-liquid-background border-liquid-border border-[2px] p-[25px] rounded-[20px] text-liquid-white"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-10"
    >
      <div className="w-[600px] flex flex-col items-center max-h-[600px]">
        <div
          className="h-[25px] w-[25px] absolute right-[10px] top-[10px]  cursor-pointer flex items-center justify-center z-50"
          onClick={() => {
            setActive(false);
          }}
        >
          <CloseButton className="h-[16px] w-[16px] text-liquid-modal-closeicon" />
        </div>
        <div className="font-bold text-[20px] mb-[15px] text-center whitespace-pre-line">
          {"Задача: " + problem + "\n" + contestant?.name}
        </div>

        <div className="w-full overflow-auto thin-dark-scrollbar flex-1 justify-center flex-col px-[8px]">
          <div className="grid grid-cols-[1fr,100px,90px,100px] p-[8px] px-[20px] border-b border-liquid-border w-full">
            <span className="flex justify-center items-center">Посылка</span>
            <span className="flex justify-center items-center">Язык</span>
            <span className="flex justify-center items-center">Вердикт</span>
            <span className={cn("flex items-center justify-center")}>
              Условия
            </span>
          </div>
          {submissions.map((item) => {
            let totalScore = 0;
            let maxScore = 0;
            let hasUnreviewedByExpert = false;
            let plagiat = false;

            for (const submission of submissions) {
              const condition = submissionConditionMap.get(submission.id);
              if (!condition) continue;

              hasUnreviewedByExpert ||=
                condition.conditionResults.conditions.some(
                  (cond) => cond.expert_verdict === null && !cond.satisfied,
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

              if (plagiatSubmissions.has(submission.id)) plagiat = true;
            }

            if (statisticSettings.resetScoreOnPlagiarismTask && plagiat)
              maxScore = 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "grid grid-cols-[1fr,100px,90px,100px] p-2 px-[20px] border-b border-liquid-border cursor-pointer hover:bg-liquid-lighter transition-all duration-200 rounded-[10px] w-full relative",
                )}
                onClick={() => {
                  dispatch(
                    setConditionModalCondition({
                      contestant,
                      submission: item,
                      condition:
                        submissionConditionMap.get(item.id) ??
                        defaultSubmissionCondition,
                    }),
                  );
                  setModalConditionActive(true);
                }}
              >
                <span>{getSubmissionLabel(item, contestant)}</span>
                <span className={cn("flex justify-center items-center")}>
                  {item.language}
                </span>
                <span className={cn("flex justify-center items-center")}>
                  {item.verdict}
                </span>
                <span
                  className={cn(
                    " flex items-center justify-center",
                    "text-liquid-green",

                    totalScore &&
                      maxScore / totalScore <= 0.25 &&
                      "text-liquid-red",

                    totalScore &&
                      maxScore / totalScore > 0.25 &&
                      maxScore / totalScore < 0.85 &&
                      "text-liquid-orange",
                  )}
                >
                  <span>{roundToStep(maxScore)}</span>
                  <span className="absolute top-[5px] right-[15px] text-liquid-light text-[12px]">
                    {roundToStep(totalScore)}
                  </span>
                </span>
                {hasUnreviewedByExpert && (
                  <span className=" absolute bg-red-600 h-[5px] w-[5px] top-[10px] left-[10px] rounded-full"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
