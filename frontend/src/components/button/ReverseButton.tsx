import React from "react";
import { cn } from "../../lib/cn";

interface ButtonProps {
  disabled?: boolean;
  text?: string;
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "success";
  padding?: string;
}

const ColorBgVariants = {
  primary: "group-hover:bg-liquid-brightmain ring-liquid-brightmain",
  secondary: "group-hover:bg-liquid-darkmain ring-liquid-darkmain",
  error: "group-hover:bg-liquid-red ring-liquid-red",
  warning: "group-hover:bg-liquid-orange ring-liquid-orange",
  success: "group-hover:bg-liquid-green ring-liquid-green",
};

const ColorTextVariants = {
  primary: "text-liquid-brightmain ",
  secondary: "text-liquid-brightmain ",
  error: "text-liquid-red ",
  warning: "text-liquid-orange ",
  success: "text-liquid-green ",
};

export const ReverseButton: React.FC<ButtonProps> = ({
  disabled = false,
  text = "",
  className,
  onClick,
  children,
  color = "secondary",
  padding = "",
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
          "group-hover:bg-liquid-darkmain ",
          "px-[16px] py-[8px]",
          "bg-liquid-lighter ring-[1px] ring-liquid-darkmain ring-inset",
          ColorBgVariants[color],
          disabled && "bg-liquid-lighter",
          padding,
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
            "transition-all duration-300  text-[18px] font-bold p-0 m-0 leading-[23px]",
            "group-hover:text-liquid-white ",
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
