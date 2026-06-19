import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { navLinks, siteConfig } from '../config/site'
import './Navbar.css'

type NavbarProps = {
  visible: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Navbar({ visible, theme, onToggleTheme }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`navbar ${visible ? 'navbar--visible' : ''}`}>
      <div className="navbar__pill">
        <a href="#home" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <g clipPath="url(#navbarLogoClip)">
                <path d="M11.7499 9.42999L8.49992 15L7.86991 16.09L5.39991 20.31C5.21991 20.63 4.75992 20.64 4.55992 20.33L1.17991 15.28C1.06991 15.11 1.06991 14.89 1.17991 14.72L4.84993 9.22C4.93993 9.08 5.09991 9 5.26991 9H11.4999L11.7499 9.42999Z" />
                <path d="M22.8401 14.73L16.1401 3.25C16.0601 3.09 15.8901 3 15.7101 3H8.87012C8.48012 3 8.24012 3.42 8.44012 3.75L11.5001 9L11.7501 9.42999L14.5601 14.25C14.7601 14.58 14.5201 15 14.1301 15H8.50012L7.87012 16.09C8.05012 15.77 8.51011 15.76 8.71011 16.07L11.8501 20.78C11.9401 20.92 12.1001 21 12.2701 21H18.7301C18.9001 21 19.0601 20.92 19.1501 20.78L22.8301 15.26C22.9301 15.1 22.9401 14.9 22.8401 14.73Z" />
              </g>
              <defs>
                <clipPath id="navbarLogoClip">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          <span className="navbar__brand-name">{siteConfig.brand}</span>
        </a>

        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.label === 'Download CV' ? siteConfig.cvUrl : link.href}
              className={`navbar__link ${'accent' in link && link.accent ? 'navbar__link--accent' : ''}`}
              {...(link.label === 'Download CV' ? { download: true } : {})}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>

          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__icon-btn"
            aria-label="GitHub"
          >
            <span className="navbar__icon-btn-inner">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </span>
          </a>

          <a
            href={siteConfig.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__icon-btn"
            aria-label="Telegram"
          >
            <span className="navbar__icon-btn-inner">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}>
        <div className="navbar__drawer-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.label === 'Download CV' ? siteConfig.cvUrl : link.href}
              className={`navbar__drawer-link ${'accent' in link && link.accent ? 'navbar__drawer-link--accent' : ''}`}
              {...(link.label === 'Download CV' ? { download: true } : {})}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={closeMenu} />}
    </header>
  )
}
