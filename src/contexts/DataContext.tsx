import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ServiceDocument } from '../types/schema';

interface DataContextType {
    data: ServiceDocument[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<ServiceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            try {
                // 1. Try Cache for instant start
                const cached = localStorage.getItem('bridge_data_cache');
                if (cached && isMounted) {
                    try {
                        const parsed = JSON.parse(cached);
                        setData(parsed.data);
                        setLastUpdated(parsed.timestamp);
                        setLoading(false);
                    } catch (e) {
                        console.warn('Failed to parse cache', e);
                    }
                }

                // 2. Fetch data.json (Static Core)
                const response = await fetch('/data.json');
                if (response.ok) {
                    const jsonData: ServiceDocument[] = await response.json();
                    if (isMounted) {
                        setData(jsonData);
                        setLoading(false);
                    }
                } else {
                    console.error('Failed to fetch data.json');
                    if (!cached) setError('Offline and no cached data found.');
                }

                // 3. Live Merge (Anti-Gravity Firestore Logic)
                const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
                    if (!isMounted) return;

                    const firestoreData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as ServiceDocument));

                    setData(prevData => {
                        const merged = [...prevData];
                        firestoreData.forEach(fsItem => {
                            const index = merged.findIndex(item => item.id === fsItem.id);
                            if (index !== -1) {
                                // Overwrite JSON with Firestore updates
                                merged[index] = { ...merged[index], ...fsItem };
                            } else {
                                // Add new items that might only exist in Firestore
                                merged.push(fsItem);
                            }
                        });

                        const timestamp = new Date().toISOString();
                        setLastUpdated(timestamp);

                        // Persistent Cache
                        localStorage.setItem('bridge_data_cache', JSON.stringify({
                            data: merged,
                            timestamp
                        }));

                        return merged;
                    });
                });

                return unsubscribe;

            } catch (err: any) {
                console.error('Data provider error:', err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        const unsubscribePromise = loadInitialData();

        return () => {
            isMounted = false;
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, []);

    return (
        <DataContext.Provider value={{ data, loading, error, lastUpdated }}>
            {children}
        </DataContext.Provider>
    );
};
