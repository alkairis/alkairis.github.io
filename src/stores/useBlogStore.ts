import { create } from 'zustand';
import { getBlogs, type BlogPost } from '../api/api';

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

// One plain sentence for visitors. The underlying axios text ("Request failed
// with status code 500") was being rendered straight into the page, which is
// console material, not something to show someone reading the site.
const BLOG_ERROR_MESSAGE = 'Blog posts are temporarily unavailable.';

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
        set({ status: 'error', error: BLOG_ERROR_MESSAGE });
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
