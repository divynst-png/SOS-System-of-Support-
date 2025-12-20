import { useState, useEffect, useRef } from 'react';
import { resources } from '../data/resources';

interface CliModeProps {
    onExit: () => void;
}

export const CliMode = ({ onExit }: CliModeProps) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([
        'CRF-OS v1.0.0 initialized...',
        'Type "help" for valid commands.',
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) return;

            const newHistory = [...history, `> ${cmd}`];
            const parts = cmd.toLowerCase().split(' ');
            const action = parts[0];

            switch (action) {
                case 'help':
                    newHistory.push(
                        'AVAILABLE COMMANDS:',
                        '  search [term]   - Search resources',
                        '  list [city]     - List all in city',
                        '  clear           - Clear screen',
                        '  exit            - Return to GUI'
                    );
                    break;
                case 'clear':
                    setHistory([]);
                    setInput('');
                    return;
                case 'exit':
                    onExit();
                    return;
                case 'search':
                    const term = parts.slice(1).join(' ');
                    if (!term) {
                        newHistory.push('Error: Provide a search term.');
                    } else {
                        const matches = resources.filter(r =>
                            r.name.toLowerCase().includes(term) ||
                            r.type.includes(term)
                        );
                        if (matches.length === 0) newHistory.push('No matches found.');
                        else {
                            newHistory.push(`Found ${matches.length} results:`);
                            matches.slice(0, 5).forEach(m => newHistory.push(`  - ${m.name} [${m.type}]`));
                            if (matches.length > 5) newHistory.push(`  ...and ${matches.length - 5} more.`);
                        }
                    }
                    break;
                case 'list':
                    const city = parts[1];
                    const validCities = ['mumbai', 'delhi', 'pune'];
                    if (validCities.includes(city)) {
                        const items = resources.filter(r => r.city.toLowerCase() === city);
                        newHistory.push(`Resources in ${city.toUpperCase()}:`);
                        items.slice(0, 5).forEach(m => newHistory.push(`  - ${m.name} (${m.type})`));
                    } else {
                        newHistory.push('Usage: list [mumbai|delhi|pune]');
                    }
                    break;
                default:
                    newHistory.push(`Unknown command: "${action}". Type "help".`);
            }

            setHistory(newHistory);
            setInput('');
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black font-mono text-green-500 p-6 flex flex-col text-lg overflow-hidden">
            <div className="flex-1 overflow-auto space-y-1">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))}
                <div ref={bottomRef}></div>
            </div>
            <div className="flex items-center gap-2 mt-4 border-t border-green-900 pt-2">
                <span className="text-amber-500 font-bold">$</span>
                <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    className="flex-1 bg-transparent border-none outline-none text-green-100 placeholder-green-900"
                    placeholder="Enter command..."
                />
            </div>
        </div>
    );
};
