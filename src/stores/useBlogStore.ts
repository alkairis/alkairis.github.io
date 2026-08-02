import { create } from 'zustand';
import { getBlogs, type ApiError, type BlogPost } from '../api/api';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

type FetchOptions = {
  force?: boolean;
};

type BlogStore = {
  posts: BlogPost[];
  status: AsyncStatus;
  error: string | null;
  lastFetchedAt: number | null;
  fetchBlogs: (options?: FetchOptions) => Promise<BlogPost[]>;
  resetBlogs: () => void;
};

let activeBlogRequest: Promise<BlogPost[]> | null = null;

const getApiErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'Blog posts are temporarily unavailable.';
  }

  const apiError = error as Partial<ApiError>;

  if (apiError.isNetworkError) {
    return 'Blog posts are temporarily unavailable.';
  }

  return apiError.message || 'Blog posts are temporarily unavailable.';
};

export const useBlogStore = create<BlogStore>((set, get) => ({
  posts: [],
  status: 'idle',
  error: null,
  lastFetchedAt: null,

  fetchBlogs: async ({ force = false } = {}) => {
    const { posts, status } = get();

    if (!force && status === 'success') {
      return posts;
    }

    if (!force && activeBlogRequest) {
      return activeBlogRequest;
    }

    set({ status: 'loading', error: null });

    activeBlogRequest = getBlogs()
      .then((blogPosts) => {
        set({
          posts: blogPosts,
          status: 'success',
          error: null,
          lastFetchedAt: Date.now(),
        });

        return blogPosts;
      })
      .catch((error: unknown) => {
        const message = getApiErrorMessage(error);
        set({ status: 'error', error: message });
        throw error;
      })
      .finally(() => {
        activeBlogRequest = null;
      });

    return activeBlogRequest;
  },

  resetBlogs: () => {
    activeBlogRequest = null;
    set({
      posts: [],
      status: 'idle',
      error: null,
      lastFetchedAt: null,
    });
  },
}));
