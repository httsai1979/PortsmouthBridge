import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { checkStatus, getDistance } from '../utils';
import { ServiceDocument } from '../types/schema';

interface FilterState {
    area: string;
    category: string;
    q: string;
    openNow: boolean;
    verified: boolean;
    nearMe: boolean;
}

export const useFilteredData = (
    dynamicData: ServiceDocument[],
    filters: FilterState,
    userLocation: { lat: number, lng: number } | null
) => {
    return useMemo(() => {
        let mergedData = dynamicData.map(item => ({
            ...item,
            lat: item.location.lat,
            lng: item.location.lng,
            address: item.location.address,
            area: item.location.area,
            type: item.category === 'food' ? 'Pantry' : (item.category.charAt(0).toUpperCase() + item.category.slice(1)),
            eligibility: (item.tags.includes('no_referral') ? 'open' : 'referral') as 'open' | 'referral',
            requirements: "",
            thanksCount: 0,
            phone: item.phone || undefined,
            entranceMeta: {
                imageUrl: item.thresholdInfo.entrancePhotoUrl || undefined,
                idRequired: item.thresholdInfo.idRequired,
                queueStatus: item.thresholdInfo.queueStatus.toLowerCase() as any
            },
            capacityLevel: item.liveStatus.capacity.toLowerCase() as any
        }));

        if (filters.q) {
            const fuse = new Fuse(mergedData, {
                keys: ['name', 'tags', 'description', 'category'],
                threshold: 0.3,
                ignoreLocation: true
            });
            mergedData = fuse.search(filters.q).map(result => result.item as any);
        }

        const data = mergedData.filter((item: any) => {
            const matchesArea = filters.area === 'All' || item.area === filters.area;
            const matchesCategory = filters.category === 'all' || item.category === filters.category;
            const status = checkStatus(item.schedule);
            const matchesOpenNow = !filters.openNow || status.isOpen;
            const matchesVerified = !filters.verified || (item.trustScore && item.trustScore > 90);

            // Special keyword filtering (e.g., 'no_referral')
            let matchesKeyword = true;
            if (filters.q.toLowerCase().includes('no_referral')) {
                matchesKeyword = item.description?.toLowerCase().includes('no referral') || item.tags?.includes('no_referral');
            }

            let matchesNearMe = true;
            if (filters.nearMe && userLocation) {
                const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
                matchesNearMe = dist < 2;
            }
            return matchesArea && matchesCategory && matchesOpenNow && matchesVerified && matchesNearMe && matchesKeyword;
        });

        return data.sort((a, b) => {
            // Prioritise Open resources
            const statusA = checkStatus(a.schedule);
            const statusB = checkStatus(b.schedule);
            if (statusA.isOpen && !statusB.isOpen) return -1;
            if (!statusA.isOpen && statusB.isOpen) return 1;

            // Then prioritise by trustScore
            return (b.trustScore || 0) - (a.trustScore || 0);
        });
    }, [dynamicData, filters, userLocation]);
};
