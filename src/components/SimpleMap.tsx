import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import Icon from './Icon';
import { checkStatus, getTagConfig } from '../utils';
import { TAG_ICONS } from '../data';
import type { Resource } from '../data';
import type { LiveStatus } from '../services/LiveStatusService';

// Portsmouth Coordinates
const PORTSMOUTH_CENTER: [number, number] = [50.805, -1.07];

// Custom Marker Icon Logic
const createCustomIcon = (item: Resource, isSelected: boolean, stealthMode?: boolean, isSaved?: boolean) => {
    const status = checkStatus(item.schedule);

    if (stealthMode) {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="relative group">
                    <div class="w-6 h-6 rounded-full border-2 border-white bg-slate-400 shadow-sm flex items-center justify-center ${isSelected ? 'scale-110 ring-2 ring-slate-300' : ''}">
                         <div class="w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>
                    </div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    }

    const config = TAG_ICONS[item.category] || TAG_ICONS.default;
    const color = config.hex;

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative group">
                ${status.status === 'open' ? `
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white z-50 animate-pulse shadow-lg"></div>
                ` : status.status === 'closing' ? `
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white z-50 shadow-lg"></div>
                ` : ''}
                
                ${isSaved ? `
                    <div class="absolute -top-2 -left-2 w-5 h-5 bg-amber-400 rounded-full border-2 border-white z-50 shadow-md flex items-center justify-center text-white">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                ` : ''}

                <div class="absolute inset-0 bg-black/20 blur-md rounded-full translate-y-1"></div>
                <div class="w-10 h-10 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center transition-all ${isSelected ? 'scale-125 z-50 ring-4 ring-indigo-500/40 translate-y-[-4px]' : 'hover:scale-110'} ${isSaved ? 'ring-2 ring-amber-400' : ''}" style="background-color: ${color}">
                    <div class="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 8v8M8 12h8" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100 z-[-1] rounded-sm"></div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 z-[0]" style="background-color: ${color}"></div>
            </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
    });
};

// Map Controller
const MapController = ({ selectedPos, locateTrigger, externalPos, data }: { selectedPos: [number, number] | null, locateTrigger: number, externalPos?: [number, number] | null, data: Resource[] }) => {
    const map = useMap();

    useEffect(() => {
        if (data.length > 0) {
            const bounds = L.latLngBounds(data.map(item => [item.lat, item.lng]));
            if (bounds.isValid()) {
                map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
            }
        }
    }, [data, map]);

    useEffect(() => {
        if (selectedPos) map.flyTo(selectedPos, 16, { animate: true });
    }, [selectedPos, map]);

    useEffect(() => {
        if (externalPos) map.flyTo(externalPos, 18, { animate: true });
    }, [externalPos, map]);

    useEffect(() => {
        if (locateTrigger > 0) map.locate({ setView: true, maxZoom: 16 });
    }, [locateTrigger, map]);

    return null;
};

interface SimpleMapProps {
    data: Resource[];
    category: string;
    statusFilter: string;
    savedIds: string[];
    onToggleSave: (id: string) => void;
    stealthMode?: boolean;
    externalFocus?: { lat: number; lng: number; label?: string; id?: string } | null;
    onCategoryChange: (category: string) => void;
    liveStatus?: Record<string, LiveStatus>;
    // [新增] 接收回報功能
    isPartner?: boolean;
    onReport?: (item: Resource) => void;
}

const SimpleMap = ({ 
    data, 
    category, 
    statusFilter, 
    savedIds, 
    onToggleSave, 
    stealthMode, 
    externalFocus, 
    onCategoryChange, 
    liveStatus,
    isPartner,
    onReport 
}: SimpleMapProps) => {
    const [selectedItem, setSelectedItem] = useState<Resource | null>(null);
    const [locateTrigger, setLocateTrigger] = useState(0);
    const [showHours, setShowHours] = useState(false);

    useEffect(() => {
        if (externalFocus?.id) {
            const item = data.find(i => i.id === externalFocus.id);
            if (item) {
                const timer = setTimeout(() => {
                    setSelectedItem(item);
                    setShowHours(true);
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [externalFocus, data]);

    const filteredPoints = useMemo(() => {
        return data.filter(item => {
            const status = checkStatus(item.schedule).status;
            return statusFilter === 'all' || (status === 'open' || status === 'closing');
        });
    }, [data, statusFilter]);

    const categories = [
        { id: 'all', label: 'All Needs', icon: 'search' },
        { id: 'food', label: 'Food', icon: 'utensils' },
        { id: 'shelter', label: 'Safe Sleep', icon: 'home' },
        { id: 'warmth', label: 'Warmth', icon: 'flame' },
        { id: 'support', label: 'Support', icon: 'lifebuoy' },
        { id: 'family', label: 'Family', icon: 'family' },
        { id: 'learning', label: 'Learning', icon: 'book-open' },
        { id: 'skills', label: 'Skills', icon: 'briefcase' },
    ];

    return (
        <div className="w-full h-[85vh] bg-slate-100 rounded-[32px] relative overflow-hidden shadow-2xl border-4 border-white">
            {/* Categories Floating Header */}
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-xl p-3 rounded-[24px] shadow-xl border border-white/50 overflow-x-auto no-scrollbar">
                <div className="flex justify-between gap-2 min-w-max">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all ${category === cat.id
                                ? 'bg-slate-900 text-white scale-100 shadow-lg'
                                : 'text-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            <Icon name={cat.icon} size={16} />
                            <span className="text-[9px] font-black uppercase tracking-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <MapContainer
                center={PORTSMOUTH_CENTER}
                zoom={14}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filteredPoints.map(item => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={createCustomIcon(item, selectedItem?.id === item.id, stealthMode, savedIds.includes(item.id))}
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
                    externalPos={externalFocus ? [externalFocus.lat, externalFocus.lng] : null}
                    locateTrigger={locateTrigger}
                    data={filteredPoints}
                />
            </MapContainer>

            {/* Locate Me FAB */}
            <button
                onClick={() => setLocateTrigger(prev => prev + 1)}
                className="absolute top-28 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl text-indigo-600 hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center active:scale-90"
            >
                <Icon name="mapPin" size={24} />
            </button>

            {/* Popup Card */}
            {selectedItem && (
                <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-fade-in-up border-t border-slate-100">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                    
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-6 right-6 text-slate-300 hover:text-slate-500"
                    >
                        <Icon name="x" size={24} />
                    </button>

                    {/* Live Status Banner */}
                    {liveStatus?.[selectedItem.id] && (
                        <div className={`mb-4 p-3 rounded-2xl border flex gap-3 items-center animate-pulse ${liveStatus[selectedItem.id].urgency === 'High' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${liveStatus[selectedItem.id].urgency === 'High' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <p className={`text-xs font-black uppercase tracking-wide ${liveStatus[selectedItem.id].urgency === 'High' ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {liveStatus[selectedItem.id].message}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stealthMode ? 'bg-slate-100 text-slate-400' : getTagConfig(selectedItem.category, TAG_ICONS).bg}`}>
                            <Icon name={stealthMode ? 'mapPin' : getTagConfig(selectedItem.category, TAG_ICONS).icon} size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {selectedItem.area} • {selectedItem.type}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedItem.name}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{selectedItem.address}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                        <button onClick={() => onToggleSave(selectedItem.id)} className={`p-4 rounded-2xl transition-all ${savedIds.includes(selectedItem.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Icon name="star" size={20} className={savedIds.includes(selectedItem.id) ? "fill-current" : ""} />
                        </button>
                        
                        <button onClick={() => setShowHours(!showHours)} className={`p-4 rounded-2xl transition-all ${showHours ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Icon name="info" size={20} />
                        </button>

                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                            <Icon name="navigation" size={16} /> Navigate
                        </a>

                        {/* [關鍵] 新增回報按鈕於地圖卡片 */}
                        {onReport && (
                            <button 
                                onClick={() => onReport(selectedItem)}
                                className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                title={isPartner ? "Update Status" : "Report Issue"}
                            >
                                <Icon name="alert" size={20} />
                            </button>
                        )}
                    </div>

                    {showHours && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(selectedItem.schedule).map(([day, hours]) => (
                                    <div key={day} className="flex justify-between text-[10px]">
                                        <span className="font-bold text-slate-400">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number(day)]}</span>
                                        <span className={`font-black ${hours==='Closed'?'text-rose-400':'text-slate-700'}`}>{hours}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimpleMap;