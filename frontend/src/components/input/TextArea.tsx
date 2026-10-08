import React from "react";
import { cn } from "../../lib/cn";

interface TextAreaProps {
  name?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onChange: (state: string) => void;
  defaultState?: string;
  rows?: number;
  autoResize?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  error = "",
  label = "",
  placeholder = "",
  className = "",
  inputClassName = "",
  onChange,
  defaultState = "",
  name = "",
  rows = 3,
  autoResize = false,
}) => {
  const [value, setValue] = React.useState<string>(defaultState);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => onChange(value), [value]);
  React.useEffect(() => setValue(defaultState), [defaultState]);

  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value, autoResize]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="text-[18px] text-liquid-white font-medium h-[23px] mb-[10px]">
          {label}
        </div>
      )}

      <textarea
        ref={textareaRef}
        className={cn(
          "bg-liquid-lighter w-full rounded-[10px] outline-none pl-[16px] pr-[8px] py-[8px] placeholder:text-liquid-light resize-none text-liquid-input-text border-liquid-input-border border-[1px]",
          "max-h-[300px]",
          inputClassName,
        )}
        value={value}
        name={name}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => {
          const val = e.target.value;
          setValue(val);

          if (autoResize && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
              textareaRef.current.scrollHeight + "px";
          }
        }}
      />

      {error && (
        <div className="text-liquid-red text-[14px] text-right mt-[5px] whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
};
