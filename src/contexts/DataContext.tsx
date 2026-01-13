import React, { createContext, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ServiceDocument } from '../types/schema';
import { useAppStore } from '../store/useAppStore';

const DataContext = createContext<undefined>(undefined);

export const useData = () => {
    const { data, loading, error, lastUpdated, isHydrating } = useAppStore();
    return { data, loading, error, lastUpdated, isHydrating };
};

/**
 * DataProvider implements a Hybrid Data Sync Strategy:
 * 1. Instant Start: Hydrate from bridge_cache (localStorage)
 * 2. Static Baseline: Load latest data.json from server
 * 3. Real-time Overlay: Patch with Firestore updates for any change AFTER the baseline
 */
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setData, setSyncStatus, lastUpdated: currentLastUpdated } = useAppStore();

    useEffect(() => {
        let isMounted = true;

        const initializeData = async () => {
            try {
                // Phase 1: Local Cache (Instant Hydration)
                const cached = localStorage.getItem('bridge_cache');
                if (cached && isMounted) {
                    const parsed = JSON.parse(cached);
                    setData(parsed.data, parsed.lastUpdated);
                    setSyncStatus({ loading: false });
                }

                // Phase 2: Static Baseline (/data.json) - The "Warm" Start
                const response = await fetch('/data.json');
                if (!response.ok) throw new Error('Static baseline unavailable');

                const staticCore = await response.json();
                const staticData: ServiceDocument[] = staticCore.data;
                const staticTimestamp = staticCore.generatedAt;

                if (isMounted) {
                    setData(staticData, staticTimestamp);
                    setSyncStatus({ loading: false });
                }

                // Phase 3: Firestore Hydration - The "Live" Layer
                setSyncStatus({ isHydrating: true });
                const servicesRef = collection(db, 'services');

                // Fetch anything updated since the static baseline was built
                // We use the timestamp from the static file to find only "new" changes
                const q = query(
                    servicesRef,
                    where('liveStatus.lastUpdated', '>', staticTimestamp)
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    if (!isMounted) return;

                    const patches = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as ServiceDocument));

                    if (patches.length > 0) {
                        setData(patches);

                        // Persist to local cache for next load
                        // We use a small timeout to let the store settle before reading full state if needed,
                        // but here we can just subscribe to the store or rely on the next effect cycle.
                        // For simplicity in Phase 2, we update the cache when store is updated.
                    }
                    setSyncStatus({ isHydrating: false });
                }, (err) => {
                    console.warn('Live Hydration Error (Falling back to static):', err);
                    setSyncStatus({ isHydrating: false });
                });

                return unsubscribe;

            } catch (err: any) {
                console.error('Data Strategy Error:', err);
                if (isMounted) {
                    setSyncStatus({ error: err.message, loading: false, isHydrating: false });
                }
            }
        };

        const unsubscribePromise = initializeData();

        return () => {
            isMounted = false;
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, []);

    // Side effect: Persist store data to localStorage whenever it changes
    // This completes the "Hybrid" loop
    useEffect(() => {
        const store = useAppStore.getState();
        if (store.data.length > 0) {
            localStorage.setItem('bridge_cache', JSON.stringify({
                data: store.data,
                lastUpdated: store.lastUpdated
            }));
        }
    }, [currentLastUpdated]);

    return (
        <DataContext.Provider value={undefined}>
            {children}
        </DataContext.Provider>
    );
};
