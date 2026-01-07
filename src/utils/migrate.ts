import { db } from '../lib/firebase';
import { collection, setDoc, doc } from 'firebase/firestore';
import { ALL_DATA } from '../data';
import type { ServiceDocument } from '../types/schema';

export const migrateData = async () => {
    console.log('Starting migration to Firestore...');
    const servicesCollection = collection(db, 'services');

    for (const resource of ALL_DATA) {
        // Basic mapping with default values for new Phase 1 fields
        const docData: ServiceDocument = {
            id: resource.id,
            name: resource.name,
            // mapping broad categories to the new specific union
            category: (['food', 'shelter', 'warmth', 'support', 'family'].includes(resource.category)
                ? resource.category
                : 'support') as any,
            location: {
                lat: resource.lat,
                lng: resource.lng,
                address: resource.address,
                area: resource.area,
            },
            thresholdInfo: {
                idRequired: resource.entranceMeta?.idRequired ?? false,
                queueStatus: resource.entranceMeta?.queueStatus
                    ? (resource.entranceMeta.queueStatus.charAt(0).toUpperCase() + resource.entranceMeta.queueStatus.slice(1)) as any
                    : 'Empty',
                entrancePhotoUrl: resource.entranceMeta?.imageUrl
            },
            liveStatus: {
                isOpen: true, // Default to true based on static schedule usually
                capacity: 'High',
                lastUpdated: new Date().toISOString(),
                message: "Welcome to Portsmouth Bridge live updates."
            },
            b2bData: {
                internalPhone: resource.phone || '023 9282 2251 (Council Hub)',
                partnerNotes: "Migrated from Portsmouth Bridge V1 Static Dataset."
            },
            description: resource.description,
            tags: resource.tags,
            phone: resource.phone,
            schedule: resource.schedule,
            trustScore: resource.trustScore
        };

        try {
            await setDoc(doc(servicesCollection, resource.id), docData);
            console.log(`Migrated: ${resource.name}`);
        } catch (error) {
            console.error(`Error migrating ${resource.name}:`, error);
        }
    }

    console.log('Migration completed successfully!');
};
