import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { setStopProcess } from "../../../../redux/slices/store";
// import { cn } from "../../../lib/cn";
import { Contest } from "../../../../types/contest";
import {
  fetchContestProcesses,
  startComparisonProcess,
} from "../../../../redux/slices/contests";
import { Process } from "../../../../types/process";
import { ReverseButton } from "../../../../components/button/ReverseButton";
import { toastWarning } from "../../../../lib/toastNotification";
import { ModalComparisonRestart } from "./ModalComparisonRestart";

interface ComparisonProcessesProps {
  contest: Contest;
  processes: Process[];
  setModalStopProcessActive: (v: boolean) => void;
}

export const ComparisonProcesses: FC<ComparisonProcessesProps> = ({
  contest,
  processes,
  setModalStopProcessActive,
}) => {
  const dispatch = useAppDispatch();

  const [modalComparisonRestartActive, setModalComparisonRestartActive] =
    useState<boolean>(false);

  const comparisonProcess = processes.find(
    (p: Process) => p.processType === "comparison",
  );

  const importProcess = processes.find(
    (p: Process) => p.processType === "import",
  );

  const { status } = useAppSelector(
    (state) => state.contests.startComparisonProcess,
  );

  useEffect(() => {
    if (status == "successful") {
      dispatch(fetchContestProcesses(contest.id));
    }
  }, [status]);

  const runningProcessesCount = processes.filter(
    (p: Process) => p.status === "running",
  ).length;

  return (
    <>
      <div className="p-4 border-solid border-[2px] border-liquid-processes-border text-liquid-processes-text bg-liquid-processes-background rounded-[10px] mb-[20px] mr-[5px]">
        <div className="font-bold mb-2 text-[20px]">Сравнение</div>
        {importProcess && importProcess.status == "done" ? (
          <>
            {comparisonProcess && comparisonProcess.status != "none" ? (
              <div className="">
                {comparisonProcess.status === "running" && (
                  <div>
                    Сравнение в процессе... {comparisonProcess.progress}%
                  </div>
                )}
                {comparisonProcess.status === "done" && (
                  <div>Сравнение завершено</div>
                )}
                {comparisonProcess.status === "error" && (
                  <div>Ошибка сравнения</div>
                )}
                {comparisonProcess.status == "running" ? (
                  <ReverseButton
                    text="Остановить"
                    className="mt-[10px]"
                    color="error"
                    onClick={() => {
                      dispatch(
                        setStopProcess({
                          process: comparisonProcess,
                          contestId: contest.id,
                        }),
                      );
                      setModalStopProcessActive(true);
                    }}
                  />
                ) : (
                  <ReverseButton
                    text="Начать сравнение"
                    className="mt-[10px]"
                    onClick={() => {
                      if (runningProcessesCount == 0) {
                        setModalComparisonRestartActive(true);
                      } else {
                        toastWarning(
                          "Дождитесь завершения активных процессов, или завершите их преждевременно",
                        );
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="">
                <div className="text-liquid-light mb-[10px]">
                  Сравнение еще не было выполнен
                </div>
                <ReverseButton
                  text="Начать сравнение"
                  onClick={() => {
                    if (runningProcessesCount == 0) {
                      dispatch(startComparisonProcess(contest.id));
                    } else {
                      toastWarning(
                        "Дождитесь завершения активных процессов, или завершите их преждевременно",
                      );
                    }
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="">
              <div className="text-liquid-light mb-[10px]">
                Для сравнения неоходимо выполнить импорт данных
              </div>
              <ReverseButton
                text="Начать сравнение"
                disabled={true}
                onClick={() => {}}
              />
            </div>
          </>
        )}
      </div>

      <ModalComparisonRestart
        active={modalComparisonRestartActive}
        setActive={setModalComparisonRestartActive}
        contest={contest}
      />
    </>
  );
};
