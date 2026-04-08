import { useEffect, type FC } from "react";

interface ToastMessageProps {
  message: string;
  //   isSuccess: boolean;
  isVisible: boolean;
  onClose: () => void;
}
const ToastMessage: FC<ToastMessageProps> = ({
  message,
  //   isSuccess,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[999999] flex w-full max-w-md items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg transition-all duration-300 ${isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-transform duration-300 ${isVisible ? "scale-100" : "scale-90"}`}
        aria-hidden="true"
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-sm font-normal text-gray-800">{message}</p>
    </div>
  );
};

export default ToastMessage;
