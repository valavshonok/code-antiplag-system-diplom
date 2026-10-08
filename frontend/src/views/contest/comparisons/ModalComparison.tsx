import { FC, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchComparisonById,
  setComparisonPlagiarism,
} from "../../../redux/slices/comparisons";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { CheckboxView } from "../../../components/checkbox/CheckboxView";
import { DropDownList } from "../../../components/input/DropDownList";
import { cn } from "../../../lib/cn";
import { Contestant } from "../../../types/contestants";
import { Submission } from "../../../types/submissions";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalComparisonProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

type CodeShowTypeItems = "Блоки" | "Текст" | "Объединение";

export const ModalComparison: FC<ModalComparisonProps> = ({
  active,
  setActive,
}) => {
  const codeShowTypeItems: CodeShowTypeItems[] = [
    "Текст",
    "Блоки",
    "Объединение",
  ];

  const dispatch = useAppDispatch();
  const { contestant, comparisonId } = useAppSelector(
    (state) => state.store.comparison.modalComparison,
  );
  const { comparison } = useAppSelector(
    (state) => state.comparisons.fetchComparisonById,
  );

  const { comparisons } = useAppSelector(
    (state) => state.comparisons.fetchComparisons,
  );

  const { contestants } = useAppSelector(
    (state) => state.contestants.fetchContestants,
  );

  const { submissions } = useAppSelector(
    (state) => state.submissions.fetchSubmissions,
  );

  const [useNormalizedCode, setUseNormalizedCode] = useState<boolean>(false);
  const [useHighlightingDifferences, setUseHighlightingDifferences] =
    useState<boolean>(true);
  const [codeShowType, setCodeShowType] = useState<CodeShowTypeItems>(
    codeShowTypeItems[0],
  );

  const plagiarism =
    comparisons.find((c) => c.id === comparison.id)?.plagiarism ??
    comparison.plagiarism;

  const contestantsMap = useMemo(() => {
    const map = new Map<number, Contestant>();
    contestants.forEach((c) => map.set(c.id, c));
    return map;
  }, [contestants]);

  const submissionsMap = useMemo(() => {
    const map = new Map<number, Submission>();
    submissions.forEach((s) => map.set(s.id, s));
    return map;
  }, [submissions]);

  useEffect(() => {
    if (comparisonId && active) {
      dispatch(
        fetchComparisonById({ contestId: contestant.contestId, comparisonId }),
      );
    }
  }, [comparisonId, active]);

  useEffect(() => {
    setCodeShowType(codeShowTypeItems[0]);
  }, [active]);

  return (
    <Modal
      className="bg-liquid-background border-liquid-border border-[2px] p-[15px] rounded-[15px] text-liquid-white"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-30"
    >
      <div className="relative h-[95vh] w-[1440px] max-w-[100vw]">
        <div
          className="h-[25px] w-[25px] absolute right-[10px] top-[10px]  cursor-pointer flex items-center justify-center z-50"
          onClick={() => {
            setActive(false);
          }}
        >
          <CloseButton className="h-[16px] w-[16px] text-liquid-modal-closeicon" />
        </div>
        <div className="grid grid-rows-[120px,15px,1fr] h-full">
          <div className="grid grid-rows-[55px,65px]">
            <div className="flex flex-row  items-center ">
              <DropDownList
                items={codeShowTypeItems}
                onChange={(v: string) => {
                  setCodeShowType(v as CodeShowTypeItems);
                }}
                weight="w-[275px]"
              />
              <Checkbox
                onChange={setUseHighlightingDifferences}
                defaultState={useHighlightingDifferences}
                label="Показать различия"
                color="secondary"
              />
              <Checkbox
                onChange={setUseNormalizedCode}
                defaultState={useNormalizedCode}
                label="Нормализовтаь код"
                color="secondary"
              />
              <CheckboxView
                onClick={(v: boolean) => {
                  const s1 = comparison.submission1Id;
                  const s2 = comparison.submission2Id;

                  const samePairComparisons = comparisons.filter(
                    (c) =>
                      (c.submission1Id === s1 && c.submission2Id === s2) ||
                      (c.submission1Id === s2 && c.submission2Id === s1),
                  );

                  samePairComparisons.forEach((c) => {
                    dispatch(
                      setComparisonPlagiarism({
                        contestId: contestant.contestId,
                        comparisonId: c.id,
                        plagiarism: !v,
                      }),
                    );
                  });
                }}
                active={plagiarism}
                label="Плагиат"
                color="danger"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6 h-full items-center  pr-[10px]">
              <div className="">
                <div className="truncate">
                  {"Задача: " +
                    submissionsMap.get(comparison.submission1Id)?.problem +
                    ", Язык: " +
                    submissionsMap.get(comparison.submission1Id)?.language +
                    " - " +
                    comparison.submission1Id}
                </div>
                <div className="truncate">
                  {
                    contestantsMap.get(
                      submissionsMap.get(comparison.submission1Id)
                        ?.contestantId ?? 0,
                    )?.name
                  }
                </div>
              </div>
              {/* submission 2 */}
              <div>
                <div className="truncate">
                  {"Задача: " +
                    submissionsMap.get(comparison.submission2Id)?.problem +
                    ", Язык: " +
                    submissionsMap.get(comparison.submission2Id)?.language +
                    " - " +
                    comparison.submission2Id}
                </div>
                <div className="truncate">
                  {
                    contestantsMap.get(
                      submissionsMap.get(comparison.submission2Id)
                        ?.contestantId ?? 0,
                    )?.name
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 h-full items-start pr-[10px]">
            <div className="bg-liquid-border h-[2px] rounded-full"></div>
            <div className="bg-liquid-border h-[2px] rounded-full"></div>
          </div>

          <div className=" overflow-y-scroll thin-dark-scrollbar pr-[5px]">
            <div className="whitespace-pre-wrap break-words text-[14px] relative ">
              {codeShowType === "Блоки" && (
                <>
                  <div className="grid grid-cols-2 gap-x-6">
                    {(useNormalizedCode
                      ? comparison.diffStringBlocksNormalized
                      : comparison.diffStringBlocks
                    ).map((block, i) => {
                      const isDifferent = block.type === "different";

                      return (
                        <div key={i} className="contents">
                          <div
                            className={`rounded-md whitespace-pre-wrap mx-[5px] ${
                              isDifferent && useHighlightingDifferences
                                ? "bg-liquid-comparisons-diffgreen"
                                : ""
                            }`}
                          >
                            {block.text1.join("\n")}
                          </div>

                          <div
                            className={`rounded-md whitespace-pre-wrap mx-[5px] ${
                              isDifferent && useHighlightingDifferences
                                ? "bg-liquid-comparisons-diffred"
                                : ""
                            }`}
                          >
                            {block.text2.join("\n")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {codeShowType === "Текст" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="mx-[5px]">
                    {(useNormalizedCode
                      ? comparison.diffCharBlocksNormalized
                      : comparison.diffCharBlocks
                    ).map((block, i) => {
                      const isEmptyText =
                        !block.text1 ||
                        block.text1.replace(/\s+/g, "").length === 0;

                      if (block.type === "equal") {
                        return <span key={i * 2}>{block.text1}</span>;
                      }

                      return (
                        <span
                          key={i * 2}
                          className={cn(
                            useHighlightingDifferences && !isEmptyText
                              ? "bg-liquid-comparisons-diffgreen px-1 rounded"
                              : "",
                          )}
                        >
                          {block.text1}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mx-[5px]">
                    {(useNormalizedCode
                      ? comparison.diffCharBlocksNormalized
                      : comparison.diffCharBlocks
                    ).map((block, i) => {
                      const isEmptyText =
                        !block.text2 ||
                        block.text2.replace(/\s+/g, "").length === 0;
                      if (block.type === "equal") {
                        return <span key={i * 2 + 1}>{block.text2}</span>;
                      }

                      return (
                        <span
                          key={i * 2 + 1}
                          className={cn(
                            useHighlightingDifferences && !isEmptyText
                              ? "bg-liquid-comparisons-diffred px-1 rounded"
                              : "",
                          )}
                        >
                          {block.text2}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {codeShowType === "Объединение" && (
                <div className="mx-[5px]">
                  {(useNormalizedCode
                    ? comparison.diffCharBlocksNormalized
                    : comparison.diffCharBlocks
                  ).map((block, i) => {
                    if (block.type === "equal") {
                      return <span key={i * 2}>{block.text1}</span>;
                    }

                    return (
                      <>
                        <span
                          key={i * 2}
                          className={cn(
                            "px-1 rounded ml-0.5 bg-liquid-comparisons-diffgreen",
                          )}
                        >
                          {block.text1}
                        </span>

                        <span
                          key={i * 2}
                          className={cn(
                            "px-1 rounded ml-0.5 bg-liquid-comparisons-diffred",
                          )}
                        >
                          {block.text2}
                        </span>
                      </>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
