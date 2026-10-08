import { FC, useState } from "react";
import { useAppDispatch } from "../../../../redux/hooks";
import { setStopProcess } from "../../../../redux/slices/store";
// import { cn } from "../../../lib/cn";
import { Contest } from "../../../../types/contest";
import { Process } from "../../../../types/process";
import { ReverseButton } from "../../../../components/button/ReverseButton";
import { ModalImportProcess } from "./ModalImportProcess";
import { toastWarning } from "../../../../lib/toastNotification";
import { ModalImportRestart } from "./ModalImportRestart";

interface ImportProcessesProps {
  contest: Contest;
  processes: Process[];
  setModalStopProcessActive: (v: boolean) => void;
}

export const ImportProcesses: FC<ImportProcessesProps> = ({
  contest,
  processes,
  setModalStopProcessActive,
}) => {
  const dispatch = useAppDispatch();

  const [modalImportProcessActive, setModalImportProcessActive] =
    useState<boolean>(false);
  const [modalImportRestartActive, setModalImportRestartActive] =
    useState<boolean>(false);

  const importProcess = processes.find(
    (p: Process) => p.processType === "import",
  );

  const runningProcessesCount = processes.filter(
    (p: Process) => p.status === "running",
  ).length;

  return (
    <>
      <div className="p-4 border-solid border-[2px] border-liquid-processes-border text-liquid-processes-text bg-liquid-processes-background rounded-[10px] mb-[20px] mr-[5px]">
        <div className="font-bold mb-2 text-[20px]">Импорт данных</div>

        {importProcess && importProcess.status != "none" ? (
          <div className="">
            {importProcess.status === "running" && (
              <div>Импорт в процессе... {importProcess.progress}%</div>
            )}
            {importProcess.status === "done" && <div>Импорт завершен</div>}
            {importProcess.status === "error" && <div>Ошибка импорта</div>}
            {importProcess.status == "running" ? (
              <ReverseButton
                text="Остановить"
                className="mt-[10px]"
                color="error"
                onClick={() => {
                  dispatch(
                    setStopProcess({
                      process: importProcess,
                      contestId: contest.id,
                    }),
                  );
                  setModalStopProcessActive(true);
                }}
              />
            ) : (
              <ReverseButton
                text="Импорт даных"
                className="mt-[10px]"
                onClick={() => {
                  if (runningProcessesCount == 0) {
                    setModalImportRestartActive(true);
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
              Импорт данных еще не был выполнен
            </div>
            <ReverseButton
              text="Импорт даных"
              onClick={() => {
                if (runningProcessesCount == 0) {
                  setModalImportProcessActive(true);
                } else {
                  toastWarning(
                    "Дождитесь завершения активных процессов, или завершите их преждевременно",
                  );
                }
              }}
            />
          </div>
        )}
      </div>

      <ModalImportProcess
        active={modalImportProcessActive}
        setActive={setModalImportProcessActive}
        contest={contest}
      />

      <ModalImportRestart
        contest={contest}
        active={modalImportRestartActive}
        setActive={setModalImportRestartActive}
        setModalImportProcessActive={setModalImportProcessActive}
      />
    </>
  );
};
