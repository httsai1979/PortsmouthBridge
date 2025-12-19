import Icon from './Icon';

const PulseMap = () => {
    return (
        <div className="p-6 bg-slate-900 text-white rounded-[32px] overflow-hidden relative shadow-2xl animate-fade-in mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-black tracking-tight">Portsmouth Pulse</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live Community Needs Map</p>
                </div>
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
                    <Icon name="zap" size={16} />
                </div>
            </div>

            <div className="aspect-[16/9] bg-slate-800 rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-700">
                {/* Simulated Heatmap Blobs */}
                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-rose-500/20 rounded-full blur-3xl"></div>

                <div className="text-center z-10 px-6">
                    <Icon name="eye" size={32} className="mx-auto mb-3 text-slate-500" />
                    <p className="text-sm font-bold text-slate-300">Aggregated Community Insight</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[240px]">This visualization shows real-time resource demand trends while keeping all individual users anonymous. (GDPR Compliant)</p>
                </div>

                {/* Simulated Labels */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black uppercase text-slate-400 border border-slate-700">Fratton: High Food Demand</div>
                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black uppercase text-slate-400 border border-slate-700">Southsea: Multiple Shelter Reports</div>
            </div>

            <div className="mt-6 flex gap-4">
                <div className="flex-1 text-center">
                    <span className="block text-xl font-black text-emerald-400">84%</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hubs Operational</span>
                </div>
                <div className="flex-1 text-center border-x border-slate-800">
                    <span className="block text-xl font-black text-indigo-400">12</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Volunteers Active</span>
                </div>
                <div className="flex-1 text-center">
                    <span className="block text-xl font-black text-rose-400">Low</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Wait times</span>
                </div>
            </div>
        </div>
    );
};

export default PulseMap;
