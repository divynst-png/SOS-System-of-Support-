import { useState, useEffect, useRef, useMemo } from 'react';
import { TerminalLayout } from './components/TerminalLayout';
import { AsciiMap } from './components/AsciiMap';
import { StatsDashboard } from './components/StatsDashboard';
import { CliMode } from './components/CliMode';
import { Typewriter } from './components/Typewriter';
import { ConsentDialog } from './components/ConsentDialog';
import { ResourceSubmission } from './components/ResourceSubmission';
import { resources, types, cities } from './data/resources';
import type { Resource, City, ResourceType } from './data/resources';
import { Sidebar } from './components/Sidebar';
import './App.css';

type ViewState = 'INTRO' | 'PURPOSE' | 'CONSOLE';
type FocusArea = 'SIDEBAR' | 'CONTENT';
type TransportMode = 'walking' | 'bus' | 'car';

function App() {
  const [view, setView] = useState<ViewState>('INTRO');
  const [focusArea, setFocusArea] = useState<FocusArea>('SIDEBAR');

  // Console State
  const [selectedType, setSelectedType] = useState<ResourceType | null>('food');
  const [selectedCity, setSelectedCity] = useState<City>('Mumbai');
  const [viewResource, setViewResource] = useState<Resource | null>(null);

  // User Data State
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [showSubmission, setShowSubmission] = useState(false);

  // Lists
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global State / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  // New Filters
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Advanced Features State
  const [showStats, setShowStats] = useState(false);
  const [isCliMode, setIsCliMode] = useState(false);
  const [showMap, setShowMap] = useState(false); // Toggle map in console sidebar

  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showIntroContinue, setShowIntroContinue] = useState(false);

  // Privacy State
  const [hasConsented, setHasConsented] = useState<boolean | null>(null); // null = unknown, true = yes, false = no

  // Sound effect ref
  const audioContext = useRef<AudioContext | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  // Load favorites & Consent on mount
  useEffect(() => {
    // Check consent
    const consent = localStorage.getItem('crf_consent');
    if (consent === 'true') setHasConsented(true);
    else if (consent === 'false') setHasConsented(false);
    else setHasConsented(null); // Show dialog

    // Load favorites only if consented (or if we want to read-only until explicit deny? Safer to wait)
    if (consent === 'true') {
      const saved = localStorage.getItem('crf_favorites');
      if (saved) setFavorites(JSON.parse(saved));

      const savedResources = localStorage.getItem('crf_user_resources');
      if (savedResources) setUserResources(JSON.parse(savedResources));
    }
  }, []);

  const handleConsent = (allow: boolean) => {
    setHasConsented(allow);
    localStorage.setItem('crf_consent', String(allow));
    if (!allow) {
      // Clear any implicit data if they say no
      localStorage.removeItem('crf_favorites');
      localStorage.removeItem('crf_analytics');
      localStorage.removeItem('crf_reports');
      localStorage.removeItem('crf_user_resources');
      setFavorites([]);
      setUserResources([]);
    }
  };

  const handleAddResource = (res: Resource) => {
    const updated = [...userResources, res];
    setUserResources(updated);
    localStorage.setItem('crf_user_resources', JSON.stringify(updated));
    setShowSubmission(false);
    showNotification('Success: Resource added locally.');
  };

  const clearAllData = () => {
    if (confirm('Delete ALL local data (Favorites, Stats, Added Resources)?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const toggleFavorite = (id: string) => {
    if (!hasConsented) {
      if (hasConsented === false) showNotification('Storage disabled by user setting.');
      return;
    }
    const newFavs = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('crf_favorites', JSON.stringify(newFavs));
    playSuccessSound(); // Success melody for favoriting
    showNotification(favorites.includes(id) ? '> Removed from favorites' : '> Favorite saved locally');
  };

  const reportIssue = (resourceName: string) => {
    const issue = prompt(`Report issue for "${resourceName}":\n(e.g., Wrong number, Moved, Closed)`);
    if (issue) {
      if (hasConsented) {
        const reports = JSON.parse(localStorage.getItem('crf_reports') || '[]');
        reports.push({
          resource: resourceName,
          issue,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('crf_reports', JSON.stringify(reports));
        showNotification('Thank you — report saved locally.');
      } else {
        showNotification('Report NOT saved (Storage disabled).');
      }
      playSelectSound(); // Confirmation sound for report
    }
  };

  const trackEvent = (metric: 'searches' | 'views' | 'favorites' | 'emergency') => {
    if (!hasConsented) return;
    const stats = JSON.parse(localStorage.getItem('crf_analytics') || '{"searches":0,"views":0,"favorites":0,"emergency":0}');
    stats[metric]++;
    localStorage.setItem('crf_analytics', JSON.stringify(stats));
  };

  const playBeep = (freq = 400, type: OscillatorType = 'square', duration = 0.05) => {
    try {
      if (!audioContext.current) {
        // @ts-ignore
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current?.state === 'suspended') {
        audioContext.current.resume();
      }

      const osc = audioContext.current!.createOscillator();
      const gain = audioContext.current!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.current!.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.current!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.current!.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.current!.destination);
      osc.start();
      osc.stop(audioContext.current!.currentTime + duration);
    } catch (e) {
      // Ignore
    }
  };

  // Enhanced retro sound effects
  const playSuccessSound = () => {
    // Ascending melody for success
    playBeep(400, 'sine', 0.08);
    setTimeout(() => playBeep(500, 'sine', 0.08), 80);
    setTimeout(() => playBeep(600, 'sine', 0.12), 160);
  };

  const playErrorSound = () => {
    // Descending tones for error
    playBeep(300, 'sawtooth', 0.1);
    setTimeout(() => playBeep(200, 'sawtooth', 0.15), 100);
  };

  const playAlertSound = () => {
    // Pulsing alert for emergency mode
    playBeep(800, 'square', 0.08);
    setTimeout(() => playBeep(800, 'square', 0.08), 150);
  };

  const playNavigationSound = () => {
    // Sharp high beep for navigation
    playBeep(600, 'sine', 0.03);
  };

  const playSelectSound = () => {
    // Two-tone confirmation
    playBeep(400, 'square', 0.06);
    setTimeout(() => playBeep(500, 'square', 0.06), 60);
  };

  const playTypeSound = () => {
    // Quick tick for typing
    playBeep(200, 'square', 0.02);
  };

  const isOpenNow = (hoursStr: string): boolean => {
    if (!hoursStr) return false;
    if (hoursStr.includes('24 Hours')) return true;
    try {
      const now = new Date();
      const currentHour = now.getHours();

      const parts = hoursStr.split('-');
      if (parts.length !== 2) return false;

      const parseTime = (t: string) => {
        const match = t.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
        if (!match) return -1;
        let h = parseInt(match[1]);
        if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h;
      };

      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);

      if (start === -1 || end === -1) return false;

      if (end < start) {
        return currentHour >= start || currentHour < end;
      }
      return currentHour >= start && currentHour < end;
    } catch {
      return false;
    }
  };

  // derived languages list
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    resources.forEach(r => r.languages.forEach(l => langs.add(l)));
    return ['All', ...Array.from(langs).sort()];
  }, []);


  // FILTER LOGIC
  useEffect(() => {
    if (view === 'CONSOLE') {
      let matches = [...userResources, ...resources];

      // 1. Filter by City
      matches = matches.filter(r => r.city === selectedCity);

      // 2. Filter by Saved (if active) or Type
      if (showSavedOnly) {
        matches = matches.filter(r => favorites.includes(r.id));
      } else {
        // Filter by Type (unless searching globally)
        if (!searchQuery && selectedType) {
          matches = matches.filter(r => r.type === selectedType);
        }
      }

      // 3. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        matches = matches.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.services.join(' ').toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
        );
      }

      // 4. Emergency Mode
      if (emergencyMode) {
        matches = matches.sort((a, b) => {
          if (a.priority === 'High' && b.priority !== 'High') return -1;
          if (b.priority === 'High' && a.priority !== 'High') return 1;
          if (a.is_emergency && !b.is_emergency) return -1;
          if (!a.is_emergency && b.is_emergency) return 1;
          return 0;
        });
      }

      // 5. Open Now
      if (filterOpenNow) {
        matches = matches.filter(r => isOpenNow(r.hours));
      }

      // 6. Language Filter
      if (filterLanguage !== 'All') {
        matches = matches.filter(r => r.languages.includes(filterLanguage));
      }

      setFilteredResources(matches);
      // Reset index if out of bounds
      if (selectedIndex >= matches.length) setSelectedIndex(0);
    }
  }, [selectedCity, selectedType, searchQuery, emergencyMode, filterOpenNow, filterLanguage, showSavedOnly, favorites, view]);


  // KEYBOARD HANDLER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHelp) {
        if (e.key === 'Escape' || e.key === 'H') setShowHelp(false);
        e.preventDefault();
        return;
      }
      if (showStats) {
        if (e.key === 'Escape') setShowStats(false);
        return;
      }

      // Global Shortcuts
      if (e.key === 'H' && e.shiftKey) { setShowHelp(true); return; }
      if (e.key === '!') {
        setEmergencyMode(p => !p);
        playAlertSound(); // Alert sound for emergency mode
        trackEvent('emergency');
        return;
      }
      if (e.key === 'C' && e.shiftKey) { setIsCliMode(true); return; }

      // Detail View Overlay
      if (viewResource) {
        if (e.key === 'Escape') { setViewResource(null); playBeep(300); }
        if (e.key === 'f' || e.key === 'F') toggleFavorite(viewResource.id);
        return;
      }

      // VIEW: INTRO / PURPOSE
      if (view === 'INTRO' && e.key === 'Enter') setView('PURPOSE');
      if (view === 'PURPOSE' && e.key === 'Enter') setView('CONSOLE');

      // VIEW: CONSOLE
      if (view === 'CONSOLE') {
        // Tab - Switch Focus
        if (e.key === 'Tab') {
          e.preventDefault();
          setFocusArea(prev => prev === 'SIDEBAR' ? 'CONTENT' : 'SIDEBAR');
          playBeep(400);
          return;
        }

        // Sidebar Navigation
        if (focusArea === 'SIDEBAR') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const currIdx = types.findIndex(t => t.id === selectedType);
            let nextIdx = e.key === 'ArrowUp' ? currIdx - 1 : currIdx + 1;
            if (nextIdx < 0) nextIdx = types.length - 1;
            if (nextIdx >= types.length) nextIdx = 0;
            setSelectedType(types[nextIdx].id);
            if (!showSavedOnly) setSearchQuery('');
            playNavigationSound(); // Navigation beep
          }
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const currIdx = cities.indexOf(selectedCity!);
            let nextIdx = e.key === 'ArrowLeft' ? currIdx - 1 : currIdx + 1;
            if (nextIdx < 0) nextIdx = cities.length - 1;
            if (nextIdx >= cities.length) nextIdx = 0;
            setSelectedCity(cities[nextIdx]);
            playNavigationSound(); // Navigation beep
          }
        }

        // Content Navigation
        if (focusArea === 'CONTENT') {
          if (e.key === 'ArrowUp') {
            setSelectedIndex(p => p > 0 ? p - 1 : filteredResources.length - 1);
            playNavigationSound(); // Navigation beep
          }
          if (e.key === 'ArrowDown') {
            setSelectedIndex(p => p < filteredResources.length - 1 ? p + 1 : 0);
            playNavigationSound(); // Navigation beep
          }
          if (e.key === 'Enter') {
            if (filteredResources[selectedIndex]) {
              setViewResource(filteredResources[selectedIndex]);
              playSelectSound(); // Selection confirmation
            }
          }
          if (e.key === 'o' || e.key === 'O') setFilterOpenNow(p => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, focusArea, selectedIndex, filteredResources, selectedType, selectedCity, showHelp, viewResource, showSavedOnly]);



  // ---- Components ----

  const HelpOverlay = () => (
    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="border-4 border-double border-green-500 p-8 w-full max-w-3xl bg-black shadow-lg">
        <h2 className="text-2xl text-amber-500 font-bold mb-6 border-b border-green-900 pb-2">AVAILABLE COMMANDS</h2>
        <div className="grid grid-cols-2 gap-8 text-green-300 font-mono text-lg">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Navigation</h3>
            <div className="flex justify-between"><span>↑ ↓ → ←</span> <span className="text-gray-500">Navigate</span></div>
            <div className="flex justify-between"><span>Tab</span> <span className="text-gray-500">Switch Area</span></div>
            <div className="flex justify-between"><span>Enter</span> <span className="text-gray-500">Select</span></div>
            <div className="flex justify-between"><span>Esc</span> <span className="text-gray-500">Go Back</span></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Actions</h3>
            <div className="flex justify-between"><span>Type 'text'</span> <span className="text-gray-500">Search</span></div>
            <div className="flex justify-between"><span>O</span> <span className="text-gray-500">Toggle Open Now</span></div>
            <div className="flex justify-between"><span>F</span> <span className="text-gray-500">Favorite</span></div>
            <div className="flex justify-between"><span>!</span> <span className="text-gray-500">Emergency Mode</span></div>
            <div className="flex justify-between"><span>Shift+C</span> <span className="text-gray-500">CLI Mode</span></div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 blink border-t border-green-900 pt-4">
          Press Esc to close
        </div>
      </div>
    </div>
  );

  const NotificationBanner = () => {
    if (!notification) return null;
    return (
      <div className="absolute top-0 left-0 right-0 bg-green-900 text-green-100 text-center py-2 font-bold font-mono border-b border-green-500 z-40 animate-pulse">
        &gt; {notification}
      </div>
    );
  };

  const EmergencyBanner = () => (
    <div className="bg-red-900 text-white text-center py-2 border-y-2 border-red-500 mb-4 animate-pulse">
      <div className="font-bold tracking-widest uppercase">EMERGENCY MODE ACTIVE</div>
      <div className="text-sm">Showing nearest urgent-help resources</div>
    </div>
  );



  // ---- Renderers ----

  const renderConsole = () => (
    <div className="flex h-full w-full gap-6">
      {/* SIDEBAR - 30% */}
      <div className="w-1/3 min-w-[260px] h-full card bg-slate-900 flex flex-col">
        <Sidebar
          selectedType={!showSavedOnly ? selectedType : null}
          onSelect={(t) => { setSelectedType(t); setShowSavedOnly(false); setSearchQuery(''); }}
          isFocused={focusArea === 'SIDEBAR' && !showSavedOnly}
        />

        {/* Sidebar Footer: Map & Saved */}
        <div className="mt-auto p-4 border-t border-gray-800 space-y-3">
          {showMap && (
            <div className="flex justify-center mb-2">
              <AsciiMap resources={filteredResources} selectedId={null} userLocation={{ x: 5, y: 5 }} />
            </div>
          )}

          <button
            onClick={() => setShowSavedOnly(true)}
            className={`w-full py-2 px-4 rounded text-sm font-bold tracking-wide uppercase flex items-center justify-between transition-all ${showSavedOnly ? 'bg-amber-900/40 text-amber-500 ring-1 ring-amber-500' : 'text-gray-500 hover:text-amber-500 hover:bg-amber-900/20'}`}
          >
            <span>★ Saved Items</span>
            <span>{favorites.length}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => setShowSubmission(true)} className="py-1 px-2 border border-teal-800 text-teal-500 rounded text-[10px] hover:bg-teal-900/30 uppercase">
              + Add Data
            </button>
            <button onClick={clearAllData} className="py-1 px-2 border border-red-900 text-red-500 rounded text-[10px] hover:bg-red-900/30 uppercase">
              Reset App
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - 70% */}
      <div className={`flex-1 h-full flex flex-col relative card p-0 ${focusArea === 'CONTENT' ? 'border-teal-400' : 'border-slate-700'}`}>

        {/* Header - Filters */}
        <div className="flex flex-col p-4 border-b border-gray-800 bg-slate-800/30 gap-4">
          {/* Row 1: City & Search */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Region</span>
              <div className="text-base font-bold text-white bg-slate-800 px-6 py-1.5 rounded border border-slate-700 font-mono">&lt; &nbsp;{selectedCity}&nbsp; &gt;</div>
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-teal-300 focus:outline-none focus:border-teal-500 font-mono placeholder-gray-600"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2) trackEvent('searches');
                  playTypeSound(); // Typing sound for retro feel
                }}
              />
            </div>
          </div>

          {/* Row 2: Toggles */}
          <div className="flex flex-wrap gap-4 items-center text-xs">
            <button onClick={() => setFilterOpenNow(p => !p)} className={`px-3 py-1.5 rounded border transition-colors ${filterOpenNow ? 'bg-green-900/30 border-green-500 text-green-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
              {filterOpenNow ? '◉ OPEN NOW' : '○ OPEN NOW'}
            </button>

            <div className="h-4 w-px bg-gray-700"></div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 uppercase font-bold tracking-wider">Lang:</span>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-gray-300 rounded px-2 py-1 outline-none focus:border-teal-500"
              >
                {availableLanguages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="h-4 w-px bg-gray-700"></div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 uppercase font-bold tracking-wider">Transport:</span>
              <div className="flex border border-slate-700 rounded overflow-hidden">
                {(['walking', 'bus', 'car'] as TransportMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setTransportMode(m)}
                    className={`px-3 py-1 transition-colors ${transportMode === m ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-gray-500'}`}
                  >
                    {m === 'walking' && '🚶'} {m === 'bus' && '🚌'} {m === 'car' && '🚗'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-4 w-px bg-gray-700"></div>

            <div className="flex gap-2">
              <button onClick={() => { setEmergencyMode(p => !p); if (!emergencyMode) trackEvent('emergency'); }} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${emergencyMode ? 'bg-red-600 text-white animate-pulse' : 'bg-red-900/30 text-red-500 border border-red-900'}`}>
                {emergencyMode ? '! ACTIVE' : '! SOS'}
              </button>
              <button onClick={() => setShowMap(p => !p)} className={`px-3 py-1.5 rounded text-xs border transition-colors ${showMap ? 'bg-teal-900/30 border-teal-500 text-teal-400' : 'border-gray-700 text-gray-500'}`}>
                MAP
              </button>
              <button onClick={() => setShowStats(true)} className="px-2 py-0.5 rounded text-[10px] border border-gray-700 text-gray-500 hover:text-white">
                STATS
              </button>
              <button onClick={() => setIsCliMode(true)} className="px-2 py-0.5 rounded text-[10px] border border-gray-700 text-gray-500 hover:text-white">
                CLI
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-auto p-4 space-y-2 bg-slate-900/50">
          {filteredResources.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 space-y-4">
              <div className="text-4xl opacity-20">∅</div>
              <div className="text-lg font-bold">No resources found</div>
              <div className="text-sm opacity-60 max-w-xs text-center">
                Try adjusting filters or search query.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredResources.map((r, i) => {
                const isSelected = i === selectedIndex && focusArea === 'CONTENT';
                const open = isOpenNow(r.hours);
                const transportTime = r.transport_estimates ? r.transport_estimates[transportMode] : 'N/A';

                return (
                  <div
                    key={r.id}
                    className={`
                          card p-4 cursor-pointer flex justify-between items-center transition-all
                          ${isSelected ? 'active shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_30px_rgba(6,214,160,0.3)]' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(6,214,160,0.15)]'}
                          ${r.priority === 'High' ? 'border-l-4 border-l-pink-500 shadow-[0_0_15px_rgba(255,0,110,0.2)]' : ''}
                       `}
                    onClick={() => {
                      setSelectedIndex(i);
                      setFocusArea('CONTENT');
                      setViewResource(r);
                      trackEvent('views');
                    }}
                  >
                    <div>
                      <div className="mb-1">
                        <span className={`text-lg font-bold block ${isSelected ? 'text-teal-300' : 'text-gray-200'}`} style={isSelected ? { textShadow: '0 0 10px rgba(6, 214, 160, 0.5)' } : {}}>{r.name}</span>
                      </div>
                      <div className="flex gap-2 items-center mb-2">
                        {open ? <span className="text-[9px] text-green-300 border border-green-700 bg-green-900/30 px-1.5 py-0.5 rounded uppercase">Open</span> : <span className="text-[9px] text-red-300 border border-red-800 bg-red-900/30 px-1.5 py-0.5 rounded uppercase">Closed</span>}
                        {r.is_emergency && <span className="text-[9px] text-pink-300 border border-pink-700 bg-pink-900/30 px-1.5 py-0.5 rounded uppercase">Urgent</span>}
                        {r.capacity_status && <span className="text-[9px] text-teal-300 border border-teal-700 bg-teal-900/30 px-1.5 py-0.5 rounded uppercase">{r.capacity_status}</span>}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>{r.address.split(',')[0]}</span>
                        <span className="text-gray-600">|</span>
                        <span className="flex items-center gap-1">
                          {transportMode === 'walking' ? '🚶' : transportMode === 'bus' ? '🚌' : '🚗'} {transportTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div className="font-mono">{r.phone}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div >
  );

  const renderIntro = () => (
    <div className="boot-screen">
      <div className="center-card narrative-box">
        <Typewriter
          lines={[
            "> Initializing SOS: System of Support...",
            "> Internet unavailable.",
            "> You are in a new city.",
            "> You need help.",
            "> Access help. Anywhere. Anytime."
          ]}
          speed={40}
          onComplete={() => setShowIntroContinue(true)}
        />

        {showIntroContinue && (
          <div className="boot-hint">
            Press [Enter] to Continue
          </div>
        )}
      </div>
    </div>
  );


  const renderPurpose = () => (
    <div className="purpose-container">
      <div className="purpose-card">
        <div>
          <h1 className="purpose-title">SOS: SYSTEM OF SUPPORT</h1>
          <p className="purpose-subtitle">Access help. Anywhere. Anytime.</p>
          <p className="purpose-desc">Offline-First Emergency Response System</p>
        </div>

        <div className="purpose-list">
          <span className="purpose-pill">FOOD</span>
          <span className="purpose-pill">SHELTER</span>
          <span className="purpose-pill">POLICE</span>
          <span className="purpose-pill">HOSPITAL</span>
        </div>

        <div className="purpose-footer">
          <p>No internet required. Data is locally cached.</p>
        </div>
      </div>

      <div className="press-enter-hint">
        PRESS [ENTER] TO ACCESS TERMINAL
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!viewResource) return null;
    const isFav = favorites.includes(viewResource.id);
    const isOpen = isOpenNow(viewResource.hours);

    return (
      <div className="h-full w-full flex justify-center items-center overflow-hidden p-4 md:p-8">
        <div className="w-full max-w-[95%] mx-auto flex flex-col h-full bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden relative shadow-2xl">
          {emergencyMode && <EmergencyBanner />}

          {/* Top Navigation Bar - Fixed */}
          <div className="bg-slate-900/90 border-b border-gray-800 p-3 shrink-0 z-10 backdrop-blur flex justify-center items-center">
            <button
              onClick={() => { setViewResource(null); setFocusArea('CONTENT'); }}
              className="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded transition-colors"
            >
              <span className="text-xs">◀</span> <span className="text-sm font-bold tracking-wider">BACK TO LIST</span>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 flex-1 overflow-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 text-center md:text-left">{viewResource.name}</h1>
                <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                  <span className={`badge ${isOpen ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{isOpen ? 'OPEN NOW' : 'CLOSED'}</span>
                  {viewResource.is_emergency && <span className="badge badge-alert">EMERGENCY</span>}
                  {viewResource.id.startsWith('local-') && <span className="badge badge-primary bg-blue-900 text-blue-300">USER ADDED</span>}
                  {viewResource.name.startsWith('[Demo]') && <span className="badge badge-primary bg-purple-900 text-purple-300">DEMO DATA</span>}
                  <span className="badge badge-muted uppercase">{viewResource.type}</span>
                  {viewResource.languages.map(l => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-400">{l}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => toggleFavorite(viewResource.id)} className={`text-xl font-bold ${isFav ? 'text-yellow-400' : 'text-gray-600 hover:text-amber-500'}`} style={isFav ? { color: '#facc15', textShadow: '0 0 10px rgba(250, 204, 21, 0.8)' } : {}}>
                  {isFav ? '★ Saved' : '☆ Save'}
                </button>
                {viewResource.verified_by && (
                  <div className="badge badge-muted bg-teal-900/30 text-teal-400 border border-teal-800">
                    ✓ VERIFIED BY {viewResource.verified_by.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Col */}
              <div className="space-y-6">
                <div className="card bg-slate-900/50 p-4 border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-teal-500 text-center">Actions</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <a href={`tel:${viewResource.phone}`} className="badge badge-primary justify-center py-3 text-sm hover:brightness-125 no-underline">
                      📞 CALL
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(viewResource.address); showNotification('Address copied'); }} className="badge badge-muted justify-center py-3 text-sm hover:bg-slate-700">
                      📋 COPY ADDR
                    </button>
                  </div>
                  <button onClick={() => { alert('Connect to internet for standard maps.'); }} className="w-full badge badge-muted justify-center py-2 text-sm hover:bg-slate-700">
                    🗺️ GET DIRECTIONS
                  </button>
                </div>

                <div className="card bg-slate-900/50 p-4 border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">Location & Contact</h3>
                  <div className="mb-4">
                    <AsciiMap resources={resources} selectedId={viewResource.id} userLocation={{ x: 5, y: 5 }} />
                  </div>
                  <div className="text-base text-gray-200 mb-2 text-center">{viewResource.address}</div>
                  <div className="text-xl text-teal-400 font-mono mb-2 text-center">{viewResource.phone}</div>
                </div>


                <div className="card bg-slate-900/50 p-4 border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">Status</h3>
                  <p className="mb-2 text-center"><span className="text-gray-400">Hours:</span> {viewResource.hours}</p>
                  <p className="mb-2 text-center"><span className="text-gray-400">Capacity:</span> {viewResource.capacity_status || 'Unknown'}</p>
                </div>
              </div>

              {/* Right Col */}
              <div className="space-y-6">
                <div className="card bg-slate-900/50 p-4 border-gray-800 h-full flex flex-col">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-teal-500 text-center">Services Provided</h3>
                  <ul className="space-y-2 mb-6 list-none" style={{ paddingLeft: 0, textAlign: 'center', listStyle: 'none' }}>
                    {viewResource.services.map(s => (
                      <li key={s} className="text-gray-300" style={{ textAlign: 'center', listStyleType: 'none' }}>
                        › {s}
                      </li>
                    ))}
                  </ul>

                  <div className="card bg-slate-900/50 p-4 border-gray-800">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-teal-500 text-center">Eligibility</h3>
                    <p className="text-gray-400 text-sm mb-6 text-center">{viewResource.eligibility || 'Open to all.'}</p>

                    {viewResource.micro_guide && (
                      <div className="pro-guide-box">
                        <div className="pro-guide-header">
                          💡 PRO GUIDE
                        </div>
                        <div className="pro-guide-content">
                          {viewResource.micro_guide}
                        </div>
                      </div>
                    )}

                    {viewResource.volunteer_info && (
                      <div className="mb-6 p-3 border border-dashed border-gray-600 rounded bg-slate-900/80">
                        <h3 className="text-xs font-bold text-amber-500 uppercase mb-2 text-center">🤝 Help This Cause</h3>
                        <p className="text-sm text-gray-300 mb-1 text-center">Volunteers needed: <span className="text-white">{viewResource.volunteer_info.role}</span></p>
                        <p className="text-xs text-gray-400 text-center">Contact: {viewResource.volunteer_info.contact}</p>
                        {viewResource.donation_info && (
                          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-green-400">
                            Donation: {viewResource.donation_info}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-gray-800">
                      <button onClick={() => reportIssue(viewResource.name)} className="text-xs text-red-400 hover:text-red-300 underline">
                        ⚠ Report Issue / Suggest Edit
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              <OfflineFooter className="mt-8 pt-4 border-t border-gray-800 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'INTRO') {
    return renderIntro();
  }

  if (view === 'PURPOSE') {
    return (
      <TerminalLayout header="SYSTEM BOOT">
        {renderPurpose()}
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout header={emergencyMode ? 'EMERGENCY MODE' : 'RESOURCE HUB'}>
      <NotificationBanner />
      {showHelp && <HelpOverlay />}
      {showStats && <StatsDashboard onClose={() => setShowStats(false)} />}
      {isCliMode && <CliMode onExit={() => setIsCliMode(false)} />}
      {showSubmission && <ResourceSubmission onClose={() => setShowSubmission(false)} onSubmit={handleAddResource} />}

      {!viewResource && !isCliMode && renderConsole()}
      {viewResource && !isCliMode && renderDetail()}

      {hasConsented === null && <ConsentDialog onConsent={handleConsent} />}
    </TerminalLayout>
  );

}



const OfflineFooter = ({ className }: { className?: string }) => (
  <div className={`text-xs text-gray-600 flex justify-between items-center ${className}`}>
    <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-green-500 blink"></span><span>OFFLINE MODE: ON</span></div>
    <div>DATA: DEC 2025</div>
  </div>
);

export default App;
