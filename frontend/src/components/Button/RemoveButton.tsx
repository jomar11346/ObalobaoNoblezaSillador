interface RemoveButtonProps {
  label: string;
  className?: string;
  newClassName?: string;
  onRemove: () => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ label, className, newClassName, onRemove }) =>  {
  return (
    <>
    <button type="button" className={newClassName ? newClassName : 
        `yb-btn-primary ${className ?? ""}`} onClick={onRemove}>
      {label}
    </button>
    </>
  )
}

export default RemoveButton