import { types, type ResourceType } from '../data/resources';

interface SidebarProps {
    selectedType: ResourceType | null;
    onSelect: (type: ResourceType) => void;
    isFocused: boolean;
}

export const Sidebar = ({ selectedType, onSelect, isFocused }: SidebarProps) => {
    return (
        <div className={`flex flex-col gap-2 p-3 border-r h-full w-full transition-all ${isFocused ? 'border-r-2 border-r-teal-400 shadow-[4px_0_20px_rgba(6,214,160,0.2)]' : 'border-r border-gray-700/50'}`} style={{ background: 'linear-gradient(180deg, rgba(26, 31, 53, 0.5), rgba(26, 31, 53, 0.3))' }}>
            <div className="text-xs text-white mb-2 uppercase tracking-widest px-2 flex items-center gap-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)' }}>
                <span style={{ color: 'var(--accent-primary)' }}>◆</span> Categories {isFocused && <span className="blink" style={{ color: 'var(--accent-primary)' }}>_</span>}
            </div>
            {types.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`
            text-left px-3 py-3 font-mono text-sm uppercase tracking-wider transition-all
            flex items-center gap-3 rounded-lg relative overflow-hidden font-bold
            ${selectedType === t.id
                            ? 'bg-gradient-to-r from-teal-900/40 to-teal-800/30 text-white shadow-lg border border-teal-700/50'
                            : 'bg-slate-800/60 text-white/90 hover:text-white hover:bg-slate-700/60 border border-slate-700/30'}
            ${selectedType === t.id && isFocused ? 'border-l-4 border-teal-400 shadow-[0_0_20px_rgba(6,214,160,0.3)]' : 'border-l-4 border-transparent'}
          `}
                    style={selectedType === t.id ? {
                        boxShadow: '0 4px 15px rgba(6, 214, 160, 0.2), inset 0 1px 0 rgba(6, 214, 160, 0.3)',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
                    } : {
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)'
                    }}
                >
                    <span className="text-xl transition-transform duration-300 hover:scale-110" style={selectedType === t.id ? { filter: 'drop-shadow(0 0 8px rgba(6, 214, 160, 0.6))' } : {}}>{t.icon}</span>
                    <span>{t.label}</span>
                </button>
            ))}
            <div className="mt-auto text-[10px] text-gray-500 px-2 pt-4 border-t border-gray-800/50">
                Use ↑ ↓ to navigate
            </div>
        </div>
    );
};
