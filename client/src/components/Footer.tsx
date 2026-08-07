const Footer = () => {
  return <footer className="bg-[#111]">
    <div className="flex flex-col gap-10 px-8 pt-16 pb-16">

      {/* Bottom */}
      <div className="flex flex-col items-start justify-between gap-4 pt-6 text-sm text-neutral-500 dark:border-neutral-800 md:flex-row md:items-center">
        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/hualocson/enso"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-neutral-900 dark:hover:text-white"
          >
            GitHub
          </a>

          <a
            href="https://locson-me.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-neutral-900 dark:hover:text-white"
          >
            Portfolio
          </a>
        </nav>
      </div>

      {/* Brand */}
      <h2 className="text-6xl tracking-tight text-[#9B948C] md:text-9xl">
        Enso<span className="font-sans text-6xl align-super">©</span>
      </h2>
    </div>
  </footer>


}

export default Footer
