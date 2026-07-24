import Logo from "./Logo"

const Footer = () => {
  return <footer className="border-t border-neutral-200 bg-[#111] dark:border-neutral-800">
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16">
      {/* Brand */}
      <div className="flex items-center">
        {/* Replace with your logo */}
        <Logo size="lg" showText={false} customImageClassName="md:size-32" />

        <h2 className="text-3xl font-black tracking-tight text-[#9B948C] md:text-6xl">
          Enso
        </h2>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-6 text-sm text-neutral-500 dark:border-neutral-800 md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Enso</p>

        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/yourusername/enso"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-neutral-900 dark:hover:text-white"
          >
            GitHub
          </a>

          <a
            href="https://yourportfolio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-neutral-900 dark:hover:text-white"
          >
            Portfolio
          </a>
        </nav>
      </div>
    </div>
  </footer>


}

export default Footer
