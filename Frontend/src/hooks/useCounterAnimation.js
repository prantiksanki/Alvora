import { useEffect, useRef, useState } from 'react';

export function useCounterAnimation(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!target || target === 0) {
      setCount(0);
      return;
    }

    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      setCount(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timerRef.current);
    }, stepDuration);

    return () => clearInterval(timerRef.current);
  }, [target, duration]);

  return count;
}
