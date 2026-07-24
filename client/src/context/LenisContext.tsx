import { createContext, useContext, ReactNode } from 'react'
import Lenis from 'lenis'
import { useLenis } from '../hooks'

interface LenisContextValue {
  lenis: Lenis | null
}

const LenisContext = createContext<LenisContextValue | null>(null)

export const LenisProvider = ({ children }: { children: ReactNode }) => {
  const lenis = useLenis()

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

declare global {
  interface Window {
    __lenis__?: Lenis
  }
}
