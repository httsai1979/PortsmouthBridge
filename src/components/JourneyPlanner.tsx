import { useMemo } from 'react';
import Icon from './Icon';
import { getDistance } from '../utils';
import type { Resource } from '../data';

interface JourneyPlannerProps {
    items: Resource[];
    userLocation: { lat: number; lng: number } | null;
    onRemove: (id: string) => void;
    onClear: () => void;
}

const JourneyPlanner = ({ items, userLocation, onRemove, onClear }: JourneyPlannerProps) => {
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

    const startRealNavigation = () => {
        if (optimizedRoute.length === 0) return;

        const lastStop = optimizedRoute[optimizedRoute.length - 1];
        const waypoints = optimizedRoute.slice(0, -1).map(r => `${r.lat},${r.lng}`).join('|');

        // Deep Link: Current Location -> Optimized Waypoints -> Final Destination
        const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lastStop.lat},${lastStop.lng}&waypoints=${waypoints}&travelmode=walking`;

        window.open(url, '_blank');
    };

    if (items.length === 0) {
        return (
            <div className="p-12 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 animate-fade-in-up">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="mapPin" size={32} className="text-slate-300" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">Build Your Journey</h4>
                <p className="text-xs text-slate-400 font-medium mb-8">Add resources from the map or list to create a one-stop support path.</p>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest inline-block">
                    Optimized Routing Included
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col border border-slate-100">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Optimized Path</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Ready for Real-World Navigation</p>
                        </div>
                        <button
                            onClick={onClear}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                        >
                            <Icon name="trash" size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Icon name="list" size={16} className="text-indigo-400 mb-2" />
                            <p className="text-xl font-black leading-none">{optimizedRoute.length}</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Stops</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Icon name="map" size={16} className="text-emerald-400 mb-2" />
                            <p className="text-xl font-black leading-none">{totalDistance.toFixed(1)}k</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Range</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Icon name="clock" size={16} className="text-amber-400 mb-2" />
                            <p className="text-xl font-black leading-none">~{estimatedTime}m</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Style Stop List */}
            <div className="p-8 flex-1 overflow-y-auto max-h-[400px]">
                <div className="space-y-0 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-slate-50"></div>

                    {optimizedRoute.map((item, index) => (
                        <div key={item.id} className="relative pl-12 pb-10 last:pb-0">
                            {/* Dot */}
                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-lg z-10 ${index === 0 ? 'bg-emerald-500 text-white' :
                                index === optimizedRoute.length - 1 ? 'bg-indigo-600 text-white' :
                                    'bg-slate-900 text-white'
                                }`}>
                                {index + 1}
                            </div>

                            <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                <div className="min-w-0 flex-1">
                                    <h5 className="text-sm font-black text-slate-900 truncate leading-tight uppercase tracking-tight">{item.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.area}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{item.category}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                    <Icon name="x" size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button
                    onClick={startRealNavigation}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                >
                    <Icon name="navigation" size={20} />
                    Start Real Navigation
                </button>
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                    Opens Google Maps with Walking Directions
                </p>
            </div>
        </div>
    );
};

export default JourneyPlanner;
