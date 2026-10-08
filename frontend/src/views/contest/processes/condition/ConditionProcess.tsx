import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { setStopProcess } from "../../../../redux/slices/store";
import { Contest } from "../../../../types/contest";
import {
  fetchContestProcesses,
  startConditionProcess,
} from "../../../../redux/slices/contests";
import { Process } from "../../../../types/process";
import { ReverseButton } from "../../../../components/button/ReverseButton";
import { toastWarning } from "../../../../lib/toastNotification";
import { ModalConditionRestart } from "./ModalConditionRestart";

interface ConditionProcessesProps {
  contest: Contest;
  processes: Process[];
  setModalStopProcessActive: (v: boolean) => void;
}

export const ConditionProcesses: FC<ConditionProcessesProps> = ({
  contest,
  processes,
  setModalStopProcessActive,
}) => {
  const dispatch = useAppDispatch();

  const [modalConditionRestartActive, setModalConditionRestartActive] =
    useState<boolean>(false);

  const conditionProcess = processes.find(
    (p: Process) => p.processType === "condition",
  );

  const importProcess = processes.find(
    (p: Process) => p.processType === "import",
  );

  const { status } = useAppSelector(
    (state) => state.contests.startConditionProcess,
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
        <div className="font-bold mb-2 text-[20px]">Проверка ограничений</div>
        {importProcess && importProcess.status == "done" ? (
          <>
            {conditionProcess && conditionProcess.status != "none" ? (
              <div className="">
                {conditionProcess.status === "running" && (
                  <div>
                    Проверка ограничений в процессе...{" "}
                    {conditionProcess.progress}%
                  </div>
                )}
                {conditionProcess.status === "done" && (
                  <div>Проверка ограничений завершена</div>
                )}
                {conditionProcess.status === "error" && (
                  <div>Ошибка при проверке ограничений</div>
                )}
                {conditionProcess.status == "running" ? (
                  <ReverseButton
                    text="Остановить"
                    className="mt-[10px]"
                    color="error"
                    onClick={() => {
                      dispatch(
                        setStopProcess({
                          process: conditionProcess,
                          contestId: contest.id,
                        }),
                      );
                      setModalStopProcessActive(true);
                    }}
                  />
                ) : (
                  <ReverseButton
                    text="Начать проверку"
                    className="mt-[10px]"
                    onClick={() => {
                      if (runningProcessesCount == 0) {
                        setModalConditionRestartActive(true);
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
                  Проверка еще не была выполнена
                </div>
                <ReverseButton
                  text="Начать проверку"
                  onClick={() => {
                    if (runningProcessesCount == 0) {
                      dispatch(startConditionProcess(contest.id));
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

      <ModalConditionRestart
        active={modalConditionRestartActive}
        setActive={setModalConditionRestartActive}
        contest={contest}
      />
    </>
  );
};
