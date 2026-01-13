import fs from 'fs';
import path from 'path';
import { ALL_DATA } from '../src/data';

// Helper to map categories
const mapCategory = (cat: string): 'food' | 'shelter' | 'warmth' | 'support' | 'family' => {
    if (['food', 'shelter', 'warmth', 'family'].includes(cat)) {
        return cat as any;
    }
    return 'support';
};

// Helper to map queue status
const mapQueueStatus = (status?: string): 'Empty' | 'Light' | 'Busy' | 'Long' => {
    switch (status) {
        case 'empty': return 'Empty';
        case 'light': return 'Light';
        case 'busy': return 'Busy';
        case 'unknown': return 'Light';
        default: return 'Empty';
    }
};

const serviceDocuments = ALL_DATA.map(item => ({
    id: item.id,
    name: item.name,
    category: mapCategory(item.category),
    location: {
        lat: item.lat,
        lng: item.lng,
        address: item.address,
        area: item.area,
    },
    thresholdInfo: {
        idRequired: item.entranceMeta?.idRequired || false,
        queueStatus: mapQueueStatus(item.entranceMeta?.queueStatus),
        entrancePhotoUrl: item.entranceMeta?.imageUrl || null,
    },
    liveStatus: {
        isOpen: false, // Default to closed, Firestore will update
        capacity: 'High' as const,
        lastUpdated: new Date().toISOString(),
        message: '',
    },
    description: item.description,
    tags: item.tags || [],
    phone: item.phone || null,
    website: '', // Resource doesn't have it
    schedule: item.schedule,
    trustScore: item.trustScore || 0,
}));

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(
    path.join(publicDir, 'data.json'),
    JSON.stringify(serviceDocuments, null, 2)
);

console.log('Successfully generated public/data.json with ' + serviceDocuments.length + ' items.');
