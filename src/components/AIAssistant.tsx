import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIIntent {
    category: 'food' | 'shelter' | 'warmth' | 'all';
    urgency: 'high' | 'normal';
    timeContext: 'now' | 'after5pm';
}

interface AIAssistantProps {
    onIntent: (intent: AIIntent) => void;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-preview-09-2025",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const AIAssistant = ({ onIntent }: AIAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        processQuery(query);
    };

    const processQuery = async (text: string) => {
        if (!text.trim() || loading) return;
        setLoading(true);

        try {
            const prompt = `
                Act as a triage social worker for the city of Portsmouth, UK. 
                Your goal is to parse the user's natural language request and return a JSON object for system routing.
                User says: "${text}"
                
                Respond ONLY with this JSON structure:
                { 
                    "category": "food" | "shelter" | "warmth" | "all", 
                    "urgency": "high" | "normal", 
                    "timeContext": "now" | "after5pm" 
                }
                
                Logic:
                - category: "food" (hungry), "shelter" (bed/kids place), "warmth" (cold/heat).
                - urgency: "high" if crisis, night shift exhaustion, or immediate danger.
                - timeContext: "now" (immediate) unless they mention "after work" or "later".
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();
            
            const intent: AIIntent = JSON.parse(textResponse);
            
            onIntent(intent);
            setIsOpen(false);
            setQuery('');
        } catch (error) {
            console.error("Assistant Error:", error);
            // Fallback to basic search if API fails
            onIntent({ category: 'all', urgency: 'normal', timeContext: 'now' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 left-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-40"
                aria-label="Smart Assistant"
            >
                <div className={loading ? "animate-spin" : "animate-pulse"}>
                    <Icon name="sparkles" size={24} />
                </div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center transition-all">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Icon name="sparkles" size={18} />
                                    {loading ? "Thinking..." : "How can I help you?"}
                                </h3>
                                <p className="text-indigo-100 text-xs font-medium mt-1">Social Worker Triage Mode Active</p>
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
                                    disabled={loading}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder='e.g. "I am hungry and cold"'
                                    className="w-full bg-slate-100 border-none rounded-2xl py-4 px-5 pr-24 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button type="submit" disabled={loading} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 disabled:bg-slate-300">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="arrow-right" size={20} />}
                                    </button>
                                </div>
                            </form>

                            {!loading && (
                                <div className="animate-fade-in">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Help</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["I'm hungry", "Need a warm space", "Emergency shelter", "I'm lost"].map(hint => (
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
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {loading ? 'API Request in progress...' : 'AI Social Triage Ready'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
