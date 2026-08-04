import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, CreatePost } from './pages'
import Footer from './components/Footer'
import { LenisProvider } from './context'
import BottomBlur from './components/BottomBlur'

const App = () => {
  return (
    <LenisProvider>
      <BrowserRouter>
        <main className="w-full min-h-[calc(100vh-49px)]">
          <div className="sm:px-8 px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-post" element={<CreatePost />} />
            </Routes>
          </div>
        </main>
        <Footer />
        <BottomBlur />
      </BrowserRouter>
    </LenisProvider>
  )
}

export default App
