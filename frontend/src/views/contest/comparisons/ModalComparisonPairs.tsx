import { FC, useMemo } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getSimilarityColor } from "./Comparisons";
import { cn } from "../../../lib/cn";
import { setComparisonModalComparison } from "../../../redux/slices/store";
import { Submission } from "../../../types/submissions";
import { Contestant } from "../../../types/contestants";
import { SubmissionComparisonSummary } from "../../../types/comparisons";
import { ReverseButton } from "../../../components/button/ReverseButton";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalComparisonPairsProps {
  active: boolean;
  setActive: (value: boolean) => void;
  setModalComparisonActive: (value: boolean) => void;
  plagiatComparisons: Set<number>;
}

export const ModalComparisonPairs: FC<ModalComparisonPairsProps> = ({
  active,
  setActive,
  setModalComparisonActive,
  plagiatComparisons,
}) => {
  const dispatch = useAppDispatch();

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
    return comparisons
      .filter((c) => c.plagiarism && c.submission1Id < c.submission2Id)
      .sort(
        (a, b) =>
          (useNormalization ? b.matchPercentNormalized : b.matchPercent) -
          (useNormalization ? a.matchPercentNormalized : a.matchPercent),
      );
  }, [comparisons, submissions]);

  const getSubmissionLabel = (submissionId: number, plagiat?: boolean) => {
    const sub = submissionsMap.get(submissionId);
    if (!sub) return submissionId;

    const author = contestantsMap.get(sub.contestantId);
    return (
      <div className="flex items-center justify-center flex-col relative">
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-white font-bol",
            plagiat && "text-red-500",
          )}
        >
          {sub.id}
        </div>
        <div
          className={cn(
            "text-center text-[14px] leading-[18px] text-gray-300",
            plagiat && "text-red-400",
          )}
        >
          {author?.name ?? ""}
        </div>
      </div>
    );
  };

  const handleDownloadExcel = () => {
    const data = sortedComparisons.map((v) => {
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
        Схожесть:
          (useNormalization ? v.matchPercentNormalized : v.matchPercent) + "%",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 50 },
      { wch: 15 },
      { wch: 50 },
      { wch: 12 },
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
          className="h-[25px] w-[25px] absolute right-[20px] top-[20px]  cursor-pointer flex items-center justify-center z-50"
          onClick={() => {
            setActive(false);
          }}
        >
          <CloseButton className="h-[16px] w-[16px] text-liquid-modal-closeicon" />
        </div>
        <div className="font-bold text-[20px] mb-[15px] text-center whitespace-pre-line flex items-center justify-center w-full relative">
          Пары посылок с плагиатом
          <ReverseButton
            onClick={() => {
              handleDownloadExcel();
            }}
            className=" absolute left-[10px]"
            padding="px-[8px] py-[4px]"
          >
            <div className="text-[14px]">Скачать</div>
          </ReverseButton>
        </div>

        <div className="w-full max-h-[400px] overflow-auto thin-dark-scrollbar rounded-[12px] p-2">
          {sortedComparisons.length === 0 ? (
            <div className="text-center opacity-60">Нет сравнений</div>
          ) : (
            <div className="grid grid-cols-[65px,1fr,20px,1fr,100px] p-[8px] px-[20px] border-b border-liquid-border w-full">
              <span className="flex justify-center items-center ">Задача</span>
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
              className="grid grid-cols-[65px,1fr,20px,1fr,100px] p-[8px] px-[20px] border-b border-liquid-border cursor-pointer hover:bg-liquid-lighter transition-all duration-200 rounded-[10px] relative"
              onClick={() => {
                const c = comparisonsMap.get(v.id);
                if (c === undefined) {
                  return;
                }
                const s = submissionsMap.get(c.submission1Id);
                if (s === undefined) {
                  return;
                }
                const author = contestantsMap.get(s.contestantId);
                if (author === undefined) {
                  return;
                }
                dispatch(
                  setComparisonModalComparison({
                    problem: s.problem,
                    contestant: author,
                    comparisonId: v.id,
                  }),
                );
                setModalComparisonActive(true);
              }}
            >
              <span className="flex justify-center items-center text-red-400">
                {
                  submissionsMap.get(
                    comparisonsMap.get(v.id)?.submission1Id ?? 0,
                  )?.problem
                }
              </span>
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
                  plagiatComparisons.has(v.id),
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
