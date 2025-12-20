import { useEffect, useState } from 'react';

export const StatsDashboard = ({ onClose }: { onClose: () => void }) => {
    const [stats, setStats] = useState({ searches: 0, views: 0, favorites: 0, emergency: 0 });

    useEffect(() => {
        const loadStats = () => {
            const s = localStorage.getItem('crf_analytics');
            if (s) setStats(JSON.parse(s));
        };
        loadStats();
        // Poll for updates in case they happen while open
        const interval = setInterval(loadStats, 2000);
        return () => clearInterval(interval);
    }, []);

    // Calculate totals and percentages for visuals
    const totalEvents = stats.searches + stats.views + stats.favorites + stats.emergency;

    const getPercent = (val: number) => totalEvents > 0 ? (val / totalEvents) * 100 : 0;
    const pSearch = getPercent(stats.searches);
    const pView = getPercent(stats.views);
    const pFav = getPercent(stats.favorites);
    const pEmer = getPercent(stats.emergency);

    // CSS Conic Gradient for Pie Chart
    // Order: Search (Amber) -> View (Teal) -> Fav (Pink) -> Emer (Red)
    const pieGradient = `conic-gradient(
        #d97706 0% ${pSearch}%, 
        #2dd4bf ${pSearch}% ${pSearch + pView}%, 
        #ec4899 ${pSearch + pView}% ${pSearch + pView + pFav}%, 
        #ef4444 ${pSearch + pView + pFav}% 100%
    )`;

    // Max value for bar scaling (avoid div by zero)
    const maxVal = Math.max(stats.searches, stats.views, stats.favorites, stats.emergency, 1);

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="border-4 border-double border-green-500 p-6 w-full max-w-2xl bg-black shadow-[0_0_50px_rgba(0,255,0,0.1)] font-mono text-green-500 relative flex flex-col md:flex-row gap-8">
                <button onClick={onClose} className="absolute top-2 right-4 text-gray-500 hover:text-white z-10">✕</button>

                {/* Left Column: Metrics & Bars */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-6 border-b-2 border-green-900 pb-2 tracking-widest">SYSTEM_METRICS</h2>

                    <div className="space-y-6">
                        {/* Search */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-amber-500">
                                <span>SEARCH QUERIES</span>
                                <span className="font-bold">{stats.searches}</span>
                            </div>
                            <div className="h-2 bg-gray-900 overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(stats.searches / maxVal) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Views */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-teal-400">
                                <span>RESOURCES VIEWED</span>
                                <span className="font-bold">{stats.views}</span>
                            </div>
                            <div className="h-2 bg-gray-900 overflow-hidden">
                                <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${(stats.views / maxVal) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Favorites */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-pink-500">
                                <span>FAVORITES SAVED</span>
                                <span className="font-bold">{stats.favorites}</span>
                            </div>
                            <div className="h-2 bg-gray-900 overflow-hidden">
                                <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${(stats.favorites / maxVal) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Emergency */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-red-500">
                                <span>EMERGENCY TRIGGERS</span>
                                <span className="font-bold">{stats.emergency}</span>
                            </div>
                            <div className="h-2 bg-gray-900 overflow-hidden">
                                <div className="h-full bg-red-500 animate-pulse transition-all duration-500" style={{ width: `${(stats.emergency / maxVal) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pie Visualization */}
                <div className="w-full md:w-48 flex flex-col items-center justify-center border-l border-green-900/30 pl-0 md:pl-8 pt-6 md:pt-0">
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Event Dist.</h3>

                    <div className="relative w-32 h-32 rounded-full border-4 border-gray-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ background: totalEvents > 0 ? pieGradient : '#333' }}>
                        {/* Inner cutout for donut chart effect */}
                        <div className="absolute inset-8 bg-black rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold">{totalEvents}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-[10px] space-y-1 w-full opacity-80">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-amber-500"></span> SEARCH</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-teal-400"></span> VIEW</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-pink-500"></span> SAVE</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-red-500"></span> EMERG</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
