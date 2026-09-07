import { useCallback, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { LoadingContext } from "./loadingContext";
import type { LoadingContextValue } from "./loadingContext";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(() => new Set());

  const setTaskLoading = useCallback((id: string, isLoading: boolean) => {
    setPendingTasks((prev) => {
      const has = prev.has(id);
      if (isLoading === has) return prev;
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo<LoadingContextValue>(
    () => ({ isLoading: pendingTasks.size > 0, setTaskLoading }),
    [pendingTasks, setTaskLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
