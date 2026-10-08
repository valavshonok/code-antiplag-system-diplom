import { FC } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { buildSubmissionConditionMap } from "./Conditions";
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
}

export const ModalSubmissions: FC<ModalSubmissionsProps> = ({
  active,
  setActive,
  setModalConditionActive,
}) => {
  const dispatch = useAppDispatch();

  const { problem, contestant, submissions } = useAppSelector(
    (state) => state.store.conditions.modalSubmission,
  );

  const { conditions } = useAppSelector(
    (state) => state.conditions.fetchConditions,
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
            let totalConditions = 0;
            let maxSatisfied = 0;
            let hasUnreviewedByExpert = false;

            const condition = submissionConditionMap.get(item.id);
            if (condition) {
              if (totalConditions === 0) {
                totalConditions = condition.conditionResults.conditions.length;
              }

              const satisfiedCount =
                condition.conditionResults.conditions.reduce((acc, cond) => {
                  if (cond.expert_verdict === null && !cond.satisfied) {
                    hasUnreviewedByExpert = true;
                  }

                  const isSatisfied =
                    cond.expert_verdict === true ||
                    (cond.expert_verdict === null && cond.satisfied);

                  return acc + (isSatisfied ? 1 : 0);
                }, 0);

              maxSatisfied = Math.max(maxSatisfied, satisfiedCount);
            }

            const displayText = `${maxSatisfied}/${totalConditions}`;

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
                    maxSatisfied === totalConditions && "text-liquid-green",
                    maxSatisfied === 0 &&
                      totalConditions > 0 &&
                      "text-liquid-red",
                    maxSatisfied > 0 &&
                      maxSatisfied !== totalConditions &&
                      totalConditions > 0 &&
                      "text-liquid-orange",
                  )}
                >
                  {displayText}
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
