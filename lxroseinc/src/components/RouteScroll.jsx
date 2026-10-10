import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Each history entry keeps its own position; new page visits start at the top.
export default function RouteScroll() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const currentKey = useRef(location.key);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const save = () => positions.current.set(currentKey.current, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      window.history.scrollRestoration = previous;
    };
  }, []);
  useLayoutEffect(() => {
    currentKey.current = location.key;
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    } else {
      window.scrollTo({ top: navigationType === 'POP' ? positions.current.get(location.key) || 0 : 0, behavior: 'instant' });
    }
  }, [location.key, location.hash, navigationType]);
  return null;
}
