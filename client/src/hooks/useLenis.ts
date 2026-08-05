import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

export function useLenis() {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 2,
      syncTouch: false,
    });

    setLenis(lenisInstance);

    const raf = (time: number) => {
      lenisInstance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return lenis;
}
