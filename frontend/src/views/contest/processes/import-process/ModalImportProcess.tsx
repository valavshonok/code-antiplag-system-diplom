import { FC, useEffect, useState, ChangeEvent } from "react";
import { Modal } from "../../../../components/modal/Modal";
import { PrimaryButton } from "../../../../components/button/PrimaryButton";
import { SecondaryButton } from "../../../../components/button/SecondaryButton";
import { Input } from "../../../../components/input/Input";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { Contest } from "../../../../types/contest";
import {
  fetchContestProcesses,
  startImportProcess,
  startImportYandexProcess,
} from "../../../../redux/slices/contests";
import { toastError } from "../../../../lib/toastNotification";
import { CfLogo, YandexContest } from "../../../../assets/logos";
import { cn } from "../../../../lib/cn";

interface ModalImportProcessProps {
  contest: Contest;
  active: boolean;
  setActive: (value: boolean) => void;
}

type ImportService = "Codeforces" | "YContest";

export const ModalImportProcess: FC<ModalImportProcessProps> = ({
  contest,
  active,
  setActive,
}) => {
  const dispatch = useAppDispatch();

  const { status } = useAppSelector(
    (state) => state.contests.startImportProcess,
  );

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [cfContestId, setCfContestId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importService, setImportService] =
    useState<ImportService>("Codeforces");

  useEffect(() => {
    if (!active) {
      setApiKey("");
      setApiSecret("");
      setCfContestId("");
      setFile(null);
    }
  }, [active]);

  useEffect(() => {
    if (status === "successful") {
      dispatch(fetchContestProcesses(contest.id));
      setActive(false);
    }
  }, [status]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type !== "application/zip" &&
        !selectedFile.name.endsWith(".zip")
      ) {
        toastError("Можно выбрать только .zip файл");
        e.target.value = "";
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    if (importService == "Codeforces") {
      dispatch(
        startImportProcess({
          contestId: contest.id,
          apiKey,
          apiSecret,
          cfContestId,
          file,
        }),
      );
    }
    if (importService == "YContest") {
      dispatch(
        startImportYandexProcess({
          contestId: contest.id,
          file,
        }),
      );
    }
  };

  const isDisabled =
    status === "loading" ||
    (importService == "Codeforces" &&
      (!apiKey || !apiSecret || !cfContestId || !file)) ||
    (importService == "YContest" && !file);

  return (
    <Modal
      className="bg-liquid-modal-background border-liquid-modal-border border-[2px] p-[25px] rounded-[20px] text-liquid-modal-text"
      onOpenChange={setActive}
      open={active}
      backdrop="blur"
      zIndex="z-50"
    >
      <div className="w-[550px]">
        <div className="font-bold text-[30px] mb-[10px]">
          Импорт данных в контест
        </div>
        <div className=" grid grid-cols-2 gap-[15px]">
          <div
            className={cn(
              "p-[10px] flex items-center cursor-pointer hover:bg-liquid-lighter rounded-[8px] transition-all duration-300 active:scale-95 border-solid border-[2px] border-transparent",
              importService == "Codeforces" &&
                "border-liquid-processes-border bg-liquid-processes-background",
            )}
            onClick={() => setImportService("Codeforces")}
          >
            <CfLogo className="h-full" />
          </div>
          <div
            className={cn(
              "p-[10px] flex items-center cursor-pointer hover:bg-liquid-lighter rounded-[8px] transition-all duration-300 active:scale-95 border-solid border-[2px] border-transparent",
              importService == "YContest" &&
                "border-liquid-processes-border bg-liquid-processes-background",
            )}
            onClick={() => setImportService("YContest")}
          >
            <YandexContest className="h-[90%]" />
          </div>
        </div>

        <div
          className={cn(
            " grid grid-flow-row grid-rows-[0fr] opacity-0 transition-all duration-300",
            importService == "Codeforces" && "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <div className="pb-[10px]">
              <Input
                name="apiKey"
                autocomplete="apiKey"
                type="text"
                label="API Key"
                className="mt-[10px]"
                placeholder="Введите API Key"
                onChange={(v) => setApiKey(v)}
              />

              <Input
                name="apiSecret"
                autocomplete="apiSecret"
                type="text"
                label="API Secret"
                className="mt-[10px]"
                placeholder="Введите API Secret"
                onChange={(v) => setApiSecret(v)}
              />

              <Input
                name="cfContestId"
                type="text"
                label="Codeforces Contest ID"
                className="mt-[10px]"
                placeholder="Введите ID контеста Codeforces"
                onChange={(v) => setCfContestId(v)}
              />
            </div>
          </div>
        </div>

        <div className="mt-[15px]">
          <label className="block mb-[8px] font-medium text-liquid-white text-[18px]">
            Архив посылок
          </label>

          <div className="flex items-center gap-3">
            <label
              className="
        cursor-pointer
        px-4 py-2
        rounded-lg
        border border-liquid-lighter
        bg-liquid-background
        text-sm
        hover:bg-liquid-lighter/20
        transition-colors
        duration-200
      "
            >
              Выбрать файл
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <span className="text-sm text-liquid-white/70 truncate max-w-[250px]">
              {file ? file.name : "Файл не выбран"}
            </span>
          </div>
        </div>

        <div className="flex flex-row w-full items-center justify-end mt-[20px] gap-[20px]">
          <PrimaryButton
            onClick={handleSubmit}
            text="Запустить импорт"
            disabled={isDisabled}
          />
          <SecondaryButton onClick={() => setActive(false)} text="Отмена" />
        </div>
      </div>
    </Modal>
  );
};
