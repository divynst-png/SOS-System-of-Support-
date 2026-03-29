import { types, type ResourceType } from '../data/resources';

interface SidebarProps {
    selectedType: ResourceType | null;
    onSelect: (type: ResourceType) => void;
    isFocused: boolean;
}

export const Sidebar = ({ selectedType, onSelect, isFocused }: SidebarProps) => {
    return (
        <div className={`flex flex-col gap-2 p-3 border-r h-full w-full transition-all overflow-y-auto custom-scrollbar ${isFocused ? 'border-r-2 border-r-teal-400 shadow-[4px_0_20px_rgba(6,214,160,0.2)]' : 'border-r border-gray-700/50'}`} style={{ background: 'var(--panel-bg)' }}>
            <div className="text-xs mb-2 uppercase tracking-widest px-2 flex items-center gap-2" style={{ color: 'var(--text-bright)' }}>
                <span style={{ color: 'var(--accent-primary)' }}>◆</span> Categories {isFocused && <span className="blink" style={{ color: 'var(--accent-primary)' }}>_</span>}
            </div>
            {types.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className="font-mono text-sm uppercase font-bold flex items-center relative"
                    style={selectedType === t.id ? {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 0.625rem',
                        textAlign: 'left',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'var(--btn-bg-active)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: isFocused ? '4px solid var(--accent-primary)' : '4px solid var(--accent-dim)',
                        boxShadow: isFocused
                            ? '0 4px 20px rgba(6, 214, 160, 0.25), -2px 0 12px rgba(6, 214, 160, 0.35)'
                            : '0 2px 8px rgba(6, 214, 160, 0.08)',
                        color: 'var(--text-bright)',
                        transition: 'all 0.2s ease',
                    } : {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 0.625rem',
                        textAlign: 'left',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'var(--btn-bg)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: '4px solid transparent',
                        boxShadow: 'none',
                        color: 'var(--text-body)',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <span className="text-xl transition-transform duration-300 hover:scale-110">{t.icon}</span>
                    <span>{t.label}</span>
                </button>
            ))}
            <div className="mt-auto text-[10px] text-gray-500 px-2 pt-4 border-t border-gray-800/50">
                Use ↑ ↓ to navigate
            </div>
        </div>
    );
};
