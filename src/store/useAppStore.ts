import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Accessibility & UI
    highContrast: boolean;
    stealthMode: boolean;
    fontSize: number;
    setHighContrast: (val: boolean) => void;
    setStealthMode: (val: boolean) => void;
    setFontSize: (val: number) => void;

    // User Data
    savedIds: string[];
    toggleSavedId: (id: string) => void;
    userLocation: { lat: number, lng: number } | null;
    setUserLocation: (loc: { lat: number, lng: number } | null) => void;

    // Notifications
    notifications: any[];
    addNotification: (n: any) => void;
    clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Defaults
            highContrast: false,
            stealthMode: false,
            fontSize: 0,
            savedIds: [],
            userLocation: null,
            notifications: [],

            // Actions
            setHighContrast: (val) => set({ highContrast: val }),
            setStealthMode: (val) => set({ stealthMode: val }),
            setFontSize: (val) => set({ fontSize: val }),
            setUserLocation: (loc) => set({ userLocation: loc }),

            toggleSavedId: (id) => set((state) => ({
                savedIds: state.savedIds.includes(id)
                    ? state.savedIds.filter(i => i !== id)
                    : [...state.savedIds, id]
            })),

            addNotification: (n) => set((state) => ({
                notifications: [n, ...state.notifications].slice(0, 50)
            })),

            clearNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'portsmouth-bridge-storage',
            partialize: (state) => ({
                savedIds: state.savedIds,
                highContrast: state.highContrast,
                stealthMode: state.stealthMode,
                fontSize: state.fontSize
            }),
        }
    )
);
