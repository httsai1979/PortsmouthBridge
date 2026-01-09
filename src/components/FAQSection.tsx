import { useState } from 'react';
import Icon from './Icon';

interface FAQItem {
    question: string;
    answer: string;
    category: 'essentials' | 'access' | 'app_guide' | 'privacy';
    action: string;      
    actionLabel: string; 
}

// [內容維持] 20 題完整問答庫，採用賦權與溫暖語氣
const FAQ_DATA: FAQItem[] = [
    // --- 1. Essentials ---
    {
        category: 'essentials',
        question: "Where can I find a community pantry?",
        answer: "Portsmouth has many community pantries. Some ask for a small membership fee for a weekly shop, others offer free items. They are open to help you manage your budget.",
        action: "food",
        actionLabel: "Find Food Support"
    },
    {
        category: 'essentials',
        question: "I have nowhere safe to sleep tonight.",
        answer: "You are not alone. There are specific services for emergency housing and safe sleep. Please use the button below to see available support immediately.",
        action: "shelter",
        actionLabel: "Find Safe Sleep"
    },
    {
        category: 'essentials',
        question: "I need a warm place to rest or charge my phone.",
        answer: "Libraries and 'Warm Spaces' offer free electricity, WiFi, and a comfortable seat. You do not need to buy anything to stay there.",
        action: "warmth",
        actionLabel: "Find Warm Spaces"
    },
    {
        category: 'essentials',
        question: "Are there services for families with young children?",
        answer: "Yes. Family Hubs provide support for parents and children (0-19), including play sessions, health advice, and baby supplies.",
        action: "family",
        actionLabel: "See Family Hubs"
    },
    {
        category: 'essentials',
        question: "Where can I wash my clothes or take a shower?",
        answer: "Certain community hubs offer laundry and shower facilities for free or a nominal cost. Check the 'Support' section.",
        action: "support",
        actionLabel: "Find Facilities"
    },

    // --- 2. Access & Dignity ---
    {
        category: 'access',
        question: "Do I need a referral voucher to visit?",
        answer: "Not always. Places marked with the green 'Open Access' tag welcome you without any paperwork. Food banks may require a voucher, but community pantries usually do not.",
        action: "no_referral",
        actionLabel: "Show Open Access Places"
    },
    {
        category: 'access',
        question: "I have a job, am I still allowed to use these services?",
        answer: "Yes, absolutely. Many working people use community pantries to make their weekly budget stretch further. It is a smart way to maximize your resources.",
        action: "food",
        actionLabel: "Find Pantries"
    },
    {
        category: 'access',
        question: "I feel anxious about going alone.",
        answer: "That is completely understandable. Our 'Community Hubs' are known for their friendly atmosphere. You can visit just for a coffee first to see how it feels.",
        action: "support",
        actionLabel: "Find a Friendly Hub"
    },
    {
        category: 'access',
        question: "Where can I get professional advice on debt or housing?",
        answer: "Citizens Advice and HIVE Portsmouth offer free, confidential guidance on legal rights, tenancy, and finance. They are on your side.",
        action: "support", 
        actionLabel: "Find Advice Centers"
    },
    {
        category: 'access',
        question: "Are pets allowed?",
        answer: "Some community centers and shelters are pet-friendly. Look for the 'Pet Friendly' tag on the details card.",
        action: "all",
        actionLabel: "Browse All Listings"
    },

    // --- 3. App Guide ---
    {
        category: 'app_guide',
        question: "How do I use the 'Journey Planner'?",
        answer: "The Planner is like a shopping list for your day. When you see a place you want to visit, tap the 'Plus (+)' icon on its card. Then, tap 'My Journey' to see them all in one place.",
        action: "planner",
        actionLabel: "Open My Planner"
    },
    {
        category: 'app_guide',
        question: "How do I save places for later?",
        answer: "Tap the 'Plus (+)' icon on any resource card. This pins it to your device so you can find it quickly later, even without internet.",
        action: "list",
        actionLabel: "Browse to Save"
    },
    {
        category: 'app_guide',
        question: "I found incorrect information. How can I fix it?",
        answer: "Community feedback is vital. Tap 'View Details' on any card, then tap the 'Report Issue' button (flag icon) to let us know if details have changed.",
        action: "map",
        actionLabel: "Go to Map"
    },
    {
        category: 'app_guide',
        question: "Does this app work without internet?",
        answer: "Yes. Once you have opened the app once, it saves the information to your phone. You can search and view maps offline.",
        action: "all",
        actionLabel: "Start Using Offline"
    },
    {
        category: 'app_guide',
        question: "What do the colored tags mean?",
        answer: "Green means 'Open Now'. Amber means 'Closing Soon'. We also use tags like 'No Referral' to help you find accessible places quickly.",
        action: "map",
        actionLabel: "See Map Tags"
    },

    // --- 4. Privacy ---
    {
        category: 'privacy',
        question: "Is my search history tracked?",
        answer: "No. We do not know who you are. We do not track your location history. Everything is stored privately on your own phone.",
        action: "privacy",
        actionLabel: "Read Privacy Promise"
    },
    {
        category: 'privacy',
        question: "Do I need to create an account?",
        answer: "No. You can use all features of this tool without signing up or giving us your email address.",
        action: "all",
        actionLabel: "Start Browsing"
    },
    {
        category: 'privacy',
        question: "Will anyone know I used this service?",
        answer: "This tool is discreet. It looks like a standard map or guide app. Your activity is private to you.",
        action: "privacy",
        actionLabel: "Your Safety Matters"
    },
    {
        category: 'privacy',
        question: "How is the data updated?",
        answer: "We work with local partners to keep information real-time. 'Live Status' shows you stock levels and current capacity.",
        action: "map",
        actionLabel: "Check Live Status"
    },
    {
        category: 'privacy',
        question: "Can I delete my saved data?",
        answer: "Yes. You can un-tap the 'Plus (+)' icon to remove items from your planner at any time.",
        action: "planner",
        actionLabel: "Manage Saved Items"
    }
];

const FAQSection = ({ onClose, onNavigate }: { onClose: () => void; onNavigate: (action: string) => void }) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFAQ = FAQ_DATA.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCat;
    });

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'essentials', label: 'Urgent Needs' },
        { id: 'access', label: 'Access Rules' },
        { id: 'app_guide', label: 'App Guide' },
        { id: 'privacy', label: 'Privacy' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-fade-in-up pb-0 h-screen w-full">
            {/* Header */}
            <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Smart Guide</h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Answers & Tutorials</p>
                </div>
                <button onClick={onClose} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                    <Icon name="x" size={24} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-5 bg-white border-b border-slate-50 shrink-0">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" size={20} /></div>
                    <input 
                        type="text" 
                        placeholder="Type to search (e.g. 'Food', 'Planner')..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full py-5 pl-14 pr-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 focus:bg-white outline-none text-base font-bold text-slate-800 shadow-sm transition-all" 
                    />
                </div>
            </div>

            {/* Category Pills */}
            <div className="px-5 py-4 bg-white border-b border-slate-50 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                {categories.map(cat => (
                    <button 
                        key={cat.id} 
                        onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }} 
                        className={`px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${
                            activeCategory === cat.id 
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* FAQ List - 關鍵修復: 加入 onScroll 阻止冒泡 */}
            <div 
                className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32"
                onScroll={(e) => e.stopPropagation()} // [CRITICAL FIX] 阻止捲動事件傳遞到 App 組件，避免觸發全域重繪
            >
                {filteredFAQ.length > 0 ? (
                    filteredFAQ.map((item, idx) => (
                        <div key={idx} className={`bg-white rounded-[24px] border-2 transition-all duration-300 overflow-hidden ${openIndex === idx ? 'border-indigo-600 shadow-xl scale-[1.01]' : 'border-slate-100'}`}>
                            <button 
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
                                className="w-full flex justify-between items-center p-5 text-left active:bg-slate-50"
                            >
                                <span className={`text-sm font-bold pr-4 leading-relaxed ${openIndex === idx ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {item.question}
                                </span>
                                <div className={`p-2 rounded-full transition-colors ${openIndex === idx ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Icon name={openIndex === idx ? "chevron-up" : "chevron-down"} size={16} />
                                </div>
                            </button>
                            
                            {openIndex === idx && (
                                <div className="px-6 pb-6 pt-0 animate-fade-in">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6 border-l-4 border-indigo-100 pl-4">
                                        {item.answer}
                                    </p>
                                    
                                    {/* 智慧引導按鈕 - 只有非隱私類問題才顯示跳轉按鈕 */}
                                    {item.action !== 'privacy' && (
                                        <button 
                                            onClick={() => { onClose(); onNavigate(item.action); }}
                                            className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
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
                        <Icon name="search" size={48} className="mx-auto mb-4 opacity-20" />
                        No answers found for "{searchTerm}".<br/>Try "Food", "Map", or "Plan".
                    </div>
                )}

                {/* Human Connection Box (Footer) */}
                <div className="mt-8 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[32px] text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Icon name="heart" size={24} className="text-rose-300" />
                        </div>
                        <h4 className="text-lg font-black mb-2">Need to talk to a person?</h4>
                        <p className="text-sm text-indigo-200 mb-6 font-medium leading-relaxed max-w-xs mx-auto">
                            Sometimes technology isn't enough. Visit a Community Hub to speak with a friendly volunteer.
                        </p>
                        <button 
                            onClick={() => { onClose(); onNavigate('support'); }}
                            className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-50"
                        >
                            Find a Local Hub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQSection;