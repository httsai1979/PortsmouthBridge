
import { useState } from 'react';
import Icon from './Icon';

interface Step {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (savedCount: number) => boolean;
}

const STEPS: Step[] = [
    { id: 'start', title: 'First Step', description: 'Begin your journey by finding a resource.', icon: 'mapPin', condition: (n) => n > 0 },
    { id: 'connect', title: 'Building Bridges', description: 'Save 3 resources to build your network.', icon: 'link', condition: (n) => n >= 3 },
    { id: 'empower', title: 'Empowerment', description: 'You are taking control. Keep going.', icon: 'star', condition: (n) => n >= 5 },
    { id: 'master', title: 'Navigator', description: 'You know the city. Share your knowledge.', icon: 'navigation', condition: (n) => n >= 10 },
];

export const ProgressTimeline = ({ savedCount }: { savedCount: number }) => {
    return (
        <div className="mb-8 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-fade-in-up">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Icon name="git-commit" size={18} className="text-indigo-600" /> My Progress Timeline
            </h3>
            <div className="relative">
                {/* Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                <div className="space-y-6">
                    {STEPS.map((step, index) => {
                        const isCompleted = step.condition(savedCount);
                        const isNext = !isCompleted && (index === 0 || STEPS[index - 1].condition(savedCount));

                        return (
                            <div key={step.id} className={`relative pl-16 transition-all ${isCompleted ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all z-10 ${isCompleted ? 'bg-indigo-600 border-indigo-100 text-white' :
                                        isNext ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse' :
                                            'bg-slate-50 border-white text-slate-300'
                                    }`}>
                                    <Icon name={step.icon} size={20} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-black transition-colors ${isCompleted || isNext ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {savedCount} Resources Pinned
                </p>
            </div>
        </div>
    );
};

export default ProgressTimeline;
