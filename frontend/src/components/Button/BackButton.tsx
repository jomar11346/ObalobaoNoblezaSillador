import type { FC } from "react";
import { Link } from "react-router-dom";

interface BackButtonProps {
  label: string;
  path: string;
  newClassName?: string;
  className?: string;
}

const BackButton: FC<BackButtonProps> = ({
  label,
  path,
  newClassName,
  className,
}) => {
  return (
    <>
      <Link
        to={path}
        className={`${
          newClassName
            ? newClassName
            : "yb-btn-secondary"
        } ${className}`}
      >
        {label}
      </Link>
    </>
  );
};

export default BackButton;
