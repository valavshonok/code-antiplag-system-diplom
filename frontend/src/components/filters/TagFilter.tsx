import React, { useState } from 'react';
import { cn } from '../../lib/cn';
import { useClickOutside } from '../../hooks/useClickOutside';
import { iconFilter, iconFilterActive } from '../../assets/icons/filters';
import { Input } from '../input/Input';
import { PrimaryButton } from '../button/PrimaryButton';
import { toastError } from '../../lib/toastNotification';
import { SecondaryButton } from '../button/SecondaryButton';

interface TagFilterProps {
    disabled?: boolean;
    className?: string;
    onChange: (items: string[]) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
    disabled = false,
    className = '',
    onChange,
}) => {
    const [active, setActive] = React.useState(false);

    const [tagInput, setTagInput] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    // ==========================
    // Теги
    // ==========================
    const addTag = () => {
        if (tags.length > 30) {
            setTagInput('');
            toastError('Нельзя добавить больше 30 тегов');
            return;
        }
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const resetTags = () => {
        setTags([]);
    };

    const ref = React.useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => {
        setActive(false);
    });

    React.useEffect(() => {
        onChange(tags);
    }, [tags]);

    return (
        <div className={cn('relative', className)} ref={ref}>
            <div
                className={cn(
                    'items-center h-[40px] rounded-full bg-liquid-lighter w-[40px] flex',
                    'text-[18px] font-bold cursor-pointer select-none',
                    'overflow-hidden',
                    (active || tags.length > 0) &&
                        'w-fit border-liquid-brightmain border-[1px] border-solid',
                )}
                onClick={() => {
                    if (!disabled) setActive(!active);
                }}
            >
                <div className="text-liquid-brightmain pl-[42px] pr-[16px] w-fit">
                    {tags.length}
                </div>
            </div>

            {/* Filter icons */}
            <img
                src={iconFilter}
                className={cn(
                    'absolute left-[8px] top-[8px] h-[24px] w-[24px] rotate-0 transition-all duration-300 pointer-events-none',
                )}
            />
            <img
                src={iconFilterActive}
                className={cn(
                    'absolute left-[8px] top-[8px] h-[24px] w-[24px] rotate-0 transition-all duration-300 pointer-events-none opacity-0',
                    (active || tags.length > 0) && 'opacity-100',
                )}
            />

            {/* Dropdown */}
            <div
                className={cn(
                    'absolute rounded-[10px] bg-liquid-background  w-[590px] left-0 top-[48px] z-50 transition-all duration-300',
                    'grid overflow-hidden border-liquid-lighter border-[3px] border-solid',
                    active
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                )}
            >
                <div className="overflow-hidden p-[8px]">
                    <div className="overflow-y-scroll min-h-[130px] thin-scrollbar grid gap-[20px]">
                        {/* Теги */}
                        <div className="">
                            <div className="grid grid-cols-[1fr,140px,130px] items-end gap-2">
                                <Input
                                    name="articleTag"
                                    autocomplete="articleTag"
                                    className="max-w-[600px] "
                                    type="text"
                                    label="Теги"
                                    onChange={setTagInput}
                                    defaultState={tagInput}
                                    placeholder="arrays"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addTag();
                                    }}
                                />
                                <PrimaryButton
                                    onClick={addTag}
                                    text="Добавить"
                                    className="h-[40px] w-[140px]"
                                />
                                <SecondaryButton
                                    onClick={resetTags}
                                    text="Сбросить"
                                    className="h-[40px] w-[130px]"
                                />
                            </div>
                            <div className="flex flex-wrap gap-[10px] mt-2 ">
                                {tags.length == 0 ? (
                                    <div className="text-liquid-brightmain flex items-center justify-center w-full h-[50px]">
                                        Вы еще не добавили ни одного тега
                                    </div>
                                ) : (
                                    tags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center gap-1 bg-liquid-lighter px-3 py-1 rounded-full"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="text-liquid-red font-bold ml-[5px]"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
