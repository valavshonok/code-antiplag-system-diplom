import { FC } from "react";
import { Modal } from "../../../../components/modal/Modal";
import { PrimaryButton } from "../../../../components/button/PrimaryButton";
import { SecondaryButton } from "../../../../components/button/SecondaryButton";
import { Contest } from "../../../../types/contest";
import { startComparisonProcess } from "../../../../redux/slices/contests";
import { useAppDispatch } from "../../../../redux/hooks";

interface ModalComparisonRestartProps {
  contest: Contest;
  active: boolean;
  setActive: (value: boolean) => void;
}

export const ModalComparisonRestart: FC<ModalComparisonRestartProps> = ({
  contest,
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    dispatch(startComparisonProcess(contest.id));
    setActive(false);
  };

  return (
    <Modal
      className="bg-liquid-modal-background border-liquid-modal-border border-[2px] p-[25px] rounded-[20px] text-liquid-modal-text"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-50"
    >
      <div className="w-[500px]">
        <div className="font-bold text-[24px] mb-[15px]">
          Перезапись сравнения
        </div>

        <p className="mb-[10px]">
          Вы собираетесь повторно запустить сравнения для контеста{" "}
          <span className="font-bold">"{contest.name}"</span>.
        </p>
        <p className="mb-[20px] text-liquid-white/70">
          Все предыдущие сравнения будут{" "}
          <span className="font-black text-liquid-red">удалены</span>.
        </p>

        <p className="mb-[20px] text-liquid-white/70">
          Вы уверены, что хотите продолжить?
        </p>

        <div className="flex flex-row w-full items-center justify-end gap-[20px]">
          <PrimaryButton onClick={handleConfirm} text="Начать сравнение" />
          <SecondaryButton onClick={() => setActive(false)} text="Отмена" />
        </div>
      </div>
    </Modal>
  );
};
