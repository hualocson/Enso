import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

export function useLenis(): Lenis | null {
    const [lenis, setLenis] = useState<Lenis | null>(null)
    const rafRef = useRef<number>()

    useEffect(() => {
        const lenisInstance = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            touchMultiplier: 2,
            syncTouch: false,
            wheelMultiplier: 1,
        })

        setLenis(lenisInstance)

        function raf(time: number) {
            try {
                lenisInstance.raf(time)
            } catch {
                // ignore RAF errors during unmount
            }
            rafRef.current = requestAnimationFrame(raf)
        }

        rafRef.current = requestAnimationFrame(raf)

        const onScrollStart = () => {
            lenisInstance.start()
        }

        const onScrollEnd = () => {
            lenisInstance.stop()
        }

        lenisInstance.on('scroll', onScrollStart)
        lenisInstance.on('scroll', onScrollEnd)

        return () => {
            lenisInstance.off('scroll', onScrollStart)
            lenisInstance.off('scroll', onScrollEnd)
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
            lenisInstance.destroy()
            setLenis(null)
        }
    }, [])

    return lenis
}

export default useLenis