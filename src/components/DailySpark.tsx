import Icon from './Icon';

const DailySpark = () => {
    const hour = new Date().getHours();
    const hourGreetings = [
        { h: 5, g: "Good Morning, Portsmouth", c: "The day is starting fresh in Southsea." },
        { h: 12, g: "Good Afternoon", c: "Hope your day in Portsmouth is going smoothly." },
        { h: 17, g: "Good Evening", c: "Safe travels if you're heading across the city." },
        { h: 21, g: "Stay Safe tonight", c: "Haven is here if you need a warm place or help." }
    ];

    const match = [...hourGreetings].reverse().find(m => hour >= m.h) || hourGreetings[0];
    const greeting = match.g;
    const context = match.c;

    return (
        <div className="px-5 pt-8 pb-4 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Icon name="heart" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{greeting}</h1>
                    <p className="text-sm font-medium text-slate-500">{context}</p>
                </div>
            </div>
        </div>
    );
};

export default DailySpark;
