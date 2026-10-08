import { FC, useMemo } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getSimilarityColor } from "./Comparisons";
import { cn } from "../../../lib/cn";
import { setComparisonModalComparison } from "../../../redux/slices/store";
import { Submission } from "../../../types/submissions";
import { Contestant } from "../../../types/contestants";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalComparisonsProps {
  active: boolean;
  setActive: (value: boolean) => void;
  setModalComparisonActive: (value: boolean) => void;
  plagiatComparisons: Set<number>;
  plagiatSubmissions: Set<number>;
}

export const ModalComparisons: FC<ModalComparisonsProps> = ({
  active,
  setActive,
  setModalComparisonActive,
  plagiatComparisons,
  plagiatSubmissions,
}) => {
  const dispatch = useAppDispatch();

  const { problem, contestant, submission } = useAppSelector(
    (state) => state.store.comparison.modalComparisons,
  );

  const { comparisons } = useAppSelector(
    (state) => state.comparisons.fetchComparisons,
  );

  const { submissions } = useAppSelector(
    (state) => state.submissions.fetchSubmissions,
  );

  const { contestants } = useAppSelector(
    (state) => state.contestants.fetchContestants,
  );

  const { originalityColorThreshold, useNormalization } = useAppSelector(
    (state) => state.store.comparison.settings,
  );

  const submissionsMap = useMemo(() => {
    const map = new Map<number, Submission>();
    submissions.forEach((s) => map.set(s.id, s));
    return map;
  }, [submissions]);

  const contestantsMap = useMemo(() => {
    const map = new Map<number, Contestant>();
    contestants.forEach((c) => map.set(c.id, c));
    return map;
  }, [contestants]);

  const sortedComparisons = useMemo(() => {
    if (!submission) return [];

    return comparisons
      .filter((c) => c.submission1Id === submission.id)
      .sort(
        (a, b) =>
          (useNormalization ? b.matchPercentNormalized : b.matchPercent) -
          (useNormalization ? a.matchPercentNormalized : a.matchPercent),
      );
  }, [comparisons, submissions, submission]);

  const getSubmissionLabel = (submissionId: number, plagiat?: boolean) => {
    const sub = submissionsMap.get(submissionId);
    if (!sub) return submissionId;

    const author = contestantsMap.get(sub.contestantId);
    return (
      <div className="flex items-center justify-center flex-col relative">
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-white font-bol",
            plagiat && "text-red-500",
          )}
        >
          {sub.id}
        </div>
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-liquid-light",
            plagiat && "text-red-400",
          )}
        >
          {author?.name ?? ""}
        </div>
      </div>
    );
  };

  return (
    <Modal
      className="bg-liquid-background border-liquid-border border-[2px] p-[25px] px-[10px] rounded-[20px] text-liquid-white"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-20"
    >
      <div className="w-[740px] flex flex-col items-center max-h-[600px]">
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

        <div className="w-full max-h-[400px] overflow-auto thin-dark-scrollbar rounded-[12px] p-2">
          {sortedComparisons.length === 0 ? (
            <div className="text-center opacity-60">Нет сравнений</div>
          ) : (
            <div className="grid grid-cols-[1fr,20px,1fr,100px] p-[8px] px-[20px] border-b border-liquid-border w-full">
              <span className="flex justify-center items-center">
                Посылка 1
              </span>
              <span className="flex justify-center items-center"> - </span>
              <span className="flex justify-center items-center">
                Посылка 2
              </span>
              <span className={cn("flex items-center justify-center")}>
                Схожесть
              </span>
            </div>
          )}

          {sortedComparisons.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr,20px,1fr,100px] p-[8px] px-[20px] border-b border-liquid-border cursor-pointer hover:bg-liquid-lighter transition-all duration-200 rounded-[10px] relative"
              onClick={() => {
                dispatch(
                  setComparisonModalComparison({
                    problem,
                    contestant,
                    comparisonId: v.id,
                  }),
                );
                setModalComparisonActive(true);
              }}
            >
              <span className="flex justify-center items-center">
                {getSubmissionLabel(
                  v.submission1Id,
                  plagiatComparisons.has(v.id),
                )}
              </span>
              <span
                className={cn(
                  "flex justify-center items-center",
                  plagiatComparisons.has(v.id) && "text-red-400",
                )}
              >
                {" "}
                -{" "}
              </span>
              <span className="flex justify-center items-center">
                {getSubmissionLabel(
                  v.submission2Id,
                  plagiatSubmissions.has(v.submission2Id),
                )}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center",
                  getSimilarityColor(
                    useNormalization
                      ? v.matchPercentNormalized
                      : v.matchPercent,
                    originalityColorThreshold,
                  ),
                )}
              >
                {useNormalization ? v.matchPercentNormalized : v.matchPercent}%
              </span>
              {plagiatComparisons.has(v.id) && (
                <span className=" absolute bg-red-600 h-[5px] w-[5px] top-[10px] left-[20px] rounded-full"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
