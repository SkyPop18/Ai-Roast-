import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const startVal = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (target - startVal) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return count;
}

export function useTypewriter(text: string, speed: number = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const iRef = useRef(0);
  const timeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(false); return; }
    iRef.current = 0;
    setDisplayed('');
    setDone(false);

    const type = () => {
      if (iRef.current < text.length) {
        setDisplayed(text.slice(0, iRef.current + 1));
        iRef.current++;
        timeRef.current = setTimeout(type, speed);
      } else {
        setDone(true);
      }
    };

    timeRef.current = setTimeout(type, speed);
    return () => { if (timeRef.current) clearTimeout(timeRef.current); };
  }, [text, speed]);

  return { displayed, done };
}

export function useInView(threshold: number = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  const set = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { }
      return next;
    });
  };

  return [value, set] as const;
}
