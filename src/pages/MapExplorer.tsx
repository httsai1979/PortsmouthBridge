import { Suspense, lazy, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useFilteredData } from '../hooks/useFilteredData';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const SimpleMap = lazy(() => import('../components/SimpleMap'));

const MapExplorer = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isPartner } = useAuth();
    const { data } = useData();
    const { savedIds, stealthMode, toggleSavedId, userLocation, setReportTarget } = useAppStore();

    // Derived Status Mapping (consistent with AnimatedRoutes)
    const liveStatus = useMemo(() => {
        const statuses: Record<string, any> = {};
        data.forEach(item => {
            statuses[item.id] = {
                id: item.id,
                status: item.liveStatus.isOpen ? 'Open' : 'Closed',
                urgency: item.liveStatus.capacity === 'Full' ? 'High' : 'Normal',
                lastUpdated: item.liveStatus.lastUpdated
            };
        });
        return statuses;
    }, [data]);

    const category = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    const statusFilter = searchParams.get('status') || 'all';

    const filteredData = useFilteredData(data, {
        category,
        q,
        area: 'All',
        openNow: statusFilter === 'open',
        verified: false,
        nearMe: false
    }, userLocation);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const label = searchParams.get('label');

    const mapFocus = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), label: label || '' } : null;

    return (
        <div className="animate-fade-in-up pb-20">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Explorer</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual navigation</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.set('status', 'open');
                                setSearchParams(newParams);
                            }}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${statusFilter === 'open' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('status');
                                setSearchParams(newParams);
                            }}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${statusFilter !== 'open' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center py-20 min-h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            }>
                <SimpleMap
                    data={filteredData as any}
                    category={category}
                    statusFilter={statusFilter as any}
                    savedIds={savedIds}
                    onToggleSave={toggleSavedId}
                    stealthMode={stealthMode}
                    externalFocus={mapFocus}
                    liveStatus={liveStatus}
                    isPartner={isPartner}
                    onReport={setReportTarget}
                    onCategoryChange={(cat: string) => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('category', cat);
                        newParams.delete('q');
                        setSearchParams(newParams);
                    }}
                />
            </Suspense>
        </div>
    );
};

export default MapExplorer;
