import { FC, useMemo } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

interface ModalSubmissionsProps {
  active: boolean;
  setActive: (value: boolean) => void;
  setModalComparisonsActive: (value: boolean) => void;
  plagiatSubmissions: Set<number>;
}

import { getSimilarityColor } from "./Comparisons";
import { cn } from "../../../lib/cn";
import { setComparisonModalComparisons } from "../../../redux/slices/store";
import { Submission } from "../../../types/submissions";
import { Contestant } from "../../../types/contestants";
import { CloseButton } from "../../../assets/icons/modal";

export const ModalSubmissions: FC<ModalSubmissionsProps> = ({
  active,
  setActive,
  setModalComparisonsActive,
  plagiatSubmissions,
}) => {
  const dispatch = useAppDispatch();

  const { problem, contestant, submissions } = useAppSelector(
    (state) => state.store.comparison.modalSubmission,
  );

  const sortedSubmissions = [...submissions].sort(
    (a, b) => b.matchPercent - a.matchPercent,
  );

  const { submissions: submissionsFull } = useAppSelector(
    (state) => state.submissions.fetchSubmissions,
  );

  const { contestants } = useAppSelector(
    (state) => state.contestants.fetchContestants,
  );

  const { originalityColorThreshold } = useAppSelector(
    (state) => state.store.comparison.settings,
  );

  const submissionsMap = useMemo(() => {
    const map = new Map<number, Submission>();
    submissionsFull.forEach((s) => map.set(s.id, s));
    return map;
  }, [submissionsFull]);

  const contestantsMap = useMemo(() => {
    const map = new Map<number, Contestant>();
    contestants.forEach((c) => map.set(c.id, c));
    return map;
  }, [contestants]);

  const getSubmissionLabel = (submissionId: number) => {
    const sub = submissionsMap.get(submissionId);
    if (!sub) return submissionId;

    const author = contestantsMap.get(sub.contestantId);
    return (
      <div className="flex items-center justify-center flex-col relative">
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-white font-bol",
            plagiatSubmissions.has(submissionId) && "text-red-500",
          )}
        >
          {sub.id}
        </div>
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-light",
            plagiatSubmissions.has(submissionId) && "text-red-400",
          )}
        >
          {author?.name ?? ""}
        </div>
        {plagiatSubmissions.has(submissionId) && (
          <span className=" absolute bg-red-600 h-[5px] w-[5px] top-0 left-0 rounded-full"></span>
        )}
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
      <div className="w-[600px] flex flex-col items-center max-h-[600px] text-liquid-white">
        <div
          className="h-[30px] w-[30px] absolute right-[10px] top-[10px]  cursor-pointer flex items-center justify-center z-50"
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
          <div className="grid grid-cols-[1fr,100px,90px,80px] p-[8px] px-[20px] border-b border-liquid-border w-full">
            <span className="flex justify-center items-center">Посылка</span>
            <span className="flex justify-center items-center">Язык</span>
            <span className="flex justify-center items-center">Вердикт</span>
            <span className={cn("flex items-center justify-center")}>
              Схожесть
            </span>
          </div>
          {sortedSubmissions.map((item) => (
            <div
              key={item.submission.id}
              className={cn(
                "grid grid-cols-[1fr,100px,90px,80px] p-2 px-[20px] border-b border-liquid-border cursor-pointer hover:bg-liquid-lighter transition-all duration-200 rounded-[10px] w-full",
              )}
              onClick={() => {
                dispatch(
                  setComparisonModalComparisons({
                    problem,
                    contestant,
                    submission: item.submission,
                  }),
                );
                setModalComparisonsActive(true);
              }}
            >
              <span>{getSubmissionLabel(item.submission.id)}</span>
              <span
                className={cn(
                  "flex justify-center items-center",
                  plagiatSubmissions.has(item.submission.id) && "text-red-400",
                )}
              >
                {item.submission.language}
              </span>
              <span
                className={cn(
                  "flex justify-center items-center",
                  plagiatSubmissions.has(item.submission.id) && "text-red-400",
                )}
              >
                {item.submission.verdict}
              </span>
              <span
                className={cn(
                  getSimilarityColor(
                    item.matchPercent,
                    originalityColorThreshold,
                  ),
                  " flex items-center justify-center",
                )}
              >
                {item.matchPercent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
