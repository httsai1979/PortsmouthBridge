import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ServiceDocument } from '../types/schema';
import { useAppStore } from '../store/useAppStore';
import { getCachedData, setCachedData } from '../services/StorageCache';

const CACHE_KEY = 'bridge_cache';

/**
 * Custom hook that implements the Hybrid Data Sync Strategy:
 * 1. Instant Start: Hydrate from bridge_cache (localStorage) with 15m TTL
 * 2. Static Baseline: Load latest data.json from server (if cache expired)
 * 3. Real-time Overlay: Patch with Firestore updates (if cache expired)
 */
export const useDataSync = () => {
    const { setData, setSyncStatus, data: storeData, lastUpdated: currentLastUpdated } = useAppStore();

    useEffect(() => {
        let isMounted = true;
        let unsubscribe: (() => void) | undefined;

        const initializeData = async () => {
            try {
                // Phase 1: Local Cache (Instant Hydration)
                const cached = getCachedData<{ data: ServiceDocument[], lastUpdated: string | null }>(CACHE_KEY);
                
                if (cached && isMounted) {
                    console.log("Using cached Firestore data (15m TTL)");
                    setData(cached.data, cached.lastUpdated);
                    setSyncStatus({ loading: false });
                    return; // Skip network fetch if cache is valid
                }

                // If no cache or expired, proceed to network
                console.log("Cache missing or expired, fetching from network...");

                // Phase 2: Static Baseline (/data.json) - The "Warm" Start
                try {
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
                    const q = query(
                        servicesRef,
                        where('liveStatus.lastUpdated', '>', staticTimestamp)
                    );

                    unsubscribe = onSnapshot(q, (snapshot) => {
                        if (!isMounted) return;

                        const patches = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as ServiceDocument));

                        if (patches.length > 0) {
                            setData(patches);
                        }
                        
                        // After live sync, update cache to reset TTL
                        const latestStore = useAppStore.getState();
                        setCachedData(CACHE_KEY, {
                            data: latestStore.data,
                            lastUpdated: latestStore.lastUpdated
                        });

                        setSyncStatus({ isHydrating: false });
                    }, (err) => {
                        console.warn('Live Hydration Error (Falling back to static):', err);
                        if (isMounted) setSyncStatus({ isHydrating: false });
                    });

                } catch (fetchErr) {
                    console.error('Static data fetch failed:', fetchErr);
                    
                    // Try to load any expired cache as fallback if truly offline
                    const expiredCache = localStorage.getItem(CACHE_KEY);
                    if (expiredCache && isMounted) {
                        try {
                            const parsed = JSON.parse(expiredCache).data;
                            setData(parsed.data, parsed.lastUpdated);
                        } catch (e) {}
                    }

                    if (isMounted) {
                        setSyncStatus({
                            loading: false,
                            error: !expiredCache ? 'Offline and no cache' : null
                        });
                    }
                }

            } catch (err: any) {
                console.error('Data Strategy Error:', err);
                if (isMounted) {
                    setSyncStatus({ error: err.message, loading: false, isHydrating: false });
                }
            }
        };

        initializeData();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [setData, setSyncStatus]);

    // Side effect: Persist store data to localStorage whenever it changes (optional auto-refresh)
    // We already do it in onSnapshot, but let's keep it robust for other updates if any.
    useEffect(() => {
        if (storeData.length > 0) {
            setCachedData(CACHE_KEY, {
                data: storeData,
                lastUpdated: currentLastUpdated
            });
        }
    }, [currentLastUpdated, storeData]);
};
