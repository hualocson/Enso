import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'
import { Home, CreatePost } from './pages'
import { Logo } from './components'

const App = () => {
    return (
        <BrowserRouter>
            <header className="w-full bg-surface border-b border-border">
                <div className="max-w-7xl mx-auto flex justify-between items-center sm:px-8 px-4 py-4">
                    <Link to="/">
                        <Logo />
                    </Link>

                    <Link
                        to="/create-post"
                        className="font-medium bg-accent text-surface px-4 py-2 rounded-md"
                    >
                        Create
                    </Link>
                </div>
            </header>
            <main className="w-full bg-background min-h-[calc(100vh-73px)]">
                <div className="max-w-7xl mx-auto sm:p-8 px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/create-post" element={<CreatePost />} />
                    </Routes>
                </div>
            </main>
        </BrowserRouter>
    )
}

export default App
