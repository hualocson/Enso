import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, CreatePost } from './pages'
import { Header } from './components'
import Footer from './components/Footer'
import { useLenis } from './hooks'

const App = () => {
    const lenis = useLenis()

    useEffect(() => {
        if (!lenis) return

        const onScroll = () => {
            lenis.scrollTo(window.scrollY, { immediate: true })
        }

        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [lenis])

    return (
        <BrowserRouter>
            <Header />
            <main className="w-full bg-background min-h-[calc(100vh-49px)]">
                <div className="max-w-7xl mx-auto sm:p-8 px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/create-post" element={<CreatePost />} />
                    </Routes>
                </div>
            </main>
            <Footer />
        </BrowserRouter>
    )
}

export default App