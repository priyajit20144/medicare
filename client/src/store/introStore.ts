import { create } from 'zustand';

interface IntroState {
  isPlaying: boolean;
  autoPlayOnVisit: boolean;
  playIntro: () => void;
  closeIntro: () => void;
  toggleAutoPlayOnVisit: (enabled?: boolean) => void;
}

export const useIntroStore = create<IntroState>((set, get) => ({
  isPlaying: false,
  autoPlayOnVisit: localStorage.getItem('medicare_intro_autoplay') === 'true',

  playIntro: () => {
    set({ isPlaying: true });
  },

  closeIntro: () => {
    set({ isPlaying: false });
  },

  toggleAutoPlayOnVisit: (enabled) => {
    const nextVal = enabled !== undefined ? enabled : !get().autoPlayOnVisit;
    localStorage.setItem('medicare_intro_autoplay', String(nextVal));
    set({ autoPlayOnVisit: nextVal });
  },
}));
