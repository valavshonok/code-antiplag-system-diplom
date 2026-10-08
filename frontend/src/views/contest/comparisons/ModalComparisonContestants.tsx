import { FC, useMemo } from "react";
import { Modal } from "../../../components/modal/Modal";
import { useAppSelector } from "../../../redux/hooks";
import { Contestant } from "../../../types/contestants";
import { CopyIcon } from "../../../assets/icons/missions";
import { toastSuccess } from "../../../lib/toastNotification";
import { ReverseButton } from "../../../components/button/ReverseButton";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CloseButton } from "../../../assets/icons/modal";

interface ModalComparisonContestantsProps {
  active: boolean;
  setActive: (value: boolean) => void;
  plagiators: Set<number>;
}

export const ModalComparisonContestants: FC<
  ModalComparisonContestantsProps
> = ({ active, setActive, plagiators }) => {
  const { contestants } = useAppSelector(
    (state) => state.contestants.fetchContestants,
  );

  const contestantsMap = useMemo(() => {
    const map = new Map<number, Contestant>();
    contestants.forEach((c) => map.set(c.id, c));
    return map;
  }, [contestants]);

  const handleDownloadExcel = () => {
    const data = [...plagiators].map((v) => {
      return {
        "Участники с плагиатом": contestantsMap.get(v)?.name ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 100 }, // "Участники с плагиатом"
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Участники с плагиатом");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "plagiarism_contestants.xlsx");
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
          Участники с плагиатом
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
          {[...plagiators].length === 0 ? (
            <div className="text-center opacity-60">
              Нет участников с плагиатом
            </div>
          ) : (
            <></>
          )}

          {[...plagiators].map((v, i) => (
            <div
              key={i}
              className=" group p-[8px] px-[20px] border-b border-liquid-border cursor-pointer hover:bg-liquid-lighter transition-all duration-200 rounded-[10px] relative flex items-center active:scale-[99%]"
              onClick={async () => {
                const name = contestantsMap.get(v)?.name;

                if (!name) return;

                try {
                  await navigator.clipboard.writeText(name);
                  toastSuccess("Скопировано!");
                } catch (err) {
                  console.error("Ошибка копирования:", err);
                }
              }}
            >
              <span className="flex justify-start items-center text-red-400">
                {contestantsMap.get(v)?.name}
              </span>
              <img
                src={CopyIcon}
                className="h-[24px] w-[24px] absolute right-[20px] opacity-0 group-hover:opacity-80 transition-all duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
