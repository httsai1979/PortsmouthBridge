import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import Icon from './Icon';
import { checkStatus, getTagConfig } from '../utils';
import { TAG_ICONS } from '../data';
import type { Resource } from '../data';

// Portsmouth Coordinates
const PORTSMOUTH_CENTER: [number, number] = [50.805, -1.07];

interface SimpleMapProps {
    data: Resource[];
    category: string;
    statusFilter: string;
}

// Utility to create a custom marker icon
const createCustomIcon = (item: Resource, isSelected: boolean) => {
    const config = getTagConfig(item.category, TAG_ICONS);
    const color = config.bg.replace('100', '600').replace('50', '600').split(' ')[0];

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative group">
                <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${isSelected ? 'scale-125 z-50 ring-4 ring-indigo-500/30' : 'hover:scale-110'}" style="background-color: ${color}">
                    <div class="text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </div>
                </div>
                ${isSelected ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45 border-r border-b border-white"></div>' : ''}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
};

// Component to handle map center/zoom updates
const MapController = ({ selectedPos, locateTrigger }: { selectedPos: [number, number] | null, locateTrigger: number }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedPos) {
            map.setView(selectedPos, 16, { animate: true });
        }
    }, [selectedPos, map]);

    useEffect(() => {
        if (locateTrigger > 0) {
            map.locate({ setView: true, maxZoom: 16 });
        }
    }, [locateTrigger, map]);

    return null;
};

const SimpleMap = ({ data, category, statusFilter }: SimpleMapProps) => {
    const [selectedItem, setSelectedItem] = useState<Resource | null>(null);
    const [localCategory, setLocalCategory] = useState<string>(category);
    const [locateTrigger, setLocateTrigger] = useState(0);

    const filteredPoints = useMemo(() => {
        return data.filter(item => {
            const matchCat = localCategory === 'all' || item.category === localCategory;
            const status = checkStatus(item.schedule).status;
            const matchStatus = statusFilter === 'all' || (status === 'open' || status === 'closing');
            return matchCat && matchStatus;
        });
    }, [data, localCategory, statusFilter]);

    const categories = [
        { id: 'all', label: 'All', icon: 'search' },
        { id: 'food', label: 'Food', icon: 'utensils' },
        { id: 'shelter', label: 'Shelter', icon: 'bed' },
        { id: 'support', label: 'Health', icon: 'lifebuoy' },
    ];

    return (
        <div className="w-full h-[65vh] bg-slate-100 rounded-[32px] relative overflow-hidden shadow-2xl border-4 border-white">
            {/* Map Overlay Filter */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setLocalCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${localCategory === cat.id
                            ? 'bg-slate-900 text-white scale-105'
                            : 'bg-white/90 backdrop-blur text-slate-600 hover:bg-white'
                            }`}
                    >
                        <Icon name={cat.icon} size={12} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <MapContainer
                center={PORTSMOUTH_CENTER}
                zoom={14}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {filteredPoints.map(item => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={createCustomIcon(item, selectedItem?.id === item.id)}
                        eventHandlers={{
                            click: () => setSelectedItem(item),
                        }}
                    />
                ))}

                <MapController
                    selectedPos={selectedItem ? [selectedItem.lat, selectedItem.lng] : null}
                    locateTrigger={locateTrigger}
                />
            </MapContainer>

            {/* Locate Me Button */}
            <button
                onClick={() => setLocateTrigger(prev => prev + 1)}
                className="absolute top-20 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl text-indigo-600 hover:bg-slate-50 transition-all border border-slate-100"
                title="Locate Me"
            >
                <Icon name="mapPin" size={20} />
            </button>

            {selectedItem && (
                <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white rounded-3xl p-5 shadow-2xl animate-fade-in-up border border-slate-100">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        <Icon name="x" size={18} />
                    </button>

                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getTagConfig(selectedItem.category, TAG_ICONS).bg}`}>
                            <Icon name={getTagConfig(selectedItem.category, TAG_ICONS).icon} size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1 block">
                                {selectedItem.category} • {selectedItem.area}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{selectedItem.name}</h3>
                            <p className="text-sm font-medium text-slate-500 line-clamp-1">{selectedItem.address}</p>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <Icon name="navigation" size={14} /> Get Directions
                        </a>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleMap;
