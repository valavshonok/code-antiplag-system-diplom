import { FC } from 'react';
import { Modal } from './Modal';
import { PrimaryButton } from '../../components/button/PrimaryButton';
import { SecondaryButton } from '../../components/button/SecondaryButton';
import { cn } from '../../lib/cn';

interface ConfirmModalProps {
    active: boolean;
    setActive: (value: boolean) => void;
    onConfirmClick: () => void;
    title?: string;
    message?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
    confirmText?: string;
    className?: string;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
    active,
    setActive,
    onConfirmClick,
    title,
    message,
    confirmColor = 'secondary',
    confirmText = 'Ок',
    className,
}) => {
    return (
        <Modal
            className={cn(
                'bg-liquid-background border-liquid-lighter border-[2px] p-[25px] rounded-[20px] text-liquid-white',
                className,
            )}
            onOpenChange={setActive}
            open={active}
            backdrop="blur"
        >
            <div className="w-[500px]">
                <div className="font-bold text-[30px]">{title}</div>
                <div className="font-bold text-[20px] mt-[20px]">{message}</div>
                <div className="flex flex-row w-full items-center justify-end mt-[20px] gap-[20px]">
                    <PrimaryButton
                        onClick={() => {
                            onConfirmClick();
                            setActive(false);
                        }}
                        text={confirmText}
                        color={confirmColor}
                    />
                    <SecondaryButton
                        onClick={() => {
                            setActive(false);
                        }}
                        text="Отмена"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
