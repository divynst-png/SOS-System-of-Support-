interface ConsentDialogProps {
    onConsent: (allow: boolean) => void;
}

export const ConsentDialog = ({ onConsent }: ConsentDialogProps) => (
    <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-6">
        <div className="border border-green-800 bg-black max-w-lg w-full p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-900"></div>

            <h2 className="text-xl font-bold text-green-500 mb-4 font-mono tracking-wide">
                &gt; SYSTEM NOTICE: PRIVACY
            </h2>

            <div className="text-gray-300 font-mono text-sm space-y-4 mb-8">
                <p>
                    This terminal operates <strong className="text-white">offline</strong>.
                    To enable features like <span className="text-amber-500">Favorites</span>, <span className="text-amber-500">History</span>, and <span className="text-amber-500">Reports</span>,
                    we store small amounts of data locally on your device.
                </p>
                <p className="text-gray-500 text-xs border-l-2 border-green-900 pl-3">
                    No personal data is ever sent to a server.
                    You remain anonymous.
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => onConsent(true)}
                    className="flex-1 bg-green-900/30 border border-green-600 text-green-400 py-3 text-sm font-bold hover:bg-green-900/50 hover:text-white transition-colors uppercase"
                >
                    [ Acknowledge & Enable ]
                </button>
                <button
                    onClick={() => onConsent(false)}
                    className="px-4 py-3 text-sm text-gray-500 hover:text-white border border-transparent hover:border-gray-700 uppercase"
                >
                    [ Disable Storage ]
                </button>
            </div>
        </div>
    </div>
);
