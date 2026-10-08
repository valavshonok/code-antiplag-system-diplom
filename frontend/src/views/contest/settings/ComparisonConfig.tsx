import { FC, useState } from "react";
import { ContestConfig } from "../../../types/contest";
import { cn } from "../../../lib/cn";
import { ChevroneDown } from "../../../assets/icons/groups";
import { Checkbox } from "../../../components/checkbox/Checkbox";
interface ComparisonConfigProps {
  config: ContestConfig;
  setConfig: React.Dispatch<React.SetStateAction<ContestConfig>>;
}

export const ComparisonConfig: FC<ComparisonConfigProps> = ({
  config,
  setConfig,
}) => {
  const [comparisonSettingsActive, setComparisonsSettingActive] =
    useState<boolean>(true);
  const handleComparisonCheckboxChange =
    (field: string) => (value: boolean) => {
      setConfig((prev) => ({
        ...prev,
        comparison: {
          ...prev?.comparison,
          [field]: value,
        },
      }));
    };

  return (
    <div
      className={cn(
        " border-b-[1px] border-b-liquid-border rounded-[10px] mb-[20px] text-liquid-white",
      )}
    >
      <div
        className={cn(
          " h-[40px] text-[24px] font-bold flex gap-[10px] items-center cursor-pointer border-b-[1px] border-b-transparent transition-all duration-300",
          comparisonSettingsActive && "border-b-liquid-border",
        )}
        onClick={() => {
          setComparisonsSettingActive(!comparisonSettingsActive);
        }}
      >
        <span className=" select-none">{"Настройки сравнения"}</span>
        <img
          src={ChevroneDown}
          className={cn(
            "transition-all duration-300 select-none",
            comparisonSettingsActive && "rotate-180",
          )}
        />
      </div>
      <div
        className={cn(
          " grid grid-flow-row grid-rows-[0fr] opacity-0 transition-all duration-300",
          comparisonSettingsActive && "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-[10px]">
            <Checkbox
              onChange={handleComparisonCheckboxChange("format_code")}
              defaultState={config?.comparison?.format_code}
              label="Форматировать код"
              color="secondary"
            />
            <Checkbox
              onChange={handleComparisonCheckboxChange("normalize_types")}
              defaultState={config?.comparison?.normalize_types}
              label="Нормализовать типы"
              color="secondary"
            />
            <Checkbox
              onChange={handleComparisonCheckboxChange("remove_comments")}
              defaultState={config?.comparison?.remove_comments}
              label="Удалять комментарии"
              color="secondary"
            />
            <Checkbox
              onChange={handleComparisonCheckboxChange("remove_empty_lines")}
              defaultState={config?.comparison?.remove_empty_lines}
              label="Удалять пустые строки"
              color="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
