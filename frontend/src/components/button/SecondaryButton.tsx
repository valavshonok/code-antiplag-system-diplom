import React from "react";
import { cn } from "../../lib/cn";

interface ButtonProps {
  disabled?: boolean;
  text?: string;
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
}

export const SecondaryButton: React.FC<ButtonProps> = ({
  disabled = false,
  text = "",
  className,
  onClick,
  children,
}) => {
  return (
    <label
      className={cn(
        "grid relative cursor-pointer select-none group w-fit box-border",
        disabled && "pointer-events-none",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Основной контейнер,  */}
      <div
        className={cn(
          "group-active:scale-90 flex items-center justify-center box-border z-10 relative transition-all duration-300 border-[1px] border-solid border-transparent",
          "rounded-[10px]",
          "group-hover:bg-liquid-background group-hover:border-liquid-lighter ",
          "px-[16px] py-[8px]",
          "bg-liquid-lighter",
        )}
      >
        {/* Скрытый button */}
        <button
          className={cn(
            "absolute opacity-0 -z-10 h-0 w-0",
            "[&:focus-visible+*]:outline-liquid-brightmain",
          )}
          disabled={disabled}
          onClick={() => {
            onClick();
          }}
        />

        {/* Граница при выделении через tab */}
        <div
          className={cn(
            "absolute outline-offset-[2.5px] border-[2px] border-transparent outline-[2.5px] outline outline-transparent transition-all duration-300 text-transparent box-border text-[18px] font-bold p-0 ,m-0 leading-[23px]",
            "rounded-[10px]",
            "px-[16px] py-[8px]",
          )}
        >
          {children || text}
        </div>
        <div
          className={cn(
            "transition-all duration-300 text-liquid-white text-[18px] font-bold p-0 m-0 leading-[23px]",
            disabled && "text-liquid-light",
          )}
        >
          {children || text}
        </div>
      </div>
    </label>
  );
};
