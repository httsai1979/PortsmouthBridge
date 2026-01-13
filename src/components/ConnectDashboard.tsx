import Icon from './Icon';
import type { ConnectResult } from '../services/ConnectLogic';

interface ConnectDashboardProps {
    result: ConnectResult;
    onReset: () => void;
    onClose: () => void;
}

const ConnectDashboard = ({ result, onReset, onClose }: ConnectDashboardProps) => {
    return (
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col border border-slate-100 max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter">Your Connect Dashboard</h2>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Personalised Strategy</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
                            <Icon name="x" size={20} />
                        </button>
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
                            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Potential Value</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-emerald-400">+£{Math.round(result.unclaimedValue)}</span>
                                <span className="text-[10px] text-emerald-400/50">/mo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
                {/* Critical Alerts */}
                {result.alerts.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Critical Alerts</h4>
                        {result.alerts.map((alert, i) => (
                            <div key={i} className={`p-5 rounded-3xl border-2 flex gap-4 ${alert.type === 'warning' ? 'bg-rose-50 border-rose-100 flex-col sm:flex-row' : 'bg-orange-50 border-orange-100'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.type === 'warning' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    <Icon name={alert.type === 'warning' ? 'alert' : 'zap'} size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-black text-slate-900">{alert.title}</h5>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                                    {alert.actionLabel && (
                                        <button className={`mt-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${alert.type === 'warning' ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'}`}>
                                            {alert.actionLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Action Cards</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {result.recommendations.map((rec) => (
                            <div key={rec.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${rec.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {rec.priority} priority
                                    </span>
                                    {rec.link && <Icon name="external-link" size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />}
                                </div>
                                <h5 className="text-lg font-black text-slate-900 mb-1 leading-tight">{rec.title}</h5>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{rec.desc}</p>
                                {rec.link ? (
                                    <a href={rec.link} target="_blank" rel="noreferrer" className="block w-full py-3 bg-white border border-slate-200 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                                        Open Application
                                    </a>
                                ) : (
                                    <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                        Learn More
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onReset}
                    className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                >
                    Recalculate Data
                </button>
            </div>
        </div>
    );
};

export default ConnectDashboard;
