import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

type LoadingContextValue = {
  /** True while at least one registered task is still in flight. */
  isLoading: boolean;
  /** Register or clear a named task. Idempotent. */
  setTaskLoading: (id: string, isLoading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

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

export const useAppLoading = (): LoadingContextValue => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useAppLoading must be used within a LoadingProvider");
  return ctx;
};

/**
 * Registers a named async task (e.g. "blogs", "projects") as loading so the
 * preloader can hold until every registered task has resolved.
 */
export const useLoadingTask = (id: string, isLoading: boolean): void => {
  const { setTaskLoading } = useAppLoading();

  useEffect(() => {
    setTaskLoading(id, isLoading);
    return () => setTaskLoading(id, false);
  }, [id, isLoading, setTaskLoading]);
};
