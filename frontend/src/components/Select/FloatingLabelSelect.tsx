import type { ChangeEvent, FC, ReactNode } from "react"

interface FloatingLabelSetupProps {
    label: string;
    newSelectClassName?: string;
    selectClassName?: string;
    newLabelClassName?: string;
    labelClassName?: string;
    name?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    autoFucos?: boolean;
    disabled?: boolean;
    errors?: string[];
    children: ReactNode;
}

const FloatingLabelSelect: FC<FloatingLabelSetupProps> = ({
    label,
    newSelectClassName,
    selectClassName,
    labelClassName,
    name,
    value,
    onChange,
    required,
    autoFucos,
    disabled,
    errors,
    children
}) => {
    return (
        <>
            <div className="relative">
                <select
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    className={`${newSelectClassName
                        ? newSelectClassName
                        : `yb-input peer block w-full appearance-none px-2.5 pb-2.5 pt-4 text-sm text-[#2d2926] focus:outline-none focus:ring-0
                ${selectClassName ?? ""}`
                        }`}
                    autoFocus={autoFucos}
                    disabled={disabled}
                >
                    {children}
                </select>
                <label htmlFor={name} className={newSelectClassName ? newSelectClassName : `yb-input-label absolute text-sm duration-300 transform -translate-y-4 scale-75
                top-2 z-10 origin-[0] px-2
                peer-focus:px-2 peer-focus:yb-input-label-focus
                peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2
                peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4
                inset-s-1 ${labelClassName ?? ""}`}
                >
                    {label}
                    {required && <span className="text-red-600 ml-1"></span>}
                </label>
            </div>
            {errors && errors.length > 0 && (
                <span className="text-red-600">{errors[0]}</span>
            )}
        </>
    );
};

export default FloatingLabelSelect