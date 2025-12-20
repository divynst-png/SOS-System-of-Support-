import type { Resource } from '../data/resources';

interface AsciiMapProps {
    resources: Resource[];
    selectedId: string | null;
    userLocation: { x: number; y: number };
}

export const AsciiMap = ({ resources, selectedId, userLocation }: AsciiMapProps) => {
    // 12x8 Grid
    const gridW = 20;
    const gridH = 10;
    const grid: string[][] = Array(gridH).fill(null).map(() => Array(gridW).fill(' '));

    // Place Items
    resources.forEach(r => {
        if (r.coordinates) {
            // Simple mapping if coords are 0-10, scale to grid
            const gx = Math.min(Math.floor(r.coordinates.x * 2), gridW - 1);
            const gy = Math.min(Math.floor(r.coordinates.y), gridH - 1);
            grid[gy][gx] = r.id === selectedId ? '●' : '▣';
        }
    });

    // Place User
    const ux = Math.min(Math.floor(userLocation.x * 2), gridW - 1);
    const uy = Math.min(Math.floor(userLocation.y), gridH - 1);
    grid[uy][ux] = '@';

    return (
        <div className="font-mono text-xs leading-none select-none bg-black p-2 border border-green-900 rounded inline-block">
            <div className="text-gray-500 mb-1 text-center border-b border-gray-800 pb-1">AREA SCAN</div>
            {grid.map((row, y) => (
                <div key={y} className="flex">
                    {row.map((cell, x) => (
                        <span key={x} className={`
                w-4 h-4 flex items-center justify-center
                ${cell === '●' ? 'text-amber-500 animate-pulse font-bold' : ''}
                ${cell === '▣' ? 'text-green-600' : ''}
                ${cell === '@' ? 'text-blue-400 font-bold' : ''}
                ${cell === ' ' ? 'text-gray-900' : ''}
             `}>{cell === ' ' ? '·' : cell}</span>
                    ))}
                </div>
            ))}
            <div className="mt-2 text-[10px] text-gray-500 flex justify-between px-2">
                <span>@ YOU</span>
                <span>▣ RES</span>
                <span>● SEL</span>
            </div>
        </div>
    );
};
