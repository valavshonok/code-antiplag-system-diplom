import { FC, useEffect } from "react";
import { Modal } from "../../../components/modal/Modal";
import { SecondaryButton } from "../../../components/button/SecondaryButton";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchContestProcesses,
  stopProcess,
} from "../../../redux/slices/contests";
import { ReverseButton } from "../../../components/button/ReverseButton";

interface ModalStopProcessProps {
  active: boolean;
  setActive: (value: boolean) => void;
}

export const ModalStopProcess: FC<ModalStopProcessProps> = ({
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();

  const { process, contestId } = useAppSelector(
    (state) => state.store.processes.stopProcess,
  );
  const { status } = useAppSelector((state) => state.contests.stopProcess);

  useEffect(() => {
    if (status === "successful") {
      dispatch(fetchContestProcesses(contestId));
      setActive(false);
    }
  }, [status]);

  const handleStop = () => {
    if (process) {
      dispatch(stopProcess({ processId: process.id, contestId: contestId }));
    }
  };

  return (
    <Modal
      className="bg-liquid-background border-liquid-lighter border-[2px] p-[25px] rounded-[20px] text-liquid-white"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
    >
      <div className="w-[500px]">
        <div className="font-bold text-[24px] mb-[15px]">
          Остановить процесс
        </div>

        {process ? (
          <div className="mb-[20px]">
            {process.processType == "import" && (
              <p>Вы действительно хотите остановить импорт данных?</p>
            )}
            {process.processType == "comparison" && (
              <p>Вы действительно хотите остановить сравнение?</p>
            )}
          </div>
        ) : (
          <p className="mb-[20px] text-liquid-white/70">Процесс не выбран</p>
        )}

        <div className="flex flex-row w-full items-center justify-end gap-[20px]">
          <ReverseButton
            color="error"
            onClick={handleStop}
            text="Остановить"
            disabled={!process || status === "loading"}
          />
          <SecondaryButton onClick={() => setActive(false)} text="Отмена" />
        </div>
      </div>
    </Modal>
  );
};
