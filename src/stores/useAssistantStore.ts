import { create } from "zustand";

type AssistantStore = {
  open: boolean;
  /** Query to pre-fill when the menu opens (e.g. a hero follow-up). */
  seed: string;
  openMenu: (seed?: string) => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

/** Open state of the ghost's AI menu, shared by the ghost, ⌘K and the hero. */
export const useAssistantStore = create<AssistantStore>((set, get) => ({
  open: false,
  seed: "",
  openMenu: (seed = "") => set({ open: true, seed }),
  closeMenu: () => set({ open: false, seed: "" }),
  toggleMenu: () => set({ open: !get().open, seed: "" }),
}));
