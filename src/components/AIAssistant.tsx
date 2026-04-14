import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppStore } from '../store/useAppStore';

export interface AIIntent {
    category: 'food' | 'shelter' | 'warmth' | 'all';
    urgency: 'high' | 'normal';
    timeContext: 'now' | 'after5pm';
}

interface TranslationResult {
    needToPay: string;
    deadline: string;
    contactPhone: string;
}

interface AIAssistantProps {
    onIntent: (intent: AIIntent) => void;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-preview-09-2025"
});

const AIAssistant = ({ onIntent }: AIAssistantProps) => {
    const { modals, setModal } = useAppStore();
    const isOpen = modals.aiAssistant;
    const isTranslatorMode = modals.translatorMode;

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setTranslationResult(null);
            setQuery('');
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (isTranslatorMode) {
            processTranslation(query);
        } else {
            processQuery(query);
        }
    };

    const processTranslation = async (text: string) => {
        if (!text.trim() || loading) return;
        setLoading(true);
        setTranslationResult(null);

        try {
            const prompt = `
                I am an exhausted person struggling with poverty in Portsmouth, UK. 
                I have received a complex official letter (e.g., Council Tax, NHS, Benefits).
                
                Letter text: "${text}"
                
                Please summarize this letter into exactly 3 simple points in my language (if detected, otherwise English). 
                Keep it "fat-finger friendly" and zero cognitive load.
                
                Respond ONLY with a JSON object:
                {
                    "needToPay": "Yes/No and amount if applicable (e.g. £120)",
                    "deadline": "Clear date or 'N/A'",
                    "contactPhone": "The specific phone number to call for help"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text().replace(/```json|```/g, '');
            const parsed: TranslationResult = JSON.parse(textResponse);
            setTranslationResult(parsed);
        } catch (error) {
            console.error("Translation Error:", error);
            setTranslationResult({
                needToPay: "Error processing letter",
                deadline: "Please try again",
                contactPhone: "Call 111 for general help"
            });
        } finally {
            setLoading(false);
        }
    };

    const processQuery = async (text: string) => {
        if (!text.trim() || loading) return;
        setLoading(true);

        try {
            const prompt = `
                Act as a triage social worker for Portsmouth, UK. 
                Parse the user's request and return JSON for routing.
                User says: "${text}"
                
                Respond ONLY with JSON:
                { 
                    "category": "food" | "shelter" | "warmth" | "all", 
                    "urgency": "high" | "normal", 
                    "timeContext": "now" | "after5pm" 
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text().replace(/```json|```/g, '');
            const intent: AIIntent = JSON.parse(textResponse);
            
            onIntent(intent);
            setModal('aiAssistant', false);
        } catch (error) {
            console.error("Assistant Error:", error);
            onIntent({ category: 'all', urgency: 'normal', timeContext: 'now' });
        } finally {
            setLoading(false);
        }
    };

    const closeAssistant = () => {
        setModal('aiAssistant', false);
        setModal('translatorMode', false);
    };

    return (
        <>
            <button
                onClick={() => setModal('aiAssistant', true)}
                className="fixed bottom-28 left-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-40"
                aria-label="Smart Assistant"
            >
                <div className={loading ? "animate-spin" : "animate-pulse"}>
                    <Icon name={isTranslatorMode ? "fileText" : "sparkles"} size={24} />
                </div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className={`p-6 ${isTranslatorMode ? 'bg-slate-900' : 'bg-indigo-600'} text-white flex justify-between items-center transition-all`}>
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Icon name={isTranslatorMode ? "fileText" : "sparkles"} size={18} />
                                    {isTranslatorMode ? "Letter Translator" : "How can I help?"}
                                </h3>
                                <p className={isTranslatorMode ? "text-slate-400 text-xs font-medium mt-1" : "text-indigo-100 text-xs font-medium mt-1"}>
                                    {isTranslatorMode ? "Paste letter text below for 3 simple points" : "Social Worker Triage Mode Active"}
                                </p>
                            </div>
                            <button onClick={closeAssistant} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <form onSubmit={handleSearch} className="relative">
                                <textarea
                                    ref={inputRef as any}
                                    rows={isTranslatorMode ? 4 : 2}
                                    value={query}
                                    disabled={loading}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={isTranslatorMode ? 'Paste the confusing letter text here...' : 'e.g. "I am hungry and cold"'}
                                    className="w-full bg-slate-100 border-none rounded-2xl py-4 px-5 pr-14 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 resize-none"
                                />
                                <div className="absolute right-4 bottom-4">
                                    <button type="submit" disabled={loading} className={`p-3 ${isTranslatorMode ? 'bg-slate-900' : 'bg-indigo-600'} text-white rounded-xl shadow-lg disabled:bg-slate-300`}>
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="arrow-right" size={20} />}
                                    </button>
                                </div>
                            </form>

                            {translationResult && (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">1. Need to pay?</p>
                                        <p className="text-lg font-black text-rose-700">{translationResult.needToPay}</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">2. Deadline?</p>
                                        <p className="text-lg font-black text-amber-900">{translationResult.deadline}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">3. Call for help</p>
                                        <p className="text-lg font-black text-indigo-900">{translationResult.contactPhone}</p>
                                    </div>
                                    <button 
                                        onClick={closeAssistant}
                                        className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-2 border-slate-100 rounded-2xl hover:bg-slate-50"
                                    >
                                        Got it, Close
                                    </button>
                                </div>
                            )}

                            {!loading && !translationResult && !isTranslatorMode && (
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

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    {loading ? 'Thinking...' : 'Gemini AI Ready'}
                                </span>
                            </div>
                            {isTranslatorMode ? (
                                <button onClick={() => setModal('translatorMode', false)} className="text-[10px] font-black text-indigo-600 uppercase">Switch to Triage</button>
                            ) : (
                                <button onClick={() => setModal('translatorMode', true)} className="text-[10px] font-black text-slate-600 uppercase">Switch to Translator</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
