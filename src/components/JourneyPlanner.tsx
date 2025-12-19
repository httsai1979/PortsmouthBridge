import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import Icon from './Icon';
import { getDistance } from '../utils';
import type { Resource } from '../data';

interface JourneyPlannerProps {
    items: Resource[];
    userLocation: { lat: number; lng: number } | null;
    onRemove: (id: string) => void;
    onClear: () => void;
    onNavigate: () => void;
}

// Map controller to fit bounds
const MapController = ({ items }: { items: Resource[] }) => {
    const map = useMap();

    useMemo(() => {
        if (items.length > 0) {
            const bounds = L.latLngBounds(items.map(item => [item.lat, item.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [items, map]);

    return null;
};

const JourneyPlanner = ({ items, userLocation, onRemove, onClear, onNavigate }: JourneyPlannerProps) => {
    const [selectedStop, setSelectedStop] = useState<string | null>(null);

    // Optimize route using nearest-neighbor algorithm
    const optimizedRoute = useMemo(() => {
        if (items.length === 0 || !userLocation) return items;

        const unvisited = [...items];
        const route: Resource[] = [];
        let current = userLocation;

        while (unvisited.length > 0) {
            let nearestIndex = 0;
            let nearestDist = Infinity;

            unvisited.forEach((item, index) => {
                const dist = getDistance(current.lat, current.lng, item.lat, item.lng);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIndex = index;
                }
            });

            const nearest = unvisited[nearestIndex];
            route.push(nearest);
            unvisited.splice(nearestIndex, 1);
            current = { lat: nearest.lat, lng: nearest.lng };
        }

        return route;
    }, [items, userLocation]);

    const totalDistance = useMemo(() => {
        if (!userLocation || optimizedRoute.length === 0) return 0;

        let total = 0;
        let prev = userLocation;

        optimizedRoute.forEach(item => {
            total += getDistance(prev.lat, prev.lng, item.lat, item.lng);
            prev = { lat: item.lat, lng: item.lng };
        });

        return total;
    }, [optimizedRoute, userLocation]);

    const estimatedTime = useMemo(() => {
        const walkingTime = (totalDistance / 5) * 60;
        const stopTime = optimizedRoute.length * 10;
        return Math.round(walkingTime + stopTime);
    }, [totalDistance, optimizedRoute.length]);

    // Create custom numbered markers
    const createNumberedIcon = (number: number, isSelected: boolean) => {
        return L.divIcon({
            html: `
                <div class="relative">
                    <div class="${isSelected ? 'w-12 h-12' : 'w-10 h-10'} rounded-full ${isSelected ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-indigo-500'} shadow-2xl flex items-center justify-center transition-all duration-300 animate-bounce">
                        <span class="text-white font-black text-lg">${number}</span>
                    </div>
                </div>
            `,
            className: '',
            iconSize: isSelected ? [48, 48] : [40, 40],
            iconAnchor: isSelected ? [24, 24] : [20, 20]
        });
    };

    // Create route polyline
    const routeCoordinates: [number, number][] = optimizedRoute.map(item => [item.lat, item.lng]);

    if (items.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                <Icon name="mapPin" size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No stops added yet</p>
                <p className="text-xs text-slate-400 mt-2">Add resources from the directory</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-t-[32px] shadow-2xl overflow-hidden h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black">Your Optimized Journey</h3>
                        <button
                            onClick={onClear}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                            title="Clear all"
                        >
                            <Icon name="trash" size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <Icon name="mapPin" size={16} />
                            <span>{optimizedRoute.length} stops</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="navigation" size={16} />
                            <span>{totalDistance.toFixed(1)}km</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="clock" size={16} />
                            <span>~{estimatedTime}min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map View */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[optimizedRoute[0].lat, optimizedRoute[0].lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController items={optimizedRoute} />

                    {/* Route Line */}
                    {routeCoordinates.length > 1 && (
                        <Polyline
                            positions={routeCoordinates}
                            pathOptions={{
                                color: '#4f46e5',
                                weight: 4,
                                opacity: 0.7,
                                dashArray: '10, 10'
                            }}
                        />
                    )}

                    {/* Markers with numbers */}
                    {optimizedRoute.map((item, index) => (
                        <Marker
                            key={item.id}
                            position={[item.lat, item.lng]}
                            icon={createNumberedIcon(index + 1, selectedStop === item.id)}
                            eventHandlers={{
                                click: () => setSelectedStop(item.id)
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-sm">Stop {index + 1}</h4>
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="text-rose-500 hover:text-rose-700"
                                        >
                                            <Icon name="x" size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 mb-1">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.area} • {item.type}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Bottom Stop List */}
            <div className="bg-white border-t-2 border-slate-100 p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                    {optimizedRoute.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedStop(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selectedStop === item.id
                                    ? 'bg-indigo-50 border-indigo-300'
                                    : 'bg-white border-slate-100 hover:border-indigo-200'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedStop === item.id ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}>
                                <span className={`text-sm font-black ${selectedStop === item.id ? 'text-white' : 'text-slate-600'
                                    }`}>{index + 1}</span>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400 font-bold">{item.area} • {item.type}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.id);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <Icon name="x" size={14} />
                            </button>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigate Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={onNavigate}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
                >
                    <Icon name="navigation" size={20} />
                    Start Navigation in Google Maps
                </button>
            </div>
        </div>
    );
};

export default JourneyPlanner;
