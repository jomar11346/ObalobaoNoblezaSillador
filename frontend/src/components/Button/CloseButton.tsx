import type { FC } from "react";

interface CloseButtonProps {
    label: string
    onClose: () => void
    newClassName?: string;
    className?: string
}

const CloseButton: FC<CloseButtonProps> = ({ label, onClose, newClassName, className }) => {
    return (
        <>
            <button
                type="button"
                className={
                    newClassName
                        ? newClassName
                        : `yb-btn-secondary ${className ?? ""}`
                }
                onClick={onClose}
            >
                {label}
            </button>
        </>
    )
}

export default CloseButton