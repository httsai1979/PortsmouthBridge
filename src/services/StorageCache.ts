export interface CachedData<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const getCachedData = <T>(key: string): T | null => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
        const parsed: CachedData<T> = JSON.parse(cached);
        const now = Date.now();
        if (now - parsed.timestamp > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    } catch (e) {
        return null;
    }
};

export const setCachedData = <T>(key: string, data: T) => {
    const cacheItem: CachedData<T> = {
        data,
        timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
};
