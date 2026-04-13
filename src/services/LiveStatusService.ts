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
    // 0. Check Cache first
    const cached = getCachedData<Record<string, LiveStatus>>(CACHE_KEY);
    if (cached) {
        console.log("Using cached Live Status (15m TTL)");
        return cached;
    }

    try {
        // 1. 發送真實的網路請求去抓取 CSV
        const response = await fetch(LIVE_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`無法讀取表格，HTTP 狀態碼: ${response.status}`);
        }

        // 2. 取得文字內容
        const csvText = await response.text();

        // 3. 使用 PapaParse 解析 CSV
        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true, 
                skipEmptyLines: true,
                complete: (results: any) => {
                    const statusMap: Record<string, LiveStatus> = {};
                    
                    results.data.forEach((row: any) => {
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
                    
                    // Save to Cache
                    setCachedData(CACHE_KEY, statusMap);
                    
                    console.log("成功載入即時狀態:", Object.keys(statusMap).length + " 筆資料");
                    resolve(statusMap);
                },
                error: (err: any) => {
                    console.error("CSV 解析失敗:", err);
                    resolve({}); 
                }
            });
        });

    } catch (error) {
        console.error("連線 Google Sheet 失敗:", error);
        return {}; 
    }
};