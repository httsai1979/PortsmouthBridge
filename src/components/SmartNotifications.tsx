import { useState } from 'react';
import Icon from './Icon';

interface Notification {
    id: string;
    type: 'opening_soon' | 'favorite' | 'weather' | 'info';
    message: string;
    timestamp: number;
    resourceId?: string;
}

interface SmartNotificationsProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
    onClearAll: () => void;
    onAction?: (resourceId: string) => void;
}

const SmartNotifications = ({ notifications, onDismiss, onClearAll, onAction }: SmartNotificationsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'opening_soon': return 'clock';
            case 'favorite': return 'star';
            case 'weather': return 'flame';
            default: return 'info';
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'opening_soon': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'favorite': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'weather': return 'bg-orange-50 text-orange-600 border-orange-200';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-200';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <>
            {/* Notification Bell */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="fixed bottom-24 right-5 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
            >
                <Icon name="info" size={20} />
                {notifications.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-black">{notifications.length}</span>
                    </div>
                )}
            </button>

            {/* Notification Panel */}
            {isExpanded && (
                <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setIsExpanded(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl max-h-[70vh] overflow-hidden animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-black text-slate-900">Smart Alerts</h3>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <Icon name="x" size={20} />
                                </button>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {notifications.length} active {notifications.length === 1 ? 'notification' : 'notifications'}
                            </p>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] p-6 pt-4">
                            <div className="space-y-3">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 rounded-2xl border-2 ${getColorForType(notif.type)} group hover:shadow-lg transition-all`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColorForType(notif.type).replace('50', '100')}`}>
                                                <Icon name={getIconForType(notif.type)} size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 leading-relaxed mb-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {new Date(notif.timestamp).toLocaleTimeString('en-GB', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onDismiss(notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-600 transition-all"
                                            >
                                                <Icon name="x" size={14} />
                                            </button>
                                        </div>
                                        {notif.resourceId && onAction && (
                                            <button
                                                onClick={() => onAction(notif.resourceId!)}
                                                className="mt-3 w-full py-2 bg-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all border border-slate-200"
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                            <button
                                onClick={onClearAll}
                                className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
};

export default SmartNotifications;
