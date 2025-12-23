import Icon from './Icon';

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

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Welcome to Portsmouth Bridge</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            A live tool connecting you to verified support in Portsmouth. Everything you see is real, updated, and works offline.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Master Your Toolkit</h3>

                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Icon name="plus" size={14} /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900">Pin & Plan</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Tap the plus icon to save resources. Use "Journey Planner" to see them on a timeline map.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Icon name="calendar" size={14} /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900">Food Calendar</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Check the new weekly calendar to find free meals and open pantries by day and time.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Icon name="shield" size={14} /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900">Smart Compare</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Select up to 3 resources to compare opening times, trust scores, and distance side-by-side.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 mb-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <Icon name="wifi" size={12} /> Offline Intelligence
                        </h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            No data? No problem. Install this app to your home screen. It remembers everything you've seen and works without internet.
                        </p>
                    </section>

                    <section className="bg-indigo-50 p-6 rounded-[24px] border border-indigo-100 mb-6">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            Our Community Charter
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-black text-indigo-900 border-l-2 border-indigo-500 pl-2">Dignity First</h4>
                                <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-1">We promise to only list verified, 100% real services. No dead ends. You deserve accuracy and respect.</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-indigo-900 border-l-2 border-indigo-500 pl-2">Warmth & Connection</h4>
                                <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-1">This tool is built with love to connect you to the community that cares. You are never alone.</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-indigo-900 border-l-2 border-indigo-500 pl-2">Support & Empowerment</h4>
                                <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-1">We provide tools (Plan, Compare, Print) to give you control over your journey.</p>
                            </div>
                        </div>
                    </section>

                    <div className="pt-2">
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">
                            Start Exploring
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
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">999</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Immediate Police/Ambulance</div></div>
                    </a>
                    <a href="tel:02392882689" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Icon name="home" size={20} /></div>
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">023 9288 2689</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Outreach & Rough Sleeping</div></div>
                    </a>
                    <a href="tel:02392834989" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Icon name="lifebuoy" size={20} /></div>
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">023 9283 4989</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Homelessness Team (PCC)</div></div>
                    </a>
                    <a href="tel:02392293733" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-amber-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl mr-4 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Icon name="heart" size={20} /></div>
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">023 9229 3733</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Mental Health Crisis Care</div></div>
                    </a>
                    <a href="tel:03300165112" className="flex items-center w-full bg-white p-5 rounded-3xl border-2 border-pink-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
                        <div className="bg-pink-100 text-pink-600 p-3 rounded-2xl mr-4 group-hover:bg-pink-600 group-hover:text-white transition-colors"><Icon name="shield" size={20} /></div>
                        <div className="flex-1"><div className="font-black text-slate-900 text-xl">0330 016 5112</div><div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Domestic Abuse Support</div></div>
                    </a>
                    <a href="tel:111" className="flex items-center w-full bg-white p-4 rounded-3xl border border-dashed border-slate-200 opacity-60 hover:opacity-100 transition-all">
                        <div className="flex-1"><div className="font-black text-slate-700 text-lg">111</div><div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Non-Emergency NHS</div></div>
                    </a>
                    <button onClick={onClose} className="w-full py-4 mt-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors">Go Back</button>
                </div>
            </div>
        </div>
    );
};
