import React from "react";
import { cn } from "../../lib/cn";
import { motion } from "framer-motion";

const pathVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      delay: 0.15,
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const sizeVariants = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const colorsVariants = {
  default: "bg-default",
  primary: "bg-liquid-brightmain",
  secondary: "bg-liquid-darkmain",
  success: "bg-liquid-green",
  warning: "bg-liquid-orange",
  danger: "bg-liquid-red",
};

const borderColorsVariants = {
  default: "border-default",
  primary: "border-liquid-brightmain",
  secondary: "border-liquid-darkmain",
  success: "border-liquid-green",
  warning: "border-liquid-orange",
  danger: "border-liquid-red",
};

const focuseOutlineVariants = {
  default: "[&:focus-visible+*]:outline-default",
  primary: "[&:focus-visible+*]:outline-liquid-brightmain",
  secondary: "[&:focus-visible+*]:outline-liquid-darkmain",
  success: "[&:focus-visible+*]:outline-liquid-green",
  warning: "[&:focus-visible+*]:outline-liquid-orange",
  danger: "[&:focus-visible+*]:outline-liquid-red",
};

const radiusVraiants = {
  none: "",
  sm: "rounded-[3.5px]",
  md: "rounded-[5px]",
  lg: "rounded-[7px]",
  full: "rounded-full",
};

interface CheckboxViewProps {
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  disabled?: boolean;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  label?: string;
  variant?: "default" | "label";
  className?: string;
  active?: boolean;
  onClick: (state: boolean) => void;
}

export const CheckboxView: React.FC<CheckboxViewProps> = ({
  size = "md",
  radius = "md",
  disabled = false,
  color = "primary",
  label = "",
  variant = "label",
  className,
  onClick,
  active = false,
}) => {
  return (
    <motion.label
      className={cn(
        variant == "label" && "grid-cols-[auto_1fr] items-center gap-2",
        "grid relative cursor-pointer p-2 select-none group ",
        className,
        disabled && "pointer-events-none opacity-50",
        variant == "default" && "",
      )}
    >
      <div
        className={cn(
          "group-hover:bg-default-100 group-active:scale-90 flex items-center justify-center bg-transparent hover:bg-default-100 box-border border-solid border-[1px]  border-liquid-white z-10 relative transition-all duration-300",
          color == "danger" && " border-liquid-red",
          sizeVariants[size],
          radiusVraiants[radius],
          active && borderColorsVariants[color],
        )}
      >
        <input
          readOnly={true}
          className={cn(
            "absolute opacity-0 -z-10 h-0 w-0",
            focuseOutlineVariants[color],
          )}
          disabled={disabled}
          type="checkbox"
          onClick={() => {
            onClick(active);
          }}
          checked={active}
        />
        <div
          className={cn(
            "absolute outline-offset-[2.5px] outline-[2.5px] outline outline-transparent transition-all  duration-200",
            sizeVariants[size],
            radiusVraiants[radius],
          )}
        ></div>
        <span
          className={cn(
            "absolute transition-all duration-300",
            sizeVariants[size],
            colorsVariants[color],
            radiusVraiants[radius],
            active && "opacity-100 scale-100",
            !active && "opacity-0 scale-0",
          )}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {active && (
              <motion.path
                strokeWidth="1.5"
                d="M5 8.22L7.66571 10.44L11.22 6"
                stroke="white"
                strokeLinecap="round"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
              />
            )}
          </svg>
        </span>
      </div>
      {variant == "label" && (
        <div className="select-none text-layout-foeground transition-all duration-200">
          {label}
        </div>
      )}
    </motion.label>
  );
};
