import { useCallback, useState } from "react";

/** Bump `refresh` when `handleRefresh` runs so children can react (e.g. refetch lists). */
export function useRefresh() {
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefresh((n) => n + 1);
  }, []);

  return { refresh, handleRefresh };
}
