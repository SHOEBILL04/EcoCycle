import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: {
    name: 'Jane Eco',
    title: 'Citizen Defender',
    points: 1250,
  },
  clan: {
    name: 'Dhanmondi Dragons',
    points: 45000,
    rank: 'Gold',
  },
  notifications: [],
  addPoints: (points) => set((state) => ({
    user: { ...state.user, points: state.user.points + points },
    clan: { ...state.clan, points: state.clan.points + points }
  })),
  addNotification: (msg) => set((state) => ({
    notifications: [msg, ...state.notifications]
  })),
}));
