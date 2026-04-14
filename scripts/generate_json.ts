import fs from 'fs';
import path from 'path';
import { ALL_DATA } from '../src/data';
import { ServiceDocument } from '../src/types/schema';

/**
 * Generator Script: CMS Simulation
 * Converts static src/data.ts to public/data.json with validation.
 */

const mapCategory = (cat: string): ServiceDocument['category'] => {
    const valid: Array<ServiceDocument['category']> = ['food', 'shelter', 'warmth', 'support', 'family', 'mental_health'];
    return (valid.includes(cat as any) ? cat : 'support') as ServiceDocument['category'];
};

const mapQueueStatus = (status?: string): ServiceDocument['thresholdInfo']['queueStatus'] => {
    const s = status?.toLowerCase();
    if (s === 'empty') return 'Empty';
    if (s === 'light') return 'Light';
    if (s === 'busy') return 'Busy';
    if (s === 'long') return 'Long';
    return 'unknown';
};

const mapCapacity = (cap?: string): ServiceDocument['liveStatus']['capacity'] => {
    const c = cap?.toLowerCase();
    if (c === 'high') return 'High';
    if (c === 'medium') return 'Medium';
    if (c === 'low') return 'Low';
    if (c === 'full') return 'Full';
    return 'unknown';
};

console.log('🚀 Starting Static Data Generation...');

const serviceDocuments: ServiceDocument[] = ALL_DATA.map(item => {
    // Basic validation / transformation
    const doc: ServiceDocument = {
        id: item.id,
        name: item.name || 'Unnamed Service',
        category: mapCategory(item.category),
        type: item.type || '',
        area: item.area || '',
        address: item.address || '',
        requirements: item.requirements || '',
        description: item.description || '',
        tags: item.tags || [],
        lat: item.lat || 50.8000,
        lng: item.lng || -1.0800,
        location: {
            lat: item.lat || 50.8000,
            lng: item.lng || -1.0800,
            address: item.address || 'Address provided on contact',
            area: item.area || 'All',
        },
        thresholdInfo: {
            idRequired: item.entranceMeta?.idRequired || false,
            queueStatus: mapQueueStatus(item.entranceMeta?.queueStatus),
            entrancePhotoUrl: item.entranceMeta?.imageUrl || null,
        },
        liveStatus: {
            isOpen: true, // Default to true in static build
            capacity: mapCapacity(item.capacityLevel),
            lastUpdated: new Date().toISOString(),
            message: '',
        },
        phone: item.phone || null,
        website: (item as typeof item & { website?: string }).website || '',
        schedule: item.schedule || {},
        trustScore: item.trustScore || 0,
    };

    return doc;
});

const output = {
    generatedAt: new Date().toISOString(),
    version: '1.2.0',
    count: serviceDocuments.length,
    data: serviceDocuments
};

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
    path.join(publicDir, 'data.json'),
    JSON.stringify(output, null, 2)
);

console.log(`✅ Success: Generated public/data.json`);
console.log(`📊 Records: ${serviceDocuments.length}`);
console.log(`🕒 Timestamp: ${output.generatedAt}`);
