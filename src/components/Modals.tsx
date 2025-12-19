import Icon from './Icon';
import { SUPERMARKET_TIPS } from '../data';

export const TipsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 transition-all" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-sm overflow-auto max-h-[90vh] animate-bounce-in shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                        <Icon name="info" size={24} /> The Bridge Guide
                    </h2>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest leading-loose">How we help you cross the bridge to a better tomorrow.</p>
                </div>

                <div className="p-8 space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Our Mission</h3>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            Portsmouth Bridge isn't just a map. It's a connection between the struggle of today and the hope of tomorrow. We believe everyone deserves a path forward.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">How to Use "My Bridge"</h3>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">1</div>
                            <p className="text-xs text-slate-600 leading-relaxed"><span className="font-black text-slate-900">Pin:</span> Find a resource and tap the <Icon name="plus" size={12} className="inline mx-1" /> icon to pin it to your personal bridge.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">2</div>
                            <p className="text-xs text-slate-600 leading-relaxed"><span className="font-black text-slate-900">Plan:</span> Tap <span className="font-black text-slate-900">"My Journey"</span> at the bottom to see your saved pins in a chronological timeline.</p>
                        </div>
                    </section>

                    <section className="space-y-4 bg-yellow-50 p-6 rounded-[32px] border-2 border-yellow-100">
                        <h3 className="text-[10px] font-black text-yellow-700 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Icon name="tag" size={14} /> Smart Saving Tips
                        </h3>
                        <div className="space-y-3 mt-4">
                            {SUPERMARKET_TIPS.map((tip, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                    <span className="font-black text-slate-800">{tip.store}</span>
                                    <span className="font-bold text-yellow-700 bg-yellow-400/20 px-2 py-0.5 rounded-lg">{tip.time}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="pt-4">
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">
                            Got it, Let's Cross
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CrisisModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[80] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden animate-bounce-in shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h2 className="text-2xl font-black flex items-center gap-3 relative z-10">
                        <Icon name="alert" size={24} /> Emergency
                    </h2>
                    <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mt-2 relative z-10">Immediate Support Required</p>
                </div>
                <div className="p-8 space-y-4 bg-slate-50/50">
                    <a href="tel:999" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-rose-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl mr-4 group-hover:bg-rose-600 group-hover:text-white transition-colors"><Icon name="phone" size={20} /></div>
                        <div><div className="font-black text-slate-900 text-xl">999</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Emergency Services</div></div>
                    </a>
                    <a href="tel:02392882689" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Icon name="home" size={20} /></div>
                        <div><div className="font-black text-slate-900 text-xl">023 9288 2689</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Rough Sleeping Hub</div></div>
                    </a>
                    <a href="tel:111" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Icon name="lifebuoy" size={20} /></div>
                        <div><div className="font-black text-slate-900 text-xl">111</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">NHS Medical Advice</div></div>
                    </a>
                    <button onClick={onClose} className="w-full py-4 mt-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors">Go Back</button>
                </div>
            </div>
        </div>
    );
};
