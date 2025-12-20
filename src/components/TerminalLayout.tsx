import React, { type ReactNode } from 'react';
import './TerminalLayout.css';

interface TerminalLayoutProps {
    children: ReactNode;
    header?: string;
    showBorder?: boolean;
    emergencyFooter?: ReactNode;
}

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({
    children,
    header = "SOS: SYSTEM OF SUPPORT",
    showBorder = true,
    emergencyFooter
}) => {
    return (
        <div className="terminal-wrapper crt-container">
            <div className="crt-overlay"></div>

            <div className={`terminal-box ${showBorder ? 'bordered' : ''}`}>
                {showBorder && (
                    <header className="terminal-header">
                        <span className="blink">■</span>
                        <h1 className="terminal-title">{header}</h1>
                        <span className="blink">■</span>
                    </header>
                )}

                <main className="terminal-content flex flex-row overflow-hidden">
                    {children}
                </main>

                {showBorder && (
                    <footer className="terminal-footer">
                        <span>OFFLINE MODE</span>
                        <span>v1.0.0</span>
                    </footer>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 9999 }}>
                {emergencyFooter || (
                    <div className="text-center py-2 text-sm font-mono tracking-wide border-t border-gray-800 flex justify-center gap-6 font-bold" style={{ backgroundColor: 'rgba(15, 23, 42, 0.98)', color: '#a0d8d0', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                        <a href="tel:108" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors" style={{ color: '#a0d8d0' }}>
                            🚑 EMERGENCY: 108
                        </a>
                        <span style={{ color: '#4a5568' }}>|</span>
                        <a href="tel:100" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors" style={{ color: '#a0d8d0' }}>
                            🚓 POLICE: 100
                        </a>
                        <span style={{ color: '#4a5568' }}>|</span>
                        <a href="tel:181" className="hover:text-teal-300 flex items-center gap-1.5 transition-colors" style={{ color: '#a0d8d0' }}>
                            📞 HELPLINE: 181
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
