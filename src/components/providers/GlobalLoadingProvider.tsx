'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type GlobalLoadingContextValue = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(callback: () => Promise<T>) => Promise<T>;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(
  null,
);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const value = useMemo<GlobalLoadingContextValue>(() => {
    function startLoading() {
      setLoadingCount((prev) => prev + 1);
    }

    function stopLoading() {
      setLoadingCount((prev) => Math.max(prev - 1, 0));
    }

    async function withLoading<T>(callback: () => Promise<T>) {
      startLoading();

      try {
        return await callback();
      } finally {
        stopLoading();
      }
    }

    return {
      isLoading: loadingCount > 0,
      startLoading,
      stopLoading,
      withLoading,
    };
  }, [loadingCount]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}

      {loadingCount > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);

  if (!context) {
    throw new Error(
      'useGlobalLoading must be used inside GlobalLoadingProvider',
    );
  }

  return context;
}
