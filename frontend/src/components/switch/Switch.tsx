import React from 'react';
import { cn } from '../../lib/cn';

/* Варианты размера контейнера */
const sizeVariants = {
    sm: 'h-6 w-10',
    md: 'h-7 w-12',
    lg: 'h-8 w-14',
};

/* Варианты для скользящего шарика */
const switchVariants = {
    size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    },
    activeSize: {
        sm: 'group-active:w-5',
        md: 'group-active:w-6',
        lg: 'group-active:w-7',
    },
    iconSize: {
        sm: 'h-3 w-3',
        md: 'h-[0.875rem] w-[0.875rem]',
        lg: 'h-4 w-4',
    },
};

const colorsVariants = {
    default: 'bg-default',
    primary: 'bg-liquid-brightmain',
    secondary: 'bg-liquid-darkmain',
    success: 'bg-liquid-green',
    warning: 'bg-liquid-orange',
    danger: 'bg-liquid-red',
};

const focuseOutlineVariants = {
    default: '[&:focus-visible+*]:outline-default',
    primary: '[&:focus-visible+*]:outline-liquid-brightmain',
    secondary: '[&:focus-visible+*]:outline-liquid-darkmain',
    success: '[&:focus-visible+*]:outline-liquid-green',
    warning: '[&:focus-visible+*]:outline-liquid-orange',
    danger: '[&:focus-visible+*]:outline-liquid-red',
};

/**
 * Иконка солнца
 */
const sun = (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6 9.5C7.933 9.5 9.5 7.933 9.5 6C9.5 4.067 7.933 2.5 6 2.5C4.067 2.5 2.5 4.067 2.5 6C2.5 7.933 4.067 9.5 6 9.5Z"
            fill="#292D32"
        />
        <path
            d="M6 11.48C5.725 11.48 5.5 11.275 5.5 11V10.96C5.5 10.685 5.725 10.46 6 10.46C6.275 10.46 6.5 10.685 6.5 10.96C6.5 11.235 6.275 11.48 6 11.48ZM9.57 10.07C9.44 10.07 9.315 10.02 9.215 9.925L9.15 9.86C8.955 9.665 8.955 9.35 9.15 9.155C9.345 8.96 9.66 8.96 9.855 9.155L9.92 9.22C10.115 9.415 10.115 9.73 9.92 9.925C9.825 10.02 9.7 10.07 9.57 10.07ZM2.43 10.07C2.3 10.07 2.175 10.02 2.075 9.925C1.88 9.73 1.88 9.415 2.075 9.22L2.14 9.155C2.335 8.96 2.65 8.96 2.845 9.155C3.04 9.35 3.04 9.665 2.845 9.86L2.78 9.925C2.685 10.02 2.555 10.07 2.43 10.07ZM11 6.5H10.96C10.685 6.5 10.46 6.275 10.46 6C10.46 5.725 10.685 5.5 10.96 5.5C11.235 5.5 11.48 5.725 11.48 6C11.48 6.275 11.275 6.5 11 6.5ZM1.04 6.5H1C0.725 6.5 0.5 6.275 0.5 6C0.5 5.725 0.725 5.5 1 5.5C1.275 5.5 1.52 5.725 1.52 6C1.52 6.275 1.315 6.5 1.04 6.5ZM9.505 2.995C9.375 2.995 9.25 2.945 9.15 2.85C8.955 2.655 8.955 2.34 9.15 2.145L9.215 2.08C9.41 1.885 9.725 1.885 9.92 2.08C10.115 2.275 10.115 2.59 9.92 2.785L9.855 2.85C9.76 2.945 9.635 2.995 9.505 2.995ZM2.495 2.995C2.365 2.995 2.24 2.945 2.14 2.85L2.075 2.78C1.88 2.585 1.88 2.27 2.075 2.075C2.27 1.88 2.585 1.88 2.78 2.075L2.845 2.14C3.04 2.335 3.04 2.65 2.845 2.845C2.75 2.945 2.62 2.995 2.495 2.995ZM6 1.52C5.725 1.52 5.5 1.315 5.5 1.04V1C5.5 0.725 5.725 0.5 6 0.5C6.275 0.5 6.5 0.725 6.5 1C6.5 1.275 6.275 1.52 6 1.52Z"
            fill="#292D32"
        />
    </svg>
);

/**
 * Иконка луны
 */
const moon = (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M10.765 7.965C10.685 7.83 10.46 7.62 9.89999 7.72C9.58999 7.775 9.27499 7.8 8.95999 7.785C7.79499 7.735 6.73999 7.2 6.00499 6.375C5.35499 5.65 4.95499 4.705 4.94999 3.685C4.94999 3.115 5.05999 2.565 5.28499 2.045C5.50499 1.54 5.34999 1.275 5.23999 1.165C5.12499 1.05 4.85499 0.890001 4.32499 1.11C2.27999 1.97 1.01499 4.02 1.16499 6.215C1.31499 8.28 2.76499 10.045 4.68499 10.71C5.14499 10.87 5.62999 10.965 6.12999 10.985C6.20999 10.99 6.28999 10.995 6.36999 10.995C8.04499 10.995 9.61499 10.205 10.605 8.86C10.94 8.395 10.85 8.1 10.765 7.965Z"
            fill="#292D32"
        />
    </svg>
);

interface SwitchProps {
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    color?:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'danger';
    label?: string;
    variant?: 'default' | 'label' | 'icon' | 'theme';
    className?: string;
    defaultState?: boolean;
    onChange: (state: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
    size = 'sm',
    disabled = false,
    color = 'primary',
    label = '',
    variant = 'default',
    className,
    onChange,
    defaultState = false,
}) => {
    const [active, setActive] = React.useState<boolean>(defaultState);

    React.useEffect(() => onChange(active), [active]);

    return (
        <label
            className={cn(
                variant == 'label' && 'grid-cols-[auto_1fr] items-center gap-2',
                'grid relative cursor-pointer p-2 select-none group',
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
        >
            {/* Основной контейнер,  */}
            <div
                className={cn(
                    ' flex items-center justify-center box-border z-10 relative transition-all duration-300 rounded-full',
                    sizeVariants[size],
                    active ? colorsVariants[color] : 'bg-default-200',
                )}
            >
                {/* Скрытый checkbox */}
                <input
                    className={cn(
                        'absolute opacity-0 -z-10 h-0 w-0',
                        focuseOutlineVariants[color],
                    )}
                    disabled={disabled}
                    type="checkbox"
                    onChange={() => {
                        setActive(!active);
                    }}
                />

                <div
                    className={cn(
                        'absolute outline-offset-[2.5px] outline-[2.5px] outline outline-transparent transition-all duration-300 rounded-full',
                        sizeVariants[size],
                    )}
                ></div>

                {/* Шарик */}
                <span
                    className={cn(
                        'bg-white rounded-full absolute transition-all duration-300  m-1 flex items-center justify-center',
                        switchVariants.size[size],
                        switchVariants.activeSize[size],
                        active
                            ? 'right-[0%]'
                            : 'right-[calc(50%-0.25rem)] group-active:right-[calc(50%-0.5rem)]',
                    )}
                >
                    {variant == 'theme' && (
                        <>
                            <div
                                className={cn(
                                    'absolute transition-all duration-300',
                                    switchVariants.iconSize[size],
                                    active
                                        ? 'opacity-100 scale-100'
                                        : 'opacity-0 scale-50',
                                )}
                            >
                                {moon}
                            </div>
                            <div
                                className={cn(
                                    'absolute transition-all duration-300',
                                    switchVariants.iconSize[size],
                                    active
                                        ? 'opacity-0 scale-50'
                                        : 'opacity-100 scale-100',
                                )}
                            >
                                {sun}
                            </div>
                        </>
                    )}
                </span>
            </div>

            {variant == 'label' && (
                <div className="select-none text-layout-foreground transition-all duration-200">
                    {label}
                </div>
            )}
        </label>
    );
};
