import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'
import { Home, CreatePost } from './pages'
import { Logo } from './components'

const App = () => {
    return (
        <BrowserRouter>
            <header className="w-full flex justify-between items-center bg-surface sm:px-8 px-4 py-4 border-b border-border">
                <Link to="/">
                    <Logo />
                </Link>

                <Link
                    to="/create-post"
                    className="font-medium bg-accent text-surface px-4 py-2 rounded-md"
                >
                    Create
                </Link>
            </header>
            <main className="sm:p-8 px-4 py-8 w-full bg-background min-h-[calc(100vh-73px)]">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create-post" element={<CreatePost />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}

export default App
