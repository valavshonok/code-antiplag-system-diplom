import { FC } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export const GradientRightRange: FC<Props> = ({ value, onChange }) => {
  const percent = value;

  const background = `linear-gradient(
    to right,
    var(--color-liquid-comparisons-rangebg) 0%,
    var(--color-liquid-comparisons-rangebg) ${percent}%,
    #facc15 ${percent}%,
    #dc2626 100%
  )`;

  return (
    <div className="w-full mt-2 relative  h-[50px]">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[6px] rounded appearance-none cursor-pointer "
        style={{ background, accentColor: "#facc15" }}
      />
      <div
        className="absolute top-[28px] text-xs -translate-x-1/2 select-none"
        style={{
          left: `calc(${percent}% + (8px - ${percent * 0.16}px))`,
        }}
      >
        {value}%
      </div>
    </div>
  );
};
