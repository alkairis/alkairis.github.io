import { create } from 'zustand';
import {
  getAchievements,
  getCertificates,
  getProjects,
  getYearsOfExperience,
  type ApiError,
  type Recognition,
} from '../api/api';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

type FetchOptions = {
  force?: boolean;
};

/** A single headline stat tile ("5+", "Professional Certifications"). */
export type RecognitionStat = {
  value: string;
  label: string;
};

type RecognitionData = {
  stats: RecognitionStat[];
  cards: Recognition[];
};

type RecognitionStore = RecognitionData & {
  status: AsyncStatus;
  error: string | null;
  lastFetchedAt: number | null;
  fetchRecognition: (options?: FetchOptions) => Promise<RecognitionData>;
  resetRecognition: () => void;
};

let activeRecognitionRequest: Promise<RecognitionData> | null = null;

const getApiErrorMessage = (error: unknown): string => {
  const fallback = 'Recognition details are temporarily unavailable.';
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const apiError = error as Partial<ApiError>;
  if (apiError.isNetworkError) {
    return fallback;
  }

  return apiError.message || fallback;
};

// When a source resolves we know its exact count; when it rejects we show a
// dash rather than a misleading zero.
const countValue = (
  result: PromiseSettledResult<unknown[]>,
  suffix = ''
): string => (result.status === 'fulfilled' ? `${result.value.length}${suffix}` : '—');

const buildStats = (
  certificates: PromiseSettledResult<unknown[]>,
  projects: PromiseSettledResult<unknown[]>,
  years: PromiseSettledResult<number>
): RecognitionStat[] => [
  { label: 'Professional Certifications', value: countValue(certificates, '+') },
  {
    label: 'Years Experience',
    value: years.status === 'fulfilled' ? `${years.value}+` : '—',
  },
  { label: 'Major Projects Completed', value: countValue(projects, '+') },
];

const firstRejection = (
  ...results: PromiseSettledResult<unknown>[]
): unknown => {
  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );
  return rejected?.reason;
};

export const useRecognitionStore = create<RecognitionStore>((set, get) => ({
  stats: [],
  cards: [],
  status: 'idle',
  error: null,
  lastFetchedAt: null,

  fetchRecognition: async ({ force = false } = {}) => {
    const { status, stats, cards } = get();

    if (!force && status === 'success') {
      return { stats, cards };
    }

    if (!force && activeRecognitionRequest) {
      return activeRecognitionRequest;
    }

    set({ status: 'loading', error: null });

    activeRecognitionRequest = Promise.allSettled([
      getAchievements(),
      getCertificates(),
      getProjects(),
      getYearsOfExperience(),
    ])
      .then(([achievements, certificates, projects, years]) => {
        // Every source failing means the section has nothing to show — surface
        // it as an error; otherwise render whatever resolved.
        const anyFulfilled = [achievements, certificates, projects, years].some(
          (result) => result.status === 'fulfilled'
        );

        if (!anyFulfilled) {
          throw firstRejection(achievements, certificates, projects, years);
        }

        const data: RecognitionData = {
          stats: buildStats(certificates, projects, years),
          cards: achievements.status === 'fulfilled' ? achievements.value : [],
        };

        set({
          ...data,
          status: 'success',
          error: null,
          lastFetchedAt: Date.now(),
        });

        return data;
      })
      .catch((error: unknown) => {
        set({ status: 'error', error: getApiErrorMessage(error) });
        throw error;
      })
      .finally(() => {
        activeRecognitionRequest = null;
      });

    return activeRecognitionRequest;
  },

  resetRecognition: () => {
    activeRecognitionRequest = null;
    set({
      stats: [],
      cards: [],
      status: 'idle',
      error: null,
      lastFetchedAt: null,
    });
  },
}));
