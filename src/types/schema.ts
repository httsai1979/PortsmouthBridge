export interface ServiceDocument {
    id: string;
    name: string;
    category: 'food' | 'shelter' | 'warmth' | 'support' | 'family';
    location: {
        lat: number;
        lng: number;
        address: string;
        area: string;
    };
    thresholdInfo: {
        idRequired: boolean;
        queueStatus: 'Empty' | 'Light' | 'Busy' | 'Long';
        // [FIX] 允許 null，解決 DataMigration 的型別錯誤
        entrancePhotoUrl?: string | null;
    };
    liveStatus: {
        isOpen: boolean;
        capacity: 'High' | 'Medium' | 'Low' | 'Full'; 
        lastUpdated: string; 
        message?: string; 
    };
    b2bData?: {
        internalPhone: string;
        partnerNotes: string; 
    };
    description: string;
    tags: string[];
    // [FIX] 允許 null，解決 DataMigration 的型別錯誤
    phone?: string | null;
    website?: string;
    schedule: Record<number, string>; 
    trustScore?: number;
}