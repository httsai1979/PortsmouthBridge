import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ServiceDocument } from '../types/schema';

interface DataContextType {
    data: ServiceDocument[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    isHydrating: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

/**
 * DataProvider implements a Stale-While-Revalidate (SWR) Strategy:
 * 1. Instant Start: Load from bridge_cache (localStorage)
 * 2. Static Baseline: Load latest data.json from server
 * 3. Dynamic Hydration: Patch with real-time Firestore updates for any change AFTER the baseline
 */
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dataMap, setDataMap] = useState<Map<string, ServiceDocument>>(new Map());
    const [loading, setLoading] = useState(true);
    const [isHydrating, setIsHydrating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Derived array for components
    const data = useMemo(() => Array.from(dataMap.values()), [dataMap]);

    useEffect(() => {
        let isMounted = true;

        const initializeData = async () => {
            try {
                // Phase 1: Local Cache (Instant)
                const cached = localStorage.getItem('bridge_cache');
                if (cached && isMounted) {
                    const parsed = JSON.parse(cached);
                    const map = new Map<string, ServiceDocument>(parsed.data.map((item: ServiceDocument) => [item.id, item]));
                    setDataMap(map);
                    setLastUpdated(parsed.lastUpdated);
                    setLoading(false);
                }

                // Phase 2: Static Baseline (/data.json)
                const response = await fetch('/data.json');
                if (!response.ok) throw new Error('Static baseline unavailable');

                const staticCore = await response.json();
                const staticData: ServiceDocument[] = staticCore.data;
                const staticTimestamp = staticCore.generatedAt;

                if (isMounted) {
                    setDataMap(prev => {
                        const newMap = new Map<string, ServiceDocument>(prev);
                        staticData.forEach(item => newMap.set(item.id, item));
                        return newMap;
                    });
                    setLastUpdated(staticTimestamp);
                    setLoading(false);
                }

                // Phase 3: Firestore Hydration (Real-time Patches)
                setIsHydrating(true);
                const servicesRef = collection(db, 'services');
                // Fetch anything updated since the static baseline was built
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
                        setDataMap(prev => {
                            const newMap = new Map(prev);
                            patches.forEach(patch => {
                                // Graceful Merge: Ensure we don't overwrite newer local states if applicable
                                // though usually Firestore is source of truth
                                newMap.set(patch.id, { ...newMap.get(patch.id), ...patch });
                            });

                            // Update persistent cache
                            const now = new Date().toISOString();
                            localStorage.setItem('bridge_cache', JSON.stringify({
                                data: Array.from(newMap.values()),
                                lastUpdated: now
                            }));

                            return newMap;
                        });
                    }
                    setIsHydrating(false);
                }, (err) => {
                    console.warn('Hydration Error:', err);
                    setIsHydrating(false);
                });

                return unsubscribe;

            } catch (err: any) {
                console.error('Data Strategy Error:', err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                    setIsHydrating(false);
                }
            }
        };

        const unsubscribePromise = initializeData();

        return () => {
            isMounted = false;
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, []);

    return (
        <DataContext.Provider value={{ data, loading, error, lastUpdated, isHydrating }}>
            {children}
        </DataContext.Provider>
    );
};
