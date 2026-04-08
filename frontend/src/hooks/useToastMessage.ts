import { useCallback, useState } from "react";

export function useToastMessage(initialMessage: string, initialVisible: boolean) {
  const [message, setMessage] = useState(initialMessage);
  const [isVisible, setIsVisible] = useState(initialVisible);

  const showToastMessage = useCallback((msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  }, []);

  const closeToastMessage = useCallback(() => {
    setIsVisible(false);
  }, []);

  return { message, isVisible, showToastMessage, closeToastMessage };
}
