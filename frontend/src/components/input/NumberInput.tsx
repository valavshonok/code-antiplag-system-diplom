import React from "react";
import { cn } from "../../lib/cn";

interface NumberInputProps {
  name?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  minValue?: number;
  maxValue?: number;
  onChange: (state: number) => void;
  defaultState?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  error = "",
  label = "",
  placeholder = "",
  className = "",
  onChange,
  defaultState = 0,
  minValue = 0,
  maxValue = 365 * 24,
  name = "",
}) => {
  const [value, setValue] = React.useState<number>(defaultState);

  React.useEffect(() => onChange(value), [value]);
  React.useEffect(() => setValue(defaultState), [defaultState]);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "text-[18px] text-liquid-white font-medium h-[23px] mb-[10px] transition-all",
          label == "" && "h-0 mb-0",
        )}
      >
        {label}
      </div>
      <div className="relative pr-[5px] ">
        <input
          className={cn(
            "bg-liquid-lighter w-full rounded-[10px] outline-none pl-[16px] pr-[8px] py-[8px] placeholder:text-liquid-light",
          )}
          value={value}
          name={name}
          type={"number"}
          min={minValue}
          max={maxValue}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(Number(e.target.value));
          }}
        />
      </div>

      <div
        className={cn(
          "text-liquid-red text-[14px] h-auto text-right mt-[5px] whitespace-pre-line ",
          error == "" && "h-0 mt-0",
        )}
      >
        {error}
      </div>
    </div>
  );
};
