import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface UnmetNeed {
    term: string;
    timestamp: any;
    area: string;
    category: string;
    resultCount: number;
}

export const logSearchEvent = async (term: string, resultCount: number, area: string = 'All', category: string = 'all') => {
    if (!term.trim()) return;

    // We primarily care about logs where users found very few or zero results
    // This helps identify "Service Gaps" (PDF Page 10)
    try {
        const analyticsRef = collection(db, 'analytics_gaps');
        await addDoc(analyticsRef, {
            term: term.toLowerCase().trim(),
            resultCount,
            area,
            category,
            timestamp: serverTimestamp(),
            isCritical: resultCount === 0
        });
    } catch (error) {
        console.error("Error logging analytics:", error);
    }
};
