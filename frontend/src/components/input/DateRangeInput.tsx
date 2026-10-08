import React from 'react';

interface DateRangeInputProps {
    startLabel?: string;
    endLabel?: string;
    startValue?: string;
    endValue?: string;
    onChange: (field: 'startsAt' | 'endsAt', value: string) => void;
    className?: string;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
    startLabel = 'Дата начала',
    endLabel = 'Дата окончания',
    startValue,
    endValue,
    onChange,
    className = '',
}) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {startLabel}
                </label>
                <input
                    type="datetime-local"
                    value={startValue}
                    onChange={(e) => onChange('startsAt', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {endLabel}
                </label>
                <input
                    type="datetime-local"
                    value={endValue}
                    onChange={(e) => onChange('endsAt', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
        </div>
    );
};

export default DateRangeInput;
