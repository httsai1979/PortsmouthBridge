import { useState } from 'react';
import Icon from './Icon';
import type { ConnectResult, Recommendation } from '../services/ConnectLogic';

interface ConnectDashboardProps {
    result: ConnectResult;
    onReset: () => void;
    onClose: () => void;
}

const ConnectDashboard = ({ result, onReset, onClose }: ConnectDashboardProps) => {
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

    return (
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col border border-slate-100 max-h-[90vh] relative">
            {/* Recommendation Detail Modal (Internal) */}
            {selectedRec && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col animate-fade-in">
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setSelectedRec(null)} className="p-2 bg-white/10 rounded-full">
                                <Icon name="chevron-left" size={20} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Next Steps Guide</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">{selectedRec.title}</h3>
                        <p className="text-xs text-white/60 font-medium">Provided by {selectedRec.authority}</p>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 space-y-8">
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Why this matters</h4>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-3xl border border-slate-100 italic">
                                "{selectedRec.longDesc}"
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Action Checklist</h4>
                            <div className="space-y-3">
                                {selectedRec.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl items-start">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {selectedRec.link && (
                            <a
                                href={selectedRec.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full py-5 bg-indigo-600 text-white rounded-[24px] text-center text-xs font-black uppercase tracking-[0.1em] shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                            >
                                Start Online Application
                            </a>
                        )}

                        <button
                            onClick={() => setSelectedRec(null)}
                            className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Main Header */}
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter">Your Connect Strategy</h2>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Personalised Portsmouth Plan</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/5"
                                title="Print Strategy"
                            >
                                <Icon name="printer" size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/5">
                                <Icon name="x" size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Monthly Gap</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-rose-400">£{Math.round(result.monthlyShortfall)}</span>
                                <span className="text-[10px] text-white/40">/mo</span>
                            </div>
                        </div>
                        <div className="bg-indigo-600/20 p-5 rounded-3xl border border-indigo-400/30 backdrop-blur-md">
                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Potential Value</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-emerald-400">+£{Math.round(result.unclaimedValue)}</span>
                                <span className="text-[10px] text-emerald-400/50">/mo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1">
                {/* Critical Alerts */}
                {result.alerts.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Knowledge Alerts</h4>
                        {result.alerts.map((alert, i) => (
                            <div key={i} className={`p-5 rounded-3xl border-2 flex flex-col gap-3 relative overflow-hidden group transition-all ${alert.type === 'warning' ? 'bg-rose-50 border-rose-100 shadow-lg shadow-rose-100/50' : 'bg-orange-50 border-orange-100'}`}>
                                {alert.type === 'warning' && (
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Icon name="alert-circle" size={80} />
                                    </div>
                                )}
                                <div className="flex gap-4 items-center relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${alert.type === 'warning' ? 'bg-rose-500 text-white animate-pulse' : 'bg-orange-500 text-white'}`}>
                                        <Icon name={alert.type === 'warning' ? 'alert-octagon' : 'zap'} size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h5 className={`font-black text-sm ${alert.type === 'warning' ? 'text-rose-900' : 'text-slate-900'}`}>{alert.title}</h5>
                                        <p className={`text-[11px] font-bold leading-tight ${alert.type === 'warning' ? 'text-rose-700/80' : 'text-slate-600'}`}>{alert.message}</p>
                                    </div>
                                </div>
                                {alert.detailedInfo && (
                                    <div className={`p-4 rounded-2xl text-[10px] font-medium leading-relaxed border relative z-10 ${alert.type === 'warning' ? 'bg-white/60 border-rose-200 text-rose-800' : 'bg-white/50 border-slate-100/50 text-slate-500'}`}>
                                        {alert.detailedInfo}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Action Strategy</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {result.recommendations.map((rec) => (
                            <div key={rec.id} className="p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100 hover:border-indigo-200 transition-all group shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${rec.priority === 'high' ? 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-100' : 'bg-indigo-100 text-indigo-600 shadow-sm shadow-indigo-100'}`}>
                                        {rec.priority} priority
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{rec.authority}</span>
                                </div>
                                <h5 className="text-xl font-black text-slate-900 mb-1 leading-tight tracking-tight">{rec.title}</h5>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{rec.desc}</p>

                                <button
                                    onClick={() => setSelectedRec(rec)}
                                    className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 group-hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Get Application Guide <Icon name="chevron-right" size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <button
                        onClick={onReset}
                        className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                    >
                        Reset Calculator
                    </button>
                    <p className="text-[8px] text-center text-slate-300 font-bold uppercase mt-2">Data is processed locally & not stored on any server.</p>
                </div>
            </div>
        </div>
    );
};

export default ConnectDashboard;
