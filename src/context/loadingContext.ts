import { createContext, useContext, useEffect } from "react";

export type LoadingContextValue = {
  /** True while at least one registered task is still in flight. */
  isLoading: boolean;
  /** Register or clear a named task. Idempotent. */
  setTaskLoading: (id: string, isLoading: boolean) => void;
};

// The context object and its hooks live apart from the provider component so
// that LoadingContext.tsx exports a component and nothing else — react-refresh
// cannot fast-refresh a module that mixes the two.
export const LoadingContext = createContext<LoadingContextValue | null>(null);

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
