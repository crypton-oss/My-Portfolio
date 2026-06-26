import { useEffect, useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import SkillsSection from './components/SkillsSection'
import ContactSection from './components/ContactSection'
import Navbar from './components/Navbar'
import IosLoginScreen from './components/IosLoginScreen'
import AdminPanel from './components/AdminPanel'
import FakeAdminLogin from './components/FakeAdminLogin'
import useDeviceTracking from './hooks/useDeviceTracking'
import { LocaleProvider } from './i18n/LocaleContext'
import './App.css'

const LOADING_DURATION = 3500

const SECTION_IDS = ['home', 'about', 'project', 'skills', 'contact']

type Theme = 'dark' | 'light'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  
  const [, forceRender] = useState(0)

  useDeviceTracking()

  // Admin Panel Route States
  const [isAdminRoute, setIsAdminRoute] = useState<'crypton' | 'fake' | false>(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Check URL pathname and hash for admin routes
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname
      const hash = window.location.hash
      if (path.startsWith('/admin') || hash === '#admin') {
        setIsAdminRoute('fake')
      } else if (path.startsWith('/crypton-admin') || hash === '#crypton-admin') {
        setIsAdminRoute('crypton')
      } else {
        setIsAdminRoute(false)
      }
    }

    checkRoute()

    window.addEventListener('popstate', checkRoute)
    window.addEventListener('hashchange', checkRoute)

    return () => {
      window.removeEventListener('popstate', checkRoute)
      window.removeEventListener('hashchange', checkRoute)
    }
  }, [])

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setIsExiting(true)
    }, LOADING_DURATION)

    const hideTimer = window.setTimeout(() => {
      setIsLoading(false)
      setShowContent(true)
    }, LOADING_DURATION + 500)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    if (isLoading || isAdminRoute !== false) return

    // Force re-render after mount so scrollStyle reads actual DOM positions
    forceRender((n) => n + 1)

    const handleScroll = () => {
      forceRender((n) => n + 1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isLoading, isAdminRoute])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Scroll-based section hide — glass fade on Hero, plain opacity fade on rest
  const scrollStyle = (sectionIndex: number): React.CSSProperties => {
    // Skip scroll-based opacity on mobile — it overrides visibility of hero content
    if (sectionIndex === 0 && window.innerWidth <= 900) return {}
    const el = document.getElementById(SECTION_IDS[sectionIndex])
    if (!el) return {}

    const rect = el.getBoundingClientRect()
    const delay = 0.4
    const progress = Math.max(0, Math.min(1, (-rect.top - rect.height * delay) / (rect.height * (1 - delay))))
    if (progress <= 0) return {}
    if (progress >= 1) return sectionIndex === 0
      ? { opacity: 0, filter: 'blur(16px)', transform: 'translateY(-60px)', pointerEvents: 'none' }
      : { opacity: 0, pointerEvents: 'none' }

    if (sectionIndex === 0) {
      return {
        opacity: 1 - progress,
        filter: `blur(${progress * 16}px)`,
        transform: `translateY(${-progress * 60}px)`,
        pointerEvents: progress > 0.5 ? 'none' : 'auto',
      }
    }

    return {
      opacity: 1 - progress,
      pointerEvents: progress > 0.5 ? 'none' : 'auto',
    }
  }

  const heroStyle = scrollStyle(0)
  const aboutStyle = scrollStyle(1)
  const projectsStyle = scrollStyle(2)
  const skillsStyle = scrollStyle(3)
  const contactStyle = scrollStyle(4)

  return (
    <LocaleProvider>
    <div className={`app app--${theme}`}>

      {/* Fake Admin Face Login Route (trap page at /admin) */}
      {isAdminRoute === 'fake' ? (
        <FakeAdminLogin />
      ) : isAdminRoute === 'crypton' ? (
        !isAdminAuthenticated ? (
          <IosLoginScreen 
            theme={theme} 
            onLoginSuccess={() => setIsAdminAuthenticated(true)} 
          />
        ) : (
          <AdminPanel 
            theme={theme} 
            onToggleTheme={toggleTheme} 
            onLogout={() => {
              setIsAdminAuthenticated(false)
              window.location.hash = ''
            }}
          />
        )
      ) : (
        /* Standard Portfolio Flow */
        <>
          {isLoading && <LoadingScreen exiting={isExiting} />}
          
          {!isLoading && (
            <>
              <Navbar visible={showContent} theme={theme} onToggleTheme={toggleTheme} />
              
              <div className="sections-container">
                <HeroSection
                  visible={showContent} 
                  theme={theme} 
                  style={heroStyle}
                />
                
                <AboutSection
                  visible={showContent} 
                  theme={theme} 
                  style={aboutStyle}
                />

                <ProjectsSection
                  visible={showContent} 
                  theme={theme} 
                  style={projectsStyle}
                />

                <SkillsSection
                  visible={showContent} 
                  theme={theme} 
                  style={skillsStyle}
                />

                <ContactSection
                  visible={showContent} 
                  theme={theme} 
                  style={contactStyle}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
    </LocaleProvider>
  )
}

export default App
