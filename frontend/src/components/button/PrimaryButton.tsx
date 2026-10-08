import React from "react";
import { cn } from "../../lib/cn";

interface ButtonProps {
  disabled?: boolean;
  text?: string;
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "success";
}

const ColorBgVariants = {
  primary: "bg-liquid-brightmain group-hover:ring-liquid-brightmain",
  secondary: "bg-liquid-darkmain group-hover:ring-liquid-darkmain",
  error: "bg-liquid-red group-hover:ring-liquid-red",
  warning: "bg-liquid-orange group-hover:ring-liquid-orange",
  success: "bg-liquid-green group-hover:ring-liquid-green",
};

const ColorTextVariants = {
  primary: "group-hover:text-liquid-brightmain ",
  secondary: "group-hover:text-liquid-brightmain ",
  error: "group-hover:text-liquid-red ",
  warning: "group-hover:text-liquid-orange ",
  success: "group-hover:text-liquid-green ",
};

export const PrimaryButton: React.FC<ButtonProps> = ({
  disabled = false,
  text = "",
  className,
  onClick,
  children,
  color = "secondary",
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
          "group-active:scale-90 flex items-center justify-center box-border z-10 relative transition-all duration-300",
          "rounded-[10px]",
          "group-hover:bg-liquid-lighter group-hover:ring-[1px] group-hover:ring-liquid-darkmain group-hover:ring-inset",
          "px-[16px] py-[8px]",
          ColorBgVariants[color],
          disabled && "bg-liquid-lighter",
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
            "absolute outline-offset-[2.5px] border-[2px] border-transparent outline-[2.5px] outline outline-transparent transition-all duration-300 text-transparent box-border text-[18px] font-bold p-0 ,m-0 leading-[23px] ",
            "rounded-[10px]",
            "px-[16px] py-[8px]",
          )}
        >
          {children || text}
        </div>
        <div
          className={cn(
            "transition-all duration-300 text-liquid-button-text text-[18px] font-bold p-0 m-0 leading-[23px] ",
            ColorTextVariants[color],
            disabled && "text-liquid-light",
          )}
        >
          {children || text}
        </div>
      </div>
    </label>
  );
};
