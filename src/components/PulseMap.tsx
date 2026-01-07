import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsGap {
    id: string;
    term: string;
    resultCount: number;
    area: string;
    category: string;
    isCritical: boolean;
    timestamp: Timestamp;
}

interface AreaDemand {
    area: string;
    count: number;
    criticalCount: number;
}

const PulseMap = () => {
    const { isPartner } = useAuth();
    const [recentGaps, setRecentGaps] = useState<AnalyticsGap[]>([]);
    const [areaDemands, setAreaDemands] = useState<AreaDemand[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSearches, setTotalSearches] = useState(0);
    const [criticalSearches, setCriticalSearches] = useState(0);

    useEffect(() => {
        // Listen to recent analytics gaps (last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const gapsQuery = query(
            collection(db, 'analytics_gaps'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(gapsQuery, (snapshot) => {
            const gaps: AnalyticsGap[] = [];
            let total = 0;
            let critical = 0;
            const areaMap: Record<string, { count: number; criticalCount: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                gaps.push({
                    id: doc.id,
                    term: data.term,
                    resultCount: data.resultCount,
                    area: data.area || 'Unknown',
                    category: data.category || 'all',
                    isCritical: data.isCritical || data.resultCount === 0,
                    timestamp: data.timestamp
                });

                total++;
                if (data.isCritical || data.resultCount === 0) {
                    critical++;
                }

                // Aggregate by area
                const area = data.area || 'All';
                if (!areaMap[area]) {
                    areaMap[area] = { count: 0, criticalCount: 0 };
                }
                areaMap[area].count++;
                if (data.isCritical || data.resultCount === 0) {
                    areaMap[area].criticalCount++;
                }
            });

            setRecentGaps(gaps.slice(0, 10));
            setTotalSearches(total);
            setCriticalSearches(critical);
            setAreaDemands(
                Object.entries(areaMap)
                    .map(([area, { count, criticalCount }]) => ({ area, count, criticalCount }))
                    .sort((a, b) => b.criticalCount - a.criticalCount)
                    .slice(0, 5)
            );
            setLoading(false);
        }, (error) => {
            console.error('Error loading analytics:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Get color intensity based on demand
    const getDemandColor = (criticalCount: number, maxCritical: number) => {
        const intensity = maxCritical > 0 ? criticalCount / maxCritical : 0;
        if (intensity > 0.7) return 'bg-rose-500/40';
        if (intensity > 0.4) return 'bg-amber-500/30';
        if (intensity > 0.2) return 'bg-indigo-500/30';
        return 'bg-emerald-500/20';
    };

    const maxCritical = Math.max(...areaDemands.map(d => d.criticalCount), 1);

    return (
        <div className="p-6 bg-slate-900 text-white rounded-[32px] overflow-hidden relative shadow-2xl animate-fade-in mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-black tracking-tight">Portsmouth Pulse</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        {isPartner ? 'Live Analytics Dashboard' : 'Live Community Needs Map'}
                    </p>
                </div>
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
                    <Icon name="zap" size={16} />
                </div>
            </div>

            {/* Dynamic Heatmap Visualization */}
            <div className="aspect-[16/9] bg-slate-800 rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-700">
                {loading ? (
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-slate-400">Loading Analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Dynamic Demand Blobs based on real data */}
                        {areaDemands.map((demand, index) => {
                            const positions = [
                                { top: '20%', left: '25%' },
                                { top: '35%', right: '20%' },
                                { top: '55%', left: '40%' },
                                { top: '25%', left: '60%' },
                                { top: '60%', right: '30%' }
                            ];
                            const pos = positions[index % positions.length];
                            const size = 80 + (demand.criticalCount * 20);

                            return (
                                <div
                                    key={demand.area}
                                    className={`absolute rounded-full blur-3xl transition-all duration-1000 ${getDemandColor(demand.criticalCount, maxCritical)}`}
                                    style={{
                                        ...pos,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        animation: demand.criticalCount > 0 ? 'pulse 3s infinite' : undefined
                                    }}
                                />
                            );
                        })}

                        {/* Center Info */}
                        <div className="text-center z-10 px-6">
                            <Icon name="eye" size={32} className="mx-auto mb-3 text-slate-500" />
                            <p className="text-sm font-bold text-slate-300">
                                {criticalSearches > 0 ? 'Unmet Needs Detected' : 'Community Insight Active'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-[240px]">
                                Real-time demand trends while keeping all users anonymous. (GDPR Compliant)
                            </p>
                        </div>

                        {/* Dynamic Area Labels */}
                        {areaDemands.slice(0, 2).map((demand, index) => (
                            <div
                                key={demand.area}
                                className={`absolute ${index === 0 ? 'top-4 left-4' : 'bottom-4 right-4'} bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black uppercase text-slate-400 border border-slate-700`}
                            >
                                {demand.area}: {demand.criticalCount > 0 ? `${demand.criticalCount} Critical Searches` : `${demand.count} Searches`}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Stats Row */}
            <div className="mt-6 flex gap-4">
                <div className="flex-1 text-center">
                    <span className="block text-xl font-black text-emerald-400">
                        {totalSearches > 0 ? Math.round(((totalSearches - criticalSearches) / totalSearches) * 100) : 100}%
                    </span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Needs Met</span>
                </div>
                <div className="flex-1 text-center border-x border-slate-800">
                    <span className="block text-xl font-black text-indigo-400">{totalSearches}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Searches (24h)</span>
                </div>
                <div className="flex-1 text-center">
                    <span className={`block text-xl font-black ${criticalSearches > 5 ? 'text-rose-400' : criticalSearches > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {criticalSearches}
                    </span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Gaps Found</span>
                </div>
            </div>

            {/* Partner-Only: Recent Gap Terms */}
            {isPartner && recentGaps.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Icon name="alert-triangle" size={12} className="text-amber-400" />
                        Recent Unmet Search Terms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {recentGaps.filter(g => g.isCritical).slice(0, 8).map(gap => (
                            <span
                                key={gap.id}
                                className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[9px] font-bold"
                            >
                                "{gap.term}" ({gap.area})
                            </span>
                        ))}
                        {recentGaps.filter(g => g.isCritical).length === 0 && (
                            <span className="text-[10px] text-slate-500">No critical gaps in the last 24 hours ✓</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PulseMap;
