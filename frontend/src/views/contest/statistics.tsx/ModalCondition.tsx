import { FC, Fragment, useEffect, useState } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { CheckboxView } from "../../../components/checkbox/CheckboxView";
import { cn } from "../../../lib/cn";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  fetchConditions,
  setConditionsStatus,
  setExpertVerdict,
} from "../../../redux/slices/conditions";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalConditionProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

export const ModalCondition: FC<ModalConditionProps> = ({
  active,
  setActive,
}) => {
  const langMap: Record<string, string> = {
    cpp: "cpp",
    py: "python",
    java: "java",
  };

  const transparentOneDark = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: "transparent",
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: "transparent",
    },
    keyword: {
      ...oneDark.keyword,
      color: "#ff7b72", // ярче
    },

    string: {
      ...oneDark.string,
      color: "#7ee787",
    },

    function: {
      ...oneDark.function,
      color: "#d2a8ff",
    },

    comment: {
      ...oneDark.comment,
      color: "#8b949e",
      fontStyle: "italic",
    },

    number: {
      ...oneDark.number,
      color: "#79c0ff",
    },

    operator: {
      ...oneDark.operator,
      color: "#ff7b72",
    },
  };

  const dispatch = useAppDispatch();
  const { contestant, submission, condition } = useAppSelector(
    (state) => state.store.conditions.modalCondition,
  );

  const { conditions } = useAppSelector(
    (state) => state.conditions.fetchConditions,
  );

  const matchedCondition = conditions?.find(
    (item) => item.id === condition?.id,
  );

  const unmarkedCount =
    matchedCondition?.conditionResults.conditions.filter(
      (v) => v.expert_verdict == null && v.satisfied === false,
    ).length ?? 0;

  const { status } = useAppSelector(
    (state) => state.conditions.setExpertVerdict,
  );

  const [showOnlyUnmarked, setShowOnlyUnmarked] = useState<boolean>(true);

  useEffect(() => {
    if (status == "successful") {
      dispatch(
        setConditionsStatus({ key: "setExpertVerdict", status: "idle" }),
      );
      dispatch(fetchConditions(contestant.contestId));
    }
  }, [status]);

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
          className="h-[25px] w-[25px] absolute right-[0px] top-[0px]  cursor-pointer flex items-center justify-center z-50"
          onClick={() => {
            setActive(false);
          }}
        >
          <CloseButton className="h-[16px] w-[16px] text-liquid-modal-closeicon" />
        </div>
        <div className="grid grid-rows-[55px,15px,minmax(0,1fr)] h-full">
          <div className="flex justify-between  mr-[40px]">
            <div>
              <div className="truncate">
                {"Задача: " +
                  submission.problem +
                  ", Язык: " +
                  submission.language +
                  " - " +
                  submission.id}
              </div>
              <div className="truncate">{contestant.name}</div>
            </div>
            <div>
              <CheckboxView
                color="secondary"
                onClick={() => {
                  setShowOnlyUnmarked(!showOnlyUnmarked);
                }}
                active={showOnlyUnmarked}
                label="Требуют проверки"
              />
            </div>
          </div>

          <div className="h-full items-start  ">
            <div className="bg-liquid-border h-[2px] rounded-full"></div>
          </div>

          <div className="h-full w-full relative grid grid-cols-2 gap-[15px]">
            <div className="min-h-0 rounded-[10px] border border-liquid-border overflow-hidden p-[10px] pr-[5px]">
              <div className="h-full overflow-y-auto thin-dark-scrollbar pr-[5px]">
                <SyntaxHighlighter
                  language={langMap[submission.language] || "cpp"}
                  style={transparentOneDark}
                  customStyle={{
                    background: "transparent",
                    margin: 0,
                    padding: 0,
                    fontSize: "14px",
                  }}
                  codeTagProps={{
                    style: {},
                  }}
                  PreTag={({ children }) => (
                    <pre className="thin-dark-scrollbar-horizontal">
                      {children}
                    </pre>
                  )}
                  wrapLongLines
                >
                  {submission.code}
                </SyntaxHighlighter>
              </div>
            </div>

            <div className="min-h-0 rounded-[10px] border border-liquid-border overflow-hidden p-[10px] pr-[5px]">
              <div className="h-full overflow-y-auto thin-dark-scrollbar pr-[5px]">
                {matchedCondition?.conditionResults.conditions.length == 0 && (
                  <div className=" flex items-center justify-center h-full w-full text-liquid-light text-[24px]">
                    Для этой задачи нет ограничений
                  </div>
                )}
                {matchedCondition?.conditionResults.conditions.map(
                  (v, cIndex) => {
                    if (
                      unmarkedCount != 0 &&
                      showOnlyUnmarked &&
                      (v.expert_verdict != null || v.satisfied == true)
                    )
                      return <Fragment key={cIndex}></Fragment>;
                    return (
                      <div
                        key={cIndex}
                        className="border border-liquid-border rounded-[8px] p-[10px] bg-liquid-background mb-[10px]"
                      >
                        {/* Заголовок */}
                        <div className="flex justify-between items-start mb-[6px]">
                          <div className="font-semibold text-[18px]">
                            {v.title}
                          </div>

                          <div className="text-[14px] opacity-70">
                            {v.penalty}
                          </div>
                        </div>

                        {/* Описание */}
                        <div className="text-[16px] opacity-80 mb-[8px] whitespace-pre-line ">
                          {v.description}
                        </div>

                        <div className="h-[1px] rounded-full bg-liquid-lighter my-[8px]"></div>

                        {/* Комментарий нейросети */}
                        <div className="text-[14px] bg-liquid-lighter opacity-75 p-[6px] rounded-[6px] mb-[8px]  whitespace-pre-line">
                          {v.comment}
                        </div>

                        {/* Вердикт нейросети */}
                        <div className="text-[16px] mb-[8px]">
                          Нейросеть:{" "}
                          {v.satisfied ? (
                            <span className="text-liquid-green">Выполнено</span>
                          ) : (
                            <span className="text-liquid-red">
                              Не выполнено
                            </span>
                          )}
                        </div>

                        {/* Эксперт */}
                        <div className="flex gap-[8px] items-center">
                          <div className="text-[16px]">Эксперт:</div>

                          <div
                            className={cn(
                              "border border-liquid-light py-[2px] px-[6px] rounded-[5px] text-liquid-light cursor-pointer hover:border-liquid-brightmain hover:text-liquid-brightmain transition-all duration-300 hover:opacity-90 opacity-100 active:scale-95 select-none",
                              v.expert_verdict == true &&
                                "text-liquid-green border-liquid-green ",
                            )}
                            onClick={() => {
                              dispatch(
                                setExpertVerdict({
                                  contestId: contestant.contestId,
                                  submissionConditionId: condition.id,
                                  conditionIndex: cIndex,
                                  expertVerdict: true,
                                }),
                              );
                            }}
                          >
                            Выполнено
                          </div>
                          <div
                            className={cn(
                              "border border-liquid-light py-[2px] px-[6px] rounded-[5px] text-liquid-light cursor-pointer hover:border-liquid-brightmain hover:text-liquid-brightmain transition-all duration-300 hover:opacity-90 opacity-100 active:scale-95 select-none",
                              v.expert_verdict == false &&
                                "text-liquid-red border-liquid-red",
                            )}
                            onClick={() => {
                              dispatch(
                                setExpertVerdict({
                                  contestId: contestant.contestId,
                                  submissionConditionId: condition.id,
                                  conditionIndex: cIndex,
                                  expertVerdict: false,
                                }),
                              );
                            }}
                          >
                            Не выполнено
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
