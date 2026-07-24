import { createContext, useContext, useEffect, ReactNode } from 'react'
import Lenis from '@studio-freight/lenis'
import { useLenis } from '../hooks'

interface LenisContextValue {
    lenis: Lenis | null
}

const LenisContext = createContext<LenisContextValue | null>(null)

export const LenisProvider = ({ children }: { children: ReactNode }) => {
    const lenis = useLenis()

    if (import.meta.env.DEV) {
        useEffect(() => {
            if (lenis) {
                window.__lenis__ = lenis
            }
            return () => {
                delete window.__lenis__
            }
        }, [lenis])
    }

    return (
        <LenisContext.Provider value={{ lenis }}>
            {children}
        </LenisContext.Provider>
    )
}

export const useLenisContext = (): Lenis => {
    const context = useContext(LenisContext)
    if (!context) {
        throw new Error('useLenisContext must be used within a LenisProvider')
    }
    return context.lenis as Lenis
}

export default LenisProvider