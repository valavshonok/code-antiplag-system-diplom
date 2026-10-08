import React from 'react';
import { cn } from '../../lib/cn';
import { iconSearch } from '../../assets/icons/filters';

interface searchInputProps {
    name?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
    className?: string;
    onChange: (state: string) => void;
    defaultState?: string;
    autocomplete?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<searchInputProps> = ({
    placeholder = '',
    className = '',
    onChange,
    defaultState = '',
    name = '',
    autocomplete = '',
    onKeyDown,
}) => {
    const [value, setValue] = React.useState<string>(defaultState);

    React.useEffect(() => onChange(value), [value]);
    React.useEffect(() => setValue(defaultState), [defaultState]);

    return (
        <label
            className={cn(
                'relative bg-liquid-lighter w-[200px] h-[40px] flex rounded-full px-[16px] pl-[50px] cursor-text',
                className,
            )}
        >
            <input
                className={cn(
                    'placeholder:text-liquid-light h-[28px] w-[200px] bg-transparent outline-none text-liquid-white my-[6px]',
                )}
                value={value}
                name={name}
                autoComplete={autocomplete}
                type="text"
                placeholder={placeholder}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (onKeyDown) onKeyDown(e);
                }}
            />
            <img
                src={iconSearch}
                className=" absolute top-[8px] left-[16px] w-[24px] h-[24px]"
            />
        </label>
    );
};
