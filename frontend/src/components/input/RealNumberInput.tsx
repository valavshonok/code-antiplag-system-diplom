import React from "react";
import { cn } from "../../lib/cn";

interface RealNumberInputProps {
  name?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange: (state: number) => void;
  defaultState?: number;
}

export const RealNumberInput: React.FC<RealNumberInputProps> = ({
  error = "",
  label = "",
  placeholder = "",
  className = "",
  inputClassName = "",
  onChange,
  defaultState = 0,
  minValue = 0,
  maxValue = 100,
  step = 0.05,
  name = "",
}) => {
  const [value, setValue] = React.useState<number>(defaultState);

  React.useEffect(() => {
    onChange(value);
  }, [value]);

  React.useEffect(() => {
    setValue(defaultState);
  }, [defaultState]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="text-[18px] text-liquid-white font-medium h-[23px] mb-[10px]">
          {label}
        </div>
      )}

      <div className="relative pr-[5px]">
        <input
          className={cn(
            "bg-liquid-lighter w-full rounded-[10px] outline-none pl-[16px] pr-[8px] py-[8px] placeholder:text-liquid-light text-liquid-input-text border-liquid-input-border border-[1px]",
            inputClassName,
          )}
          value={value}
          name={name}
          type="number"
          min={minValue}
          max={maxValue}
          step={step}
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value;

            if (val === "") {
              setValue(minValue);
              return;
            }

            let num = Number(val);

            if (isNaN(num)) return;

            if (num < minValue) num = minValue;
            if (num > maxValue) num = maxValue;

            const precision = step.toString().includes(".")
              ? step.toString().split(".")[1].length
              : 0;

            num = Math.round(num / step) * step;
            num = Number(num.toFixed(precision));

            setValue(num);
          }}
        />
      </div>

      {error && (
        <div className="text-liquid-red text-[14px] text-right mt-[5px] whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
};
