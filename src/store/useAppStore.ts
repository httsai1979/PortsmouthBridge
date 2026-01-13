import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Accessibility & UI
    highContrast: boolean;
    stealthMode: boolean;
    fontSize: number;
    isOffline: boolean;
    setHighContrast: (val: boolean) => void;
    setStealthMode: (val: boolean) => void;
    setFontSize: (val: number) => void;
    setIsOffline: (val: boolean) => void;

    // Modals & Overlays
    modals: {
        tips: boolean;
        crisis: boolean;
        partnerLogin: boolean;
        partnerRequest: boolean;
        tutorial: boolean;
        wizard: boolean;
        connectCalculator: boolean;
    };
    setModal: (key: keyof AppState['modals'], isOpen: boolean) => void;
    reportTarget: { name: string, id: string } | null;
    setReportTarget: (target: { name: string, id: string } | null) => void;

    // User Data & Session
    data: any[];
    loading: boolean;
    error: string | null;
    isHydrating: boolean;
    lastUpdated: string | null;
    setData: (data: any[], lastUpdated?: string | null) => void;
    setSyncStatus: (status: Partial<{ loading: boolean, error: string | null, isHydrating: boolean }>) => void;

    savedIds: string[];
    toggleSavedId: (id: string) => void;
    userLocation: { lat: number, lng: number } | null;
    setUserLocation: (loc: { lat: number, lng: number } | null) => void;
    connectInput: any | null;
    setConnectInput: (input: any) => void;
    connectResult: any | null;
    setConnectResult: (result: any) => void;

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
            isOffline: !navigator.onLine,
            modals: {
                tips: false,
                crisis: false,
                partnerLogin: false,
                partnerRequest: false,
                tutorial: !localStorage.getItem('seen_tutorial'),
                wizard: false,
                connectCalculator: false,
            },
            reportTarget: null,
            data: [],
            loading: true,
            error: null,
            isHydrating: false,
            lastUpdated: null,
            savedIds: [],
            userLocation: null,
            connectInput: null,
            connectResult: null,
            notifications: [],

            // Actions
            setHighContrast: (val) => set({ highContrast: val }),
            setStealthMode: (val) => set({ stealthMode: val }),
            setFontSize: (val) => set({ fontSize: val }),
            setIsOffline: (val) => set({ isOffline: val }),
            setModal: (key, isOpen) => set((state) => ({
                modals: { ...state.modals, [key]: isOpen }
            })),
            setReportTarget: (target) => set({ reportTarget: target }),

            setData: (newData, lastUpdated) => set((state) => {
                const merged = new Map(state.data.map(i => [i.id, i]));
                newData.forEach(item => merged.set(item.id, { ...merged.get(item.id), ...item }));
                return {
                    data: Array.from(merged.values()),
                    lastUpdated: lastUpdated || state.lastUpdated
                };
            }),
            setSyncStatus: (status) => set((state) => ({ ...state, ...status })),

            setUserLocation: (loc) => set({ userLocation: loc }),
            setConnectInput: (input) => set({ connectInput: input }),
            setConnectResult: (result) => set({ connectResult: result }),

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
                fontSize: state.fontSize,
                connectInput: state.connectInput,
                connectResult: state.connectResult
            }),
        }
    )
);
