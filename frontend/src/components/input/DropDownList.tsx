import React, { useEffect } from "react";
import { cn } from "../../lib/cn";
import { CheckMark, ChevroneDropDownList } from "../../assets/icons/input";
import { useClickOutside } from "../../hooks/useClickOutside";

interface DropDownListProps {
  disabled?: boolean;
  className?: string;
  onChange: (state: string) => void;
  defaultState?: string;
  items: string[];
  weight?: string;
}

export const DropDownList: React.FC<DropDownListProps> = ({
  // disabled = false,
  className = "",
  onChange,
  defaultState,
  items = [""],
  weight = "w-[180px]",
}) => {
  if (items.length == 0) items.push("");

  const [value, setValue] = React.useState<string>(
    defaultState != undefined ? defaultState : items[0],
  );
  const [active, setActive] = React.useState<boolean>(false);

  const ref = React.useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setActive(false);
  });

  useEffect(() => {
    setValue(defaultState != undefined ? defaultState : items[0]);
  }, [defaultState]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <div
        className={cn(
          " flex items-center h-[40px] rounded-[10px] bg-liquid-lighter px-[16px]",
          "text-[18px] font-bold cursor-pointer select-none",
          "transitin-all active:scale-95 duration-300",
          weight,
        )}
        onClick={() => {
          setActive(!active);
        }}
      >
        {value}
      </div>

      <ChevroneDropDownList
        className={cn(
          " absolute right-[16px]  h-[24px] w-[24px] top-[8.5px] rotate-0 transition-all duration-300 pointer-events-none select-none",
          active && " rotate-180",
        )}
      />

      <div
        className={cn(
          " absolute rounded-[10px] bg-liquid-lighter  left-0 top-[48px] z-50 transition-all duration-300",
          "grid overflow-hidden",
          weight,
          active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className=" overflow-hidden p-[8px] border-liquid-background border-solid border-[1px] rounded-[10px]">
          <div
            className={cn(
              " overflow-y-scroll max-h-[200px] thin-scrollbar pr-[8px] ",
            )}
          >
            {items.map((v, i) => (
              <div
                key={i}
                className={cn(
                  "cursor-pointer  h-[36px] relative transition-all duration-300",
                  i + 1 != items.length &&
                    "border-b-liquid-light border-b-[1px]",
                  "text-[16px] font-medium cursor-pointer select-none flex items-center pl-[8px]",
                  "hover:bg-liquid-background",
                  "first:rounded-t-[6px] last:rounded-b-[6px]",
                )}
                onClick={() => {
                  setValue(v);
                  onChange(v);
                  setActive(false);
                }}
              >
                {v}

                {v == value && <CheckMark className=" absolute right-[8px]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
