export const checkStatus = (schedule: Record<number, string>) => {
    if (!schedule) return { isOpen: false, status: 'unknown', color: 'bg-slate-100 text-slate-500', label: 'Check Time' };
    const now = new Date();
    const day = now.getDay();
    const hoursStr = schedule[day];
    if (!hoursStr || hoursStr === 'Closed') return { isOpen: false, status: 'closed', color: 'bg-slate-100 text-slate-500', label: 'Closed Today' };

    if (hoursStr === "00:00-23:59") return { isOpen: true, status: 'open', color: 'bg-green-100 text-green-800', label: 'Open 24/7' };

    const [start, end] = hoursStr.split('-');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const currentTotal = now.getHours() * 60 + now.getMinutes();
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (currentTotal >= startTotal && currentTotal < endTotal) {
        if (endTotal - currentTotal < 60) return { isOpen: true, status: 'closing', color: 'bg-orange-100 text-orange-800', label: `Closes ${end}` };
        return { isOpen: true, status: 'open', color: 'bg-green-100 text-green-800', label: `Open Now (${end})` };
    }
    return { isOpen: false, status: 'closed', color: 'bg-slate-100 text-slate-500', label: 'Closed Now' };
};

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const getTagConfig = (tag: string, tagIcons: Record<string, { icon: string; label: string; color: string; bg: string; border?: boolean }>) => tagIcons[tag] || tagIcons.default;

// Phase 13: Sensory Revolution Helper
export const playSuccessSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.log("Audio feedback not supported or blocked");
    }
};
