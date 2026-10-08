// DateInput.tsx
import React from 'react';

interface DateInputProps {
    label?: string;
    value?: string;
    defaultValue?: string;
    onChange: (value: string) => void;
    className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
    label = 'Дата',
    value,
    defaultValue,
    onChange,
    className = '',
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="block text-sm font-medium text-liquid-white">
                {label}
            </label>
            <input
                type="datetime-local"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full rounded-[10px] sm:text-sm outline-none p-[8px] text-liquid-white  cursor-text  bg-liquid-lighter"
            />
        </div>
    );
};

export default DateInput;
