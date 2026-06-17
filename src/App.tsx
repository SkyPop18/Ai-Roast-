import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { generateRoast, fetchUsage, fetchStats } from './services/gemini';
import type { RoastResponse } from './services/gemini';
import { useLocalStorage } from './hooks/useAnimations';

import { Navbar } from './components/Navbar';
import { FloatingDecos } from './components/FloatingDecos';
import { HeroSection, Marquee } from './components/HeroSection';
import { CategorySelector } from './components/CategorySelector';
import { RoastInput } from './components/RoastInput';
import { RoastResult } from './components/RoastResult';
import { StatsSection } from './components/StatsSection';
import { RoastHistory, makeHistoryEntry } from './components/RoastHistory';
import type { HistoryEntry } from './components/RoastHistory';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DailyUsage {
  date: string;
  count: number;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

function App() {
  const [darkMode, setDarkMode]   = useLocalStorage('darkMode', false);
  const [history, setHistory]     = useLocalStorage<HistoryEntry[]>('roastHistory', []);
  const [dailyUsage, setDailyUsage] = useLocalStorage<DailyUsage>('dailyUsage', { date: '', count: 0 });
  const [stats, setStats]         = useLocalStorage('roastStats', {
    totalRoasts: 42189,
    usersEmoDamaged: 39847,
    avgBurnTemp: 4500,
    todaysVictims: 217,
  });

  const [inputText, setInputText] = useState('');
  const [category, setCategory]   = useState('Startup');
  const [style, setStyle]         = useState('Funny');
  const [length, setLength]       = useState('short');
  const [intensity, setIntensity] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult]       = useState<RoastResponse | null>(null);
  const [toasts, setToasts]       = useState<ToastState[]>([]);
  const [appMode, setAppMode]     = useState<string>('test');
  const resultRef = useRef<HTMLDivElement>(null);

  const roastsRemaining = useMemo(() => {
    if (appMode === 'test') return Infinity;
    const limit = length === 'long' ? 1 : length === 'medium' ? 2 : 3;
    if (dailyUsage.date !== todayStr()) return limit;
    return Math.max(0, limit - dailyUsage.count);
  }, [dailyUsage, appMode, length]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    fetchUsage().then(({ count, appMode: serverMode }) => {
      if (serverMode) setAppMode(serverMode);
      if (serverMode === 'test') return;

      setDailyUsage({ date: todayStr(), count });
    }).catch(() => {});

    fetchStats().then(data => {
      setStats({
        totalRoasts: data.totalRoasts,
        usersEmoDamaged: data.usersEmoDamaged,
        avgBurnTemp: data.avgBurnTemp,
        todaysVictims: data.todaysVictims,
      });
    }).catch(() => {});
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(t => [...t.slice(-2), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleRoast = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    if (appMode !== 'test' && roastsRemaining <= 0) return;

    setIsLoading(true);
    setResult(null);

    try {
      const roastResult = await generateRoast({
        input: inputText.trim(),
        category,
        style,
        length,
        intensity,
      });

      setResult(roastResult);

      if (appMode === 'production') {
        setDailyUsage({
          date: todayStr(),
          count: roastResult.count !== undefined ? roastResult.count : (dailyUsage.count + 1)
        });
      }

      const entry = makeHistoryEntry(
        inputText.trim(), category, style, length, intensity, roastResult
      );
      setHistory(prev => [entry, ...prev].slice(0, 20));

      if (roastResult.stats) {
        setStats({
          totalRoasts: roastResult.stats.totalRoasts,
          usersEmoDamaged: roastResult.stats.usersEmoDamaged,
          avgBurnTemp: roastResult.stats.avgBurnTemp,
          todaysVictims: roastResult.stats.todaysVictims,
        });
      } else {
        setStats(prev => ({
          totalRoasts: prev.totalRoasts + 1,
          usersEmoDamaged: prev.usersEmoDamaged + (roastResult.damageLevel >= 3 ? 1 : 0),
          avgBurnTemp: Math.round(prev.avgBurnTemp + 20),
          todaysVictims: prev.todaysVictims + 1,
        }));
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

      if (roastResult.fromCache) {
        showToast('⚡ Served from cache — same roast, instant speed!', 'info');
      }

    } catch (err: any) {
      if (err?.limitReached) {
        showToast(err?.message || 'Daily limit reached for this length. Come back tomorrow!', 'error');
        const limit = length === 'long' ? 1 : length === 'medium' ? 2 : 3;
        setDailyUsage({
          date: todayStr(),
          count: err.count !== undefined ? err.count : limit
        });
      } else {
        showToast(err?.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, category, style, length, intensity, isLoading, roastsRemaining, appMode, dailyUsage,
      showToast, setHistory, setStats, setDailyUsage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && inputText.trim() && (appMode === 'test' || roastsRemaining > 0)) handleRoast();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRoast, isLoading, inputText, roastsRemaining, appMode]);

  const handleCopy = useCallback(() => {
    if (!result?.roast) return;
    navigator.clipboard.writeText(result.roast).then(() => {
      showToast('Roast copied to clipboard! 📋', 'success');
    }).catch(() => {
      showToast('Could not copy — try manually', 'error');
    });
  }, [result, showToast]);

  const handleShare = useCallback(() => {
    if (!result?.roast) return;
    const text = `🔥 I just created a savage roast with AIROAST!\n\n"${result.roast.slice(0, 200)}${result.roast.length > 200 ? '...' : ''}"\n\nScore: ${result.score}/100 — ${result.damageLabel}\n\nCreate yours: https://airoast.ai`;
    if (navigator.share) {
      navigator.share({ title: '🔥 Roast by AIROAST', text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Share text copied! Paste it anywhere 🔗', 'success');
      });
    }
  }, [result, showToast]);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setInputText(entry.input);
    setCategory(entry.category);
    setStyle(entry.style || 'Funny');
    setLength(entry.length || 'short');
    setIntensity(entry.intensity || 3);
    setResult({
      roast: entry.roast,
      score: entry.score,
      damageLevel: entry.damageLevel,
      damageLabel: entry.damageLabel,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    showToast('History cleared 🗑', 'info');
  }, [setHistory, showToast]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <FloatingDecos />

      <Navbar
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />

      <Marquee />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />

        <div className="brut-divider" />

        <CategorySelector selected={category} onSelect={setCategory} />

        <RoastInput
          value={inputText}
          onChange={setInputText}
          onRoast={handleRoast}
          isLoading={isLoading}
          style={style}
          onStyleChange={setStyle}
          length={length}
          onLengthChange={setLength}
          intensity={intensity}
          onIntensityChange={setIntensity}
          roastsRemaining={roastsRemaining}
        />

        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {result && (
              <RoastResult
                key={result.roast}
                result={result}
                onCopy={handleCopy}
                onShare={handleShare}
                showToast={showToast}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="brut-divider" />

        <StatsSection stats={stats} />

        <RoastHistory
          history={history}
          onSelectEntry={handleSelectHistory}
          onClear={handleClearHistory}
        />
      </main>

      <Footer />

      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        gap: '10px', alignItems: 'flex-end',
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              onClose={() => dismissToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
