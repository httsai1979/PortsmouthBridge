import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

interface AIAssistantProps {
    onIntent: (filters: { area: string; category: string; date: string }) => void;
    currentArea: string;
}

const AIAssistant = ({ onIntent, currentArea }: AIAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const intents = [
        { keywords: ['hungry', 'food', 'eat', 'meal', 'dinner', 'breakfast', 'pantry'], category: 'food', message: "Finding food resources for you..." },
        { keywords: ['sleep', 'shelter', 'bed', 'hostel', 'rough', 'street', 'stay'], category: 'shelter', message: "Finding emergency shelter..." },
        { keywords: ['cold', 'warm', 'heat', 'warmth', 'winter', 'coat'], category: 'warmth', message: "Finding warm spaces..." },
        { keywords: ['kids', 'family', 'children', 'parent', 'baby'], category: 'family', message: "Finding family support..." },
        { keywords: ['health', 'doctor', 'nhs', 'advice', 'legal', 'help', 'medical'], category: 'support', message: "Finding help and health advice..." },
        { keywords: ['cheap', 'clothes', 'shop', 'charity', 'furniture'], category: 'charity', message: "Finding local charity shops..." }
    ];

    const areas = ['po1', 'po2', 'po3', 'po4', 'po5', 'po6'];

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        processQuery(query);
    };

    const processQuery = (text: string) => {
        const lowerText = text.toLowerCase();
        let targetArea = currentArea;
        let targetCategory = 'all';

        // 1. Detect Area
        areas.forEach(a => {
            if (lowerText.includes(a)) targetArea = a.toUpperCase();
        });

        // 2. Detect Category
        const bestMatch = intents.find(intent =>
            intent.keywords.some(k => lowerText.includes(k))
        );

        if (bestMatch) {
            targetCategory = bestMatch.category;
        }

        onIntent({ area: targetArea, category: targetCategory, date: 'today' });
        setIsOpen(false);
        setQuery('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 left-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-40"
                aria-label="Smart Assistant"
            >
                <Icon name="sparkles" size={24} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Icon name="sparkles" size={18} />
                                    How can I help you?
                                </h3>
                                <p className="text-indigo-100 text-xs font-medium mt-1">Local Intelligence • No Data Required</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder='Try "I am hungry" or "Need a bed in PO1"'
                                    className="w-full bg-slate-100 border-none rounded-2xl py-4 px-5 pr-24 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => alert("Voice recognition coming soon: This will allow hands-free help.")}
                                        className="text-slate-400 hover:text-indigo-600 transition"
                                        aria-label="Voice Search"
                                    >
                                        <Icon name="mic" size={20} />
                                    </button>
                                    <button type="submit" className="text-indigo-600">
                                        <Icon name="arrow-right" size={20} />
                                    </button>
                                </div>
                            </form>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested Topics</p>
                                <div className="flex flex-wrap gap-2">
                                    {["I'm hungry", "Need a warm space", "Emergency shelter", "Family support", "PO1 hot food"].map(hint => (
                                        <button
                                            key={hint}
                                            onClick={() => { setQuery(hint); processQuery(hint); }}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-100"
                                        >
                                            {hint}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">System Status: Private & Local</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
