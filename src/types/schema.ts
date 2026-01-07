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
    // PDF Page 4: "Door Threshold Transparency"
    thresholdInfo: {
        idRequired: boolean;
        queueStatus: 'Empty' | 'Light' | 'Busy' | 'Long';
        entrancePhotoUrl?: string;
    };
    // PDF Page 5: "Live Status"
    liveStatus: {
        isOpen: boolean;
        capacity: 'High' | 'Medium' | 'Low' | 'Full'; // For "Good Stock" / "Limited Stock"
        lastUpdated: string; // ISO timestamp
        message?: string; // e.g. "We need volunteers"
    };
    // PDF Page 5: "B2B Data Access" (Protected Fields)
    b2bData?: {
        internalPhone: string;
        partnerNotes: string; // Internal coordination notes
    };
    // Keeping some original fields for compatibility
    description: string;
    tags: string[];
    phone?: string;
    website?: string;
    schedule: Record<number, string>; // Day index to hours string
    trustScore?: number;
}
