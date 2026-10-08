import { FC } from "react";
import { Modal } from "../../../../components/modal/Modal";
import { PrimaryButton } from "../../../../components/button/PrimaryButton";
import { SecondaryButton } from "../../../../components/button/SecondaryButton";
import { Contest } from "../../../../types/contest";

interface ModalImportRestartProps {
  contest: Contest;
  active: boolean;
  setActive: (value: boolean) => void;
  setModalImportProcessActive: (value: boolean) => void;
}

export const ModalImportRestart: FC<ModalImportRestartProps> = ({
  contest,
  active,
  setActive,
  setModalImportProcessActive,
}) => {
  const handleConfirm = () => {
    setActive(false);
    setModalImportProcessActive(true);
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
          Перезапись данных контеста
        </div>

        <p className="mb-[10px]">
          Вы собираетесь загрузить новые данные для контеста{" "}
          <span className="font-bold">"{contest.name}"</span>.
        </p>
        <p className="mb-[20px] text-liquid-white/70">
          Все предыдущие данные контеста будут{" "}
          <span className="font-black text-liquid-red">удалены</span>.
        </p>

        <p className="mb-[20px] text-liquid-white/70">
          Вы уверены, что хотите продолжить?
        </p>

        <div className="flex flex-row w-full items-center justify-end gap-[20px]">
          <PrimaryButton onClick={handleConfirm} text="Продолжить" />
          <SecondaryButton onClick={() => setActive(false)} text="Отмена" />
        </div>
      </div>
    </Modal>
  );
};
