import Papa from 'papaparse';
import { getCachedData, setCachedData } from './StorageCache';

export interface LiveStatus {
    id: string;
    status: 'Open' | 'Closed' | 'Low Stock' | 'Busy' | 'Full';
    urgency: 'None' | 'Low' | 'Normal' | 'High' | 'Critical';
    message: string;
    lastUpdated: string;
}

const LIVE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1GQ1A8zwuViV0_s-UGtYUX0olW2ktZFnGRCfv9bpm5K8/export?format=csv&gid=1864437155";
const CACHE_KEY = 'live_status_cache';

export const fetchLiveStatus = async (): Promise<Record<string, LiveStatus>> => {
    // 0. Strict Cache Check (15m TTL)
    const cached = getCachedData<Record<string, LiveStatus>>(CACHE_KEY);
    if (cached) {
        console.log("CACHE HIT: Using valid 15m live status cache");
        return cached;
    }

    // 1. Check if actually online before attempting fetch to save battery/data
    if (!navigator.onLine) {
        console.warn("OFFLINE: Attempting to pull expired cache for live status");
        const expired = localStorage.getItem(CACHE_KEY);
        if (expired) {
            try {
                return JSON.parse(expired).data;
            } catch { return {}; }
        }
        return {};
    }

    console.log("CACHE MISS: Fetching fresh live status from Google Sheets...");

    try {
        const response = await fetch(LIVE_SHEET_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const csvText = await response.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<Record<string, string>>) => {
                    const statusMap: Record<string, LiveStatus> = {};

                    results.data.forEach((row) => {
                        if (row.ID) {
                            statusMap[row.ID] = {
                                id: row.ID,
                                status: (row.Status as LiveStatus['status']) || 'Open',
                                urgency: (row.Urgency as LiveStatus['urgency']) || 'Normal',
                                message: row.Message || '',
                                lastUpdated: row.LastUpdated || ''
                            };
                        }
                    });

                    // Update cache for 15m
                    setCachedData(CACHE_KEY, statusMap);
                    console.log(`CACHE UPDATE: Persisted ${Object.keys(statusMap).length} status items`);
                    resolve(statusMap);
                },
                error: (err: Error) => {
                    console.error("CSV Parse Error:", err);
                    resolve({});
                }
            });
        });

    } catch (error) {
        console.error("Live fetch failed, falling back to expired cache:", error);
        const expired = localStorage.getItem(CACHE_KEY);
        if (expired) {
            try {
                return JSON.parse(expired).data;
            } catch { return {}; }
        }
        return {};
    }
};