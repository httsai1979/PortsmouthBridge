import { useState } from 'react';
import Icon from './Icon';

interface FAQItem {
    question: string;
    answer: string;
    category: 'privacy' | 'access' | 'dignity' | 'logistics';
    action?: string; // 行動指令
    actionLabel?: string; // 按鈕文字
}

const FAQ_DATA: FAQItem[] = [
    {
        category: 'dignity',
        question: "Is it okay for me to come here?",
        answer: "Yes, absolutely. These spaces belong to the community—that means you. Whether you are a pensioner, between jobs, or just managing rising costs, you are welcome here as a guest."
    },
    {
        category: 'dignity',
        question: "I have a job, am I still allowed to use this?",
        answer: "Yes. Many working people use community pantries to save money on bills. It is a smart, responsible way to manage your household budget."
    },
    {
        category: 'access',
        question: "Do I need to show ID or explain my situation?",
        answer: "For most places marked 'Open Access' (Green tag), you do not need ID or a referral. You can simply walk in.",
        action: "no_referral",
        actionLabel: "Find Open Access Places"
    },
    {
        category: 'access',
        question: "Where can I get advice?",
        answer: "Citizens Advice and HIVE Portsmouth offer free guidance on debt, legal issues, and housing.",
        action: "support",
        actionLabel: "Show Advice Centers"
    },
    {
        category: 'logistics',
        question: "How do I find food nearby?",
        answer: "Use the 'Food' filter on the map to see all food banks, pantries, and free meals near you.",
        action: "food",
        actionLabel: "Show Food Map"
    },
    {
        category: 'logistics',
        question: "Can I charge my phone or use WiFi?",
        answer: "Yes. Libraries and Warm Hubs offer free power and internet. You are welcome to stay and charge.",
        action: "warmth",
        actionLabel: "Find Warm Hubs"
    },
    {
        category: 'logistics',
        question: "What if I see information that is wrong?",
        answer: "You can help us. On every place's card, there is a 'Report Issue' button. Please let us know if something has changed."
    },
    {
        category: 'privacy',
        question: "Will anyone know I used this app?",
        answer: "No. This app is designed for your safety. It does not track you, does not ask for your name, and your location stays on your phone."
    }
];

const FAQSection = ({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (category: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const filteredFAQ = FAQ_DATA.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in-up pb-24">
            <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Help Center</h2>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1">Answers & Guidance</p>
                </div>
                <button onClick={onClose} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                    <Icon name="x" size={24} />
                </button>
            </div>

            <div className="p-5">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" size={20} /></div>
                    <input type="text" placeholder="Search questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-5 pl-14 pr-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-base font-bold text-slate-800 shadow-sm transition-all" />
                </div>
            </div>

            <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[{ id: 'all', label: 'All' }, { id: 'dignity', label: 'Dignity' }, { id: 'access', label: 'Access' }, { id: 'logistics', label: 'Logistics' }, { id: 'privacy', label: 'Privacy' }].map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}>
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-4">
                {filteredFAQ.length > 0 ? (
                    filteredFAQ.map((item, idx) => (
                        <div key={idx} className={`bg-white rounded-[24px] border-2 transition-all overflow-hidden ${openIndex === idx ? 'border-indigo-600 shadow-lg' : 'border-slate-100 hover:border-indigo-100'}`}>
                            <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full flex justify-between items-center p-5 text-left">
                                <span className="text-sm font-black text-slate-800 pr-4">{item.question}</span>
                                <Icon name={openIndex === idx ? "chevron-up" : "chevron-down"} size={16} className="text-slate-400 shrink-0" />
                            </button>
                            
                            {openIndex === idx && (
                                <div className="px-5 pb-5 pt-0">
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.answer}</p>
                                    {item.action && onNavigate && (
                                        <button 
                                            onClick={() => { onNavigate(item.action!); onClose(); }}
                                            className="mt-4 w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                                        >
                                            {item.actionLabel} <Icon name="arrow-right" size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 font-bold">No questions found.</div>
                )}
            </div>
        </div>
    );
};

export default FAQSection;