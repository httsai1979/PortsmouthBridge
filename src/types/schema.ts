export interface ServiceDocument {
    id: string;
    name: string;
    category: 'food' | 'shelter' | 'warmth' | 'support' | 'family' | 'mental_health';
    type: string;
    area: string;
    address: string;
    requirements: string;
    description: string;
    tags: string[];
    lat: number;
    lng: number;
    location: {
        lat: number;
        lng: number;
        address: string;
        area: string;
    };
    thresholdInfo: {
        idRequired: boolean;
        queueStatus: 'Empty' | 'Light' | 'Busy' | 'Long' | 'unknown';
        // [FIX] 允許 null，解決 DataMigration 的型別錯誤
        entrancePhotoUrl?: string | null;
        isWheelchairAccessible?: boolean;
    };
    liveStatus: {
        isOpen: boolean;
        capacity: 'High' | 'Medium' | 'Low' | 'Full' | 'Open' | 'Closed' | 'Low Stock' | 'Busy' | 'unknown'; 
        lastUpdated: string; 
        message?: string; 
    };
    entranceMeta?: {
        imageUrl?: string;
        queueStatus?: 'empty' | 'light' | 'busy' | 'unknown';
        idRequired: boolean;
        isWheelchairAccessible?: boolean;
    };
    eligibility?: 'open' | 'referral' | 'membership';
    phone?: string | null;
    website?: string;
    schedule: Record<number, string>; 
    trustScore?: number;
    b2bData?: {
        internalPhone: string;
        partnerNotes: string; 
    };
}