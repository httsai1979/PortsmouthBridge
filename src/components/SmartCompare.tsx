import Icon from './Icon';
import { checkStatus, getTagConfig, getDistance } from '../utils';
import { TAG_ICONS } from '../data';
import type { Resource } from '../data';

interface SmartCompareProps {
    items: Resource[];
    userLocation: { lat: number; lng: number } | null;
    onRemove: (id: string) => void;
    onNavigate: (id: string) => void;
    onCall: (phone: string) => void;
}

const SmartCompare = ({ items, userLocation, onRemove, onNavigate, onCall }: SmartCompareProps) => {
    if (items.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                <Icon name="shield" size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No resources to compare</p>
                <p className="text-xs text-slate-400 mt-2">Add up to 3 resources for side-by-side comparison</p>
            </div>
        );
    }

    // Calculate metrics for each item
    const itemsWithMetrics = items.map(item => {
        const status = checkStatus(item.schedule);
        const distance = userLocation
            ? getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
            : null;
        const trustScore = item.trustScore || 0;

        return {
            ...item,
            status,
            distance,
            trustScore,
            isOpen: status.status === 'open',
            isClosingSoon: status.status === 'closing'
        };
    });

    // Find best in each category
    const bestDistance = itemsWithMetrics.reduce((best, item) =>
        item.distance !== null && (best === null || item.distance < best) ? item.distance : best, null as number | null
    );
    const bestTrust = Math.max(...itemsWithMetrics.map(i => i.trustScore));

    return (
        <div className="bg-white rounded-[32px] shadow-2xl border-2 border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-black mb-2">Smart Compare</h3>
                <p className="text-sm font-bold opacity-90">Side-by-side resource comparison</p>
            </div>

            {/* Comparison Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itemsWithMetrics.map(item => {
                        const config = getTagConfig(item.category, TAG_ICONS);
                        const isBestDistance = item.distance === bestDistance && bestDistance !== null;
                        const isBestTrust = item.trustScore === bestTrust && bestTrust > 0;

                        return (
                            <div
                                key={item.id}
                                className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border-2 border-slate-100 shadow-lg hover:shadow-2xl transition-all group"
                            >
                                {/* Winner Badges */}
                                <div className="absolute -top-3 -right-3 flex flex-col gap-2 z-10">
                                    {isBestDistance && (
                                        <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                                            <Icon name="navigation" size={12} />
                                            CLOSEST
                                        </div>
                                    )}
                                    {isBestTrust && (
                                        <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                                            <Icon name="check_circle" size={12} />
                                            VERIFIED
                                        </div>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10"
                                >
                                    <Icon name="x" size={14} />
                                </button>

                                {/* Resource Header */}
                                <div className="flex items-start gap-4 mb-6 pt-2">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.bg} shrink-0 shadow-md`}>
                                        <Icon name={config.icon} size={28} className={config.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{item.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.area} • {item.type}</p>
                                    </div>
                                </div>

                                {/* Metrics Cards */}
                                <div className="space-y-3 mb-6">
                                    {/* Status Metric */}
                                    <div className={`p-4 rounded-2xl border-2 transition-all ${item.isOpen
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : item.isClosingSoon
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-slate-50 border-slate-200'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600">Status</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${item.isOpen ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-200' :
                                                        item.isClosingSoon ? 'bg-amber-500' : 'bg-slate-300'
                                                    }`}></div>
                                                <span className={`text-sm font-black ${item.isOpen ? 'text-emerald-700' :
                                                        item.isClosingSoon ? 'text-amber-700' : 'text-slate-500'
                                                    }`}>
                                                    {item.isOpen ? 'OPEN NOW' : item.isClosingSoon ? 'CLOSING SOON' : 'CLOSED'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Distance Metric */}
                                    {item.distance !== null && (
                                        <div className={`p-4 rounded-2xl border-2 ${isBestDistance
                                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                                                : 'bg-white border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600">Distance</span>
                                                <div className="flex items-center gap-2">
                                                    <Icon name="navigation" size={14} className={isBestDistance ? 'text-emerald-600' : 'text-slate-400'} />
                                                    <span className={`text-lg font-black ${isBestDistance ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                        {item.distance.toFixed(1)} km
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isBestDistance ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                                    style={{ width: `${Math.max(10, 100 - (item.distance * 20))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Trust Score Metric */}
                                    {item.trustScore > 0 && (
                                        <div className={`p-4 rounded-2xl border-2 ${isBestTrust
                                                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                                                : 'bg-white border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600">Trust Score</span>
                                                <div className="flex items-center gap-2">
                                                    {isBestTrust && <Icon name="check_circle" size={14} className="text-indigo-600" />}
                                                    <span className={`text-lg font-black ${isBestTrust ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                        {item.trustScore}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isBestTrust ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                                    style={{ width: `${item.trustScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    <div className="p-4 bg-white rounded-2xl border-2 border-slate-200">
                                        <span className="text-xs font-bold text-slate-600 block mb-3">Services</span>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags.slice(0, 4).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                                                >
                                                    {TAG_ICONS[tag]?.label || tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    {item.phone && (
                                        <button
                                            onClick={() => onCall(item.phone!)}
                                            className="bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                                        >
                                            <Icon name="phone" size={14} />
                                            Call
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onNavigate(item.id)}
                                        className={`bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 ${!item.phone ? 'col-span-2' : ''}`}
                                    >
                                        <Icon name="navigation" size={14} />
                                        Navigate
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Summary Footer */}
            <div className="bg-slate-50 border-t-2 border-slate-100 p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-black text-emerald-600">
                            {itemsWithMetrics.filter(i => i.isOpen).length}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Open Now</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-indigo-600">
                            {bestDistance ? `${bestDistance.toFixed(1)}km` : '-'}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Closest</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-amber-600">
                            {bestTrust}%
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Best Trust</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartCompare;
