import { useState } from 'react';
import Icon from './Icon';

interface FAQItem {
    question: string;
    answer: string;
    category: 'privacy' | 'access' | 'dignity' | 'logistics';
    action?: string; // 行動指令
    actionLabel?: string; // 按鈕文字
}

// 採用極度溫柔、去標籤化的語言
const FAQ_DATA: FAQItem[] = [
    // --- Dignity (尊嚴與心理建設) ---
    {
        category: 'dignity',
        question: "Is it okay for me to come here?",
        answer: "Yes, absolutely. These spaces belong to the community—that means you. Whether you are a pensioner, between jobs, or just managing rising costs, you are welcome here as a guest."
    },
    {
        category: 'dignity',
        question: "I have a job, am I still allowed to use this?",
        answer: "Yes. Many working people use community pantries to save money on bills. It is a smart, responsible way to manage your household budget. You are maximizing resources to stay stable."
    },
    {
        category: 'dignity',
        question: "I feel embarrassed to ask for help.",
        answer: "We understand, but please know that everyone needs a hand sometimes. The volunteers are friendly neighbors who just want to share what they have. There is no judgment here, only a warm welcome."
    },

    // --- Access (降低門檻與焦慮) ---
    {
        category: 'access',
        question: "Do I need to show ID or explain my situation?",
        answer: "For most places marked 'Open Access' (Green tag), you do not need ID or a referral. You can simply walk in. No forms, no questions.",
        action: "no_referral",
        actionLabel: "Find Open Access Places"
    },
    {
        category: 'access',
        question: "Where can I get professional advice?",
        answer: "Citizens Advice and HIVE Portsmouth offer free, confidential guidance on debt, legal issues, and housing rights. They are on your side.",
        action: "support",
        actionLabel: "Show Advice Centers"
    },

    // --- Logistics (解決實際問題) ---
    {
        category: 'logistics',
        question: "How do I find food nearby?",
        answer: "Use the 'Food' filter on the map to see all food banks, pantries, and free meals near you. We check them regularly to ensure they are active.",
        action: "food",
        actionLabel: "Show Food Map"
    },
    {
        category: 'logistics',
        question: "Can I charge my phone or use WiFi?",
        answer: "Yes. Libraries and Warm Hubs offer free power and internet. You are welcome to stay, rest, and charge your devices without buying anything.",
        action: "warmth",
        actionLabel: "Find Warm Hubs"
    },

    // --- Privacy (建立信任) ---
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
                    <input type="text" placeholder="I am worried about..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-5 pl-14 pr-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none text-base font-bold text-slate-800 shadow-sm transition-all" />
                </div>
            </div>

            <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[{ id: 'all', label: 'All' }, { id: 'dignity', label: 'First Time?' }, { id: 'access', label: 'Rules' }, { id: 'logistics', label: 'Finding Help' }, { id: 'privacy', label: 'Privacy' }].map(cat => (
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
                                <div className="px-5 pb-5 pt-0 animate-fade-in">
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">{item.answer}</p>
                                    
                                    {/* [修正] 強化按鈕樣式，確保使用者知道這是可以點的 */}
                                    {item.action && onNavigate && (
                                        <button 
                                            onClick={() => { onNavigate(item.action!); onClose(); }}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                                        >
                                            {item.actionLabel} <Icon name="arrow-right" size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 font-bold">
                        No questions found matching your search.
                    </div>
                )}

                {/* Human Connection Box */}
                <div className="mt-8 p-8 bg-indigo-900 rounded-[32px] text-white text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <Icon name="heart" size={40} className="mx-auto mb-4 text-rose-400" />
                        <h4 className="text-xl font-black mb-2">Still unsure?</h4>
                        <p className="text-sm text-indigo-200 mb-6 font-medium leading-relaxed">
                            Sometimes it helps to see a friendly face. Visit any "Community Hub" on the map, and a volunteer will be happy to chat with you.
                        </p>
                        <button onClick={onClose} className="px-8 py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-50">
                            Find a Hub Nearby
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQSection;