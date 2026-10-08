import React from "react";
import { cn } from "../../lib/cn";
import { EyeClosed, EyeOpen } from "../../assets/icons/input";

interface inputProps {
  name?: string;
  type: "text" | "email" | "password" | "first_name" | "number";
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onChange: (state: string) => void;
  defaultState?: string;
  autocomplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<inputProps> = ({
  type = "text",
  error = "",
  // disabled = false,
  // required = false,
  label = "",
  placeholder = "",
  className = "",
  inputClassName = "",
  onChange,
  defaultState = "",
  name = "",
  autocomplete = "",
  onKeyDown,
}) => {
  const [value, setValue] = React.useState<string>(defaultState);
  const [visible, setVIsible] = React.useState<boolean>(type != "password");

  React.useEffect(() => onChange(value), [value]);
  React.useEffect(() => setValue(defaultState), [defaultState]);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "text-[18px] text-liquid-white font-medium h-[23px] mb-[10px] transition-all select-none",
          label == "" && "h-0 mb-0",
        )}
      >
        {label}
      </div>
      <div className="relative">
        <input
          className={cn(
            "bg-liquid-lighter w-full rounded-[10px] outline-none pl-[16px] py-[8px] placeholder:text-liquid-light text-liquid-input-text border-liquid-input-border border-[1px]",
            type == "password" ? "h-[40px]" : "h-[36px]",
            inputClassName,
          )}
          value={value}
          name={name}
          autoComplete={autocomplete || undefined}
          type={type == "password" ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (onKeyDown) onKeyDown(e);
          }}
        />
        {type == "password" && (
          <>
            {console.log(123, EyeClosed)}
            {visible ? (
              <EyeOpen
                className="w-[24px] h-[24px] cursor-pointer right-[16px] top-[8px] absolute text-liquid-input-text "
                onClick={() => setVIsible(false)}
              />
            ) : (
              <EyeClosed
                className="w-[24px] h-[24px] cursor-pointer right-[16px] top-[8px] absolute text-liquid-input-text"
                onClick={() => setVIsible(true)}
              />
            )}
          </>
        )}
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
