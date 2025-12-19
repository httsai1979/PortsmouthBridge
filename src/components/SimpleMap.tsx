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
    savedIds: string[];
    onToggleSave: (id: string) => void;
}

// Utility to create a custom marker icon
const createCustomIcon = (item: Resource, isSelected: boolean) => {
    const status = checkStatus(item.schedule);
    // High-contrast vibrant colors for standard categories
    const categoryColors: Record<string, string> = {
        food: '#059669', // Emerald 600
        shelter: '#4f46e5', // Indigo 600
        warmth: '#ea580c', // Orange 600
        support: '#2563eb', // Blue 600
        family: '#db2777', // Pink 600
        charity: '#e11d48'  // Rose 600
    };
    const color = categoryColors[item.category] || '#475569';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative group">
                <!-- Phase 10: Tactical Status Dot on Map -->
                ${status.status === 'open' ? `
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white z-50 animate-pulse shadow-lg"></div>
                ` : status.status === 'closing' ? `
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white z-50 shadow-lg"></div>
                ` : ''}
                
                <!-- Drop Shadow & Glow -->
                <div class="absolute inset-0 bg-black/20 blur-md rounded-full translate-y-1"></div>
                <div class="w-10 h-10 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center transition-all ${isSelected ? 'scale-125 z-50 ring-4 ring-indigo-500/40 translate-y-[-4px]' : 'hover:scale-110'}" style="background-color: ${color}">
                    <div class="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </div>
                </div>
                <!-- Droplet stem -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100 z-[-1] rounded-sm"></div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 z-[0]" style="background-color: ${color}"></div>
            </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
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

const SimpleMap = ({ data, category, statusFilter, savedIds, onToggleSave }: SimpleMapProps) => {
    const [selectedItem, setSelectedItem] = useState<Resource | null>(null);
    const [localCategory, setLocalCategory] = useState<string>(category);
    const [locateTrigger, setLocateTrigger] = useState(0);
    const [showHours, setShowHours] = useState(false);

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
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {filteredPoints.map(item => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={createCustomIcon(item, selectedItem?.id === item.id)}
                        eventHandlers={{
                            click: () => {
                                setSelectedItem(item);
                                setShowHours(false);
                            },
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
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                    {selectedItem.category} • {selectedItem.area}
                                </span>
                                {selectedItem.trustScore && selectedItem.trustScore > 90 && (
                                    <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                                        <Icon name="check_circle" size={8} /> Verified
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{selectedItem.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <Icon name="mapPin" size={12} /> {selectedItem.address}
                            </div>
                        </div>
                    </div>

                    {showHours && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in-up">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Icon name="clock" size={14} className="text-indigo-600" /> Opening Schedule
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(selectedItem.schedule).map(([day, hours]) => (
                                    <div key={day} className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 capitalize">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Number(day)]}</span>
                                        <span className={hours === 'Closed' ? 'text-rose-500' : 'text-slate-700'}>{hours}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[10px] text-slate-400 italic font-medium leading-relaxed">
                                {selectedItem.description}
                            </p>
                        </div>
                    )}

                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={() => onToggleSave(selectedItem.id)}
                            className={`p-4 rounded-2xl transition-all shadow-lg active:scale-90 ${savedIds.includes(selectedItem.id) ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-100 text-slate-400'}`}
                            title={savedIds.includes(selectedItem.id) ? "Unpin from Journey" : "Pin to Journey"}
                        >
                            <Icon name="star" size={20} />
                        </button>
                        <button
                            onClick={() => setShowHours(!showHours)}
                            className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${showHours ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                            title="View Hours & Details"
                        >
                            <Icon name="info" size={20} />
                        </button>
                        {selectedItem.phone && (
                            <a
                                href={`tel:${selectedItem.phone}`}
                                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95 shadow-emerald-100"
                            >
                                <Icon name="phone" size={14} /> Call
                            </a>
                        )}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                            title="Navigation"
                        >
                            <Icon name="navigation" size={18} />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleMap;
