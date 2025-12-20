import { useState, useEffect } from 'react';

interface TypewriterProps {
    text?: string;
    lines?: string[];
    speed?: number;
    onComplete?: () => void;
    className?: string;
}

export const Typewriter = ({ text, lines, speed = 20, onComplete, className }: TypewriterProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);

    // Determine content source
    const content = lines || (text ? [text] : []);
    const isMultiLine = !!lines;

    useEffect(() => {
        if (!content.length) return;

        let charIndex = 0;
        let lineIndex = 0;
        let currentString = '';

        const typeChar = () => {
            if (lineIndex >= content.length) {
                if (onComplete) onComplete();
                return;
            }

            const currentLine = content[lineIndex];

            if (charIndex < currentLine.length) {
                currentString += currentLine[charIndex];
                charIndex++;

                if (isMultiLine) {
                    setDisplayedLines(prev => {
                        const newLines = [...prev];
                        newLines[lineIndex] = currentString;
                        return newLines;
                    });
                } else {
                    setDisplayedText(currentString);
                }

                setTimeout(typeChar, speed);
            } else {
                // Line finished
                lineIndex++;
                charIndex = 0;
                currentString = '';
                // Pause slightly between lines if multi-line
                if (isMultiLine && lineIndex < content.length) {
                    setDisplayedLines(prev => [...prev, '']);
                    setTimeout(typeChar, speed * 10);
                } else {
                    setTimeout(typeChar, speed);
                }
            }
        };

        // Initialize first empty line for arrays
        if (isMultiLine) setDisplayedLines(['']);

        const timeoutId = setTimeout(typeChar, speed);
        return () => clearTimeout(timeoutId);
    }, [text, lines, speed]); // simplified dependency for effect reset

    if (isMultiLine) {
        return (
            <div className={className}>
                {displayedLines.map((line, i) => (
                    <div key={i} style={{ minHeight: '1.5em' }}>{line}</div>
                ))}
            </div>
        );
    }

    return <span className={className}>{displayedText}</span>;
};
