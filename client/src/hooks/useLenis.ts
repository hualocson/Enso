import { useEffect, useRef } from 'react'
import Lenis, { type LenisOptions } from '@studio-freight/lenis'

export const useLenis = (): Lenis | null => {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            touchMultiplier: 2,
            smoothTouch: false,
            normalizeWheel: true,
        } as LenisOptions)

        lenisRef.current = lenis

        function raf(time: number): void {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return lenisRef.current
}