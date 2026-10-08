import { FC, ReactElement } from "react";
import { Modal } from "../../../components/modal/Modal";
import { PrimaryButton } from "../../../components/button/PrimaryButton";
import { SecondaryButton } from "../../../components/button/SecondaryButton";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalDownloadProps {
  active: boolean;
  setActive: (value: boolean) => void;
  downloadClick: () => void;
  title: string;
  children?: ReactElement;
}

export const ModalDownload: FC<ModalDownloadProps> = ({
  active,
  setActive,
  downloadClick,
  title = "",
  children,
}) => {
  return (
    <Modal
      className="bg-liquid-background border-liquid-border border-[2px] p-[25px] rounded-[20px] text-liquid-white"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-10"
    >
      <div className="w-[600px] flex flex-col items-center max-h-[600px]">
        <div
          className="h-[25px] w-[25px] absolute right-[15px] top-[15px]  cursor-pointer flex items-center justify-center z-50"
          onClick={() => {
            setActive(false);
          }}
        >
          <CloseButton className="h-[16px] w-[16px] text-liquid-modal-closeicon" />
        </div>
        <div className="w-full text-[22px] flex items-center justify-center font-bold mb-[20px]">
          {title}
        </div>
        <div className="w-full">{children}</div>
        <div className="flex flex-row w-full items-center justify-end mt-[20px] gap-[20px]">
          <PrimaryButton
            onClick={() => {
              downloadClick();
              setActive(false);
            }}
            text="Скачать"
          />
          <SecondaryButton
            onClick={() => {
              setActive(false);
            }}
            text="Отмена"
          />
        </div>
      </div>
    </Modal>
  );
};
