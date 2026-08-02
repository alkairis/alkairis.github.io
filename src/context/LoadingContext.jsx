import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [pendingTasks, setPendingTasks] = useState(() => new Set());

  const setTaskLoading = useCallback((id, isLoading) => {
    setPendingTasks((prev) => {
      const has = prev.has(id);
      if (isLoading === has) return prev;
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isLoading: pendingTasks.size > 0, setTaskLoading }),
    [pendingTasks, setTaskLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useAppLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useAppLoading must be used within a LoadingProvider");
  return ctx;
};

/**
 * Registers a named async task (e.g. "blogs", "projects") as loading so the
 * preloader can hold until every registered task has resolved.
 */
export const useLoadingTask = (id, isLoading) => {
  const { setTaskLoading } = useAppLoading();

  useEffect(() => {
    setTaskLoading(id, isLoading);
    return () => setTaskLoading(id, false);
  }, [id, isLoading, setTaskLoading]);
};
