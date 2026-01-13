import { useState } from 'react';
import Icon from './Icon';

interface LoopItem {
    id: string;
    type: 'skill' | 'item';
    title: string;
    desc: string;
    category: string;
    user: string;
    time: string;
}

const MOCK_LOOP: LoopItem[] = [
    { id: '1', type: 'skill', title: 'Leaking Tap Fixes', desc: 'Can fix basic plumbing issues. No charge, just looking to help.', category: 'Maintenance', user: 'Mark', time: '2h ago' },
    { id: '2', type: 'item', title: 'School Uniform (St Judes)', desc: 'Full set for Year 4. Good condition. Free to collective.', category: 'Family', user: 'Sarah', time: '5h ago' },
    { id: '3', type: 'skill', title: 'Maths Tutoring (GCSE)', desc: 'Happy to help with evening study sessions.', category: 'Learning', user: 'Arthur', time: '1d ago' },
    { id: '4', type: 'item', title: 'Double Pushchair', desc: 'Slightly worn but perfectly safe. Needs a new home.', category: 'Baby', user: 'Elena', time: '3d ago' },
];

const PompeyLoop = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'items'>('all');

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter mb-2">The Pompey Loop</h2>
                    <p className="text-xs font-bold text-white/50 leading-relaxed uppercase tracking-widest">Community-led exchange for skills and items. <br />Dignity preserved. No money needed.</p>

                    <button className="mt-8 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                        <Icon name="plus" size={18} /> Post to the Loop
                    </button>
                </div>
            </div>

            <div className="flex gap-2 px-1">
                {(['all', 'skills', 'items'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {MOCK_LOOP.filter(i => activeTab === 'all' || (activeTab === 'skills' ? i.type === 'skill' : i.type === 'item')).map(item => (
                    <div key={item.id} className="p-6 bg-white rounded-[32px] border-2 border-slate-50 hover:border-indigo-100 transition-all shadow-xl shadow-slate-100/50">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.type === 'skill' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {item.type === 'skill' ? 'Skill Swap' : 'Item Flow'}
                            </span>
                            <span className="text-[10px] text-slate-300 font-bold uppercase">{item.time}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight tracking-tight uppercase">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{item.desc}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                    {item.user[0]}
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{item.user}</span>
                            </div>
                            <button className="flex items-center gap-2 py-2 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">
                                Connect
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PompeyLoop;
