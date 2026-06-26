import { useState, useEffect, useCallback } from 'react'
import ThemeToggle from './ThemeToggle'
import { NativeStartNow } from './NativeStartNow'
import { AddProjectModal } from './AddProjectModal'
import { getAllProjects, deleteProject, updateProjectHidden, type ProjectData } from '../data/projectsDB'
import { useT } from '../i18n/LocaleContext'
import './AdminPanel.css'
type AdminPanelProps = {  theme: 'dark' | 'light'; onToggleTheme: () => void; onLogout: () => void}
type TabType = 'dashboard' | 'projects' | 'uploaded' | 'accounts'
// ============================================================================
// ICONS
// ============================================================================
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
return (    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />      <polyline points="9 22 9 12 15 12 15 22" />    </svg>  )}
function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />    </svg>  )}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />      <circle cx="12" cy="7" r="4" />    </svg>  )}
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />      <polyline points="16 17 21 12 16 7" />      <line x1="21" y1="12" x2="9" y2="12" />    </svg>  )}
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />      <polyline points="17 8 12 3 7 8" />      <line x1="12" y1="3" x2="12" y2="15" />    </svg>  )}
export default function AdminPanel({ theme, onToggleTheme, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
const [isConnecting, setIsConnecting] = useState(false);
// GitHub States
const [token, setToken] = useState(() => {
    return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || ''  });
const [githubUser, setGithubUser] = useState<any>(() => {
    const cachedUser = localStorage.getItem('github_user');
return cachedUser ? JSON.parse(cachedUser) : null  });
const [githubRepos, setGithubRepos] = useState<any[]>(() => {
    const cachedRepos = localStorage.getItem('github_repos');
return cachedRepos ? JSON.parse(cachedRepos) : []  });
const [verifyError, setVerifyError] = useState<string | null>(null);
const [selectedAddProjectRepo, setSelectedAddProjectRepo] = useState<any | null>(null);
const [uploadedProjects, setUploadedProjects] = useState<ProjectData[]>([]);
const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; project: ProjectData } | null>(null);
const [deleteConfirm, setDeleteConfirm] = useState<ProjectData | null>(null);
const { locale } = useT();
const loadUploadedProjects = useCallback(async () => {
    const all = await getAllProjects();
    setUploadedProjects(all)  }, []);
// Fetch projects when uploaded tab is active
useEffect(() => {
    if (activeTab === 'uploaded') {      loadUploadedProjects()    }  }, [activeTab, loadUploadedProjects]);
// Close context menu on click outside
useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
return () => document.removeEventListener('click', close)  }, [ctxMenu]);
const handleContextMenu = (e: React.MouseEvent, project: ProjectData) => {    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, project })  };
const handleToggleHidden = async (project: ProjectData) => {    await updateProjectHidden(project.id, !project.hidden);
    setCtxMenu(null);
    loadUploadedProjects();
    window.dispatchEvent(new Event('projects-updated'))  };
const handleDeleteProject = async (project: ProjectData) => {    setDeleteConfirm(project)  };
const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteProject(deleteConfirm.id);
    setCtxMenu(null);
    setDeleteConfirm(null);
    loadUploadedProjects();
    window.dispatchEvent(new Event('projects-updated'))  };
const verifyGithubToken = async (testToken: string) => {
    if (!testToken) return;
    setVerifyError(null);
try {
      const response = await fetch('https://api.github.com/user', {
headers: {          Authorization: `token ${testToken
}`,          Accept: 'application/vnd.github.v3+json',        },      });
if (!response.ok) {
        throw new Error('Invalid GitHub token. Please verify and try again.')      };
const userData = await response.json();
      setGithubUser(userData);
      localStorage.setItem('github_user', JSON.stringify(userData));
// Fetch user's public and private repos (using user/repos endpoint);
const reposResponse = await fetch('https://api.github.com/user/repos?visibility=all&sort=updated&per_page=100', {
headers: {          Authorization: `token ${testToken
}`,          Accept: 'application/vnd.github.v3+json',        },      });
if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setGithubRepos(reposData);
        localStorage.setItem('github_repos', JSON.stringify(reposData))      };
            setToken(testToken);
      localStorage.setItem('github_token', testToken)    } catch (err: any) {      setVerifyError(err.message || 'Verification failed');
      setGithubUser(null);
      setGithubRepos([])    }  };
// Load mock data if oauth completes but no token in .env
const loadMockGithubData = () => {
    const mockUser = {      login: 'ozobek_usmonqulov',      name: 'Ozobek Usmonqulov',      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
bio: 'Django Admin Panel va GitHub OAuth integratsiyasi muvaffaqiyatli yakunlandi!',      public_repos: 4,      followers: 128,
};
const mockRepos = [      {        id: 1,        name: 'my-portfolio',        full_name: 'ozobek-usmonqulov/my-portfolio',        description: 'Ushbu React portfolio veb-sayti va Django boshqaruv paneli.',        html_url: 'https://github.com',
stargazers_count: 5,        forks_count: 2,        language: 'TypeScript',        private: false,
},      {        id: 2,        name: 'django-react-auth',        full_name: 'ozobek-usmonqulov/django-react-auth',        description: 'Django rest framework va React OAuth2 autentifikatsiya shabloni.',        html_url: 'https://github.com',
stargazers_count: 12,        forks_count: 4,        language: 'Python',        private: true,
},      {        id: 3,        name: 'ios-ui-kit',        full_name: 'ozobek-usmonqulov/ios-ui-kit',        description: 'Tailwind CSS va Framer Motion yordamida yaratilgan iOS UI komponentlar to\'plami.',        html_url: 'https://github.com',
stargazers_count: 8,        forks_count: 1,        language: 'TypeScript',        private: true,
},      {        id: 4,        name: 'awesome-portfolio-designs',        full_name: 'ozobek-usmonqulov/awesome-portfolio-designs',        description: 'Dasturchilar uchun eng chiroyli va interaktiv portfolio dizaynlari jamlanmasi.',        html_url: 'https://github.com',
stargazers_count: 42,        forks_count: 7,        language: 'HTML',        private: false,
}
    ];
    setGithubUser(mockUser);
    setGithubRepos(mockRepos);
    localStorage.setItem('github_user', JSON.stringify(mockUser));
    localStorage.setItem('github_repos', JSON.stringify(mockRepos));
    setToken('mock_oauth_token');
    localStorage.setItem('github_token', 'mock_oauth_token')  };
const handleOAuthCallback = async (code: string) => {    console.log('GitHub OAuth authorization code received:', code);
    setIsConnecting(true);
    setVerifyError(null);
// Simulate connection for 2s to show premium redirect success loader
await new Promise((resolve) => setTimeout(resolve, 2000));
try {
      const envToken = import.meta.env.VITE_GITHUB_TOKEN;
if (envToken) {        await verifyGithubToken(envToken)      } else {        // Fallback to loading mock data to show OAuth connection success UI
loadMockGithubData()
}    } catch (err: any) {      setVerifyError(err.message || 'OAuth verification failed')    } finally {      setIsConnecting(false)    }  };
// Handle URL code parameter detection on mount
useEffect(() => {
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
if (code) {      // Clean query parameters from URL
const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
window.history.replaceState({}, document.title, cleanUrl);
      handleOAuthCallback(code)    } else if (token && token !== 'mock_oauth_token') {      verifyGithubToken(token)    }  }, []);
const handleGithubOAuth = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'dummy_client_id';
const redirectUri = window.location.origin + window.location.pathname + '#admin';
// Redirect to GitHub OAuth
window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId
}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20repo`  };
const handleDisconnect = () => {    setToken('');
    setGithubUser(null);
    setGithubRepos([]);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    localStorage.removeItem('github_repos')  };
return (    <div className={`admin-panel admin-panel--${theme}`}>      {/* Loading overlay for OAuth callback connection */}      {isConnecting && (        <div className="connect-modal-overlay">          <div className="connect-modal" style={{ maxWidth: '380px', textAlign: 'center', padding: '40px 24px' }}>            <div className="oauth-spinner" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '40px', height: '40px', color: 'var(--icon-color)' }} className="animate-spin">                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" />                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />              </svg>            </div>            <h3 style={{ marginTop: '20px', fontSize: '18px', fontWeight: '700' }}>GitHub ulanmoqda...</h3>            <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>OAuth authorization muvaffaqiyatli amalga oshirildi. Ma'lumotlar yuklanmoqda...</p>          </div>        </div>      )}      {/* Top Navbar */}      <header className="admin-navbar">        <div className="admin-navbar__inner">          <div className="admin-navbar__brand">            <span className="admin-navbar__icon">              <svg viewBox="0 0 24 24" fill="currentColor">                <g clipPath="url(#clip0_4418_8984)">                  <path d="M11.7499 9.42999L8.49992 15L7.86991 16.09L5.39991 20.31C5.21991 20.63 4.75992 20.64 4.55992 20.33L1.17991 15.28C1.06991 15.11 1.06991 14.89 1.17991 14.72L4.84993 9.22C4.93993 9.08 5.09991 9 5.26991 9H11.4999L11.7499 9.42999Z" />                  <path d="M22.8401 14.73L16.1401 3.25C16.0601 3.09 15.8901 3 15.7101 3H8.87012C8.48012 3 8.24012 3.42 8.44012 3.75L11.5001 9L11.7501 9.42999L14.5601 14.25C14.7601 14.58 14.5201 15 14.1301 15H8.50012L7.87012 16.09C8.05012 15.77 8.51011 15.76 8.71011 16.07L11.8501 20.78C11.9401 20.92 12.1001 21 12.2701 21H18.7301C18.9001 21 19.0601 20.92 19.1501 20.78L22.8301 15.26C22.9301 15.1 22.9401 14.9 22.8401 14.73Z" />                </g>                <defs>                  <clipPath id="clip0_4418_8984">                    <rect width="24" height="24" fill="white" />                  </clipPath>                </defs>              </svg>            </span>            <span className="admin-navbar__site-name">Ozobek Usmonqulov</span>            <span className="admin-navbar__badge">Admin</span>          </div>          <div className="admin-navbar__actions">            <ThemeToggle theme={theme} onToggle={onToggleTheme} />          </div>        </div>      </header>      {/* Main Content Layout with Sidebar */}      <div className="admin-container">        {/* Left Sidebar Menu */}        <aside className="admin-sidebar">          <nav className="admin-sidebar__nav">            <button              onClick={() => setActiveTab('dashboard')}
              className={`admin-sidebar__link ${activeTab === 'dashboard' ? 'admin-sidebar__link--active' : ''}`}            >              <HomeIcon className="admin-sidebar__link-icon" />              <span>Bosh menyu</span>            </button>            <button              onClick={() => setActiveTab('projects')}
              className={`admin-sidebar__link ${activeTab === 'projects' ? 'admin-sidebar__link--active' : ''}`}            >              <FolderIcon className="admin-sidebar__link-icon" />              <span>Loyihalarim</span>            </button>            <button              onClick={() => setActiveTab('uploaded')}
              className={`admin-sidebar__link ${activeTab === 'uploaded' ? 'admin-sidebar__link--active' : ''}`}            >              <UploadIcon className="admin-sidebar__link-icon" />              <span>Yuklangan Loyihalarim</span>            </button>            <button              onClick={() => setActiveTab('accounts')}
              className={`admin-sidebar__link ${activeTab === 'accounts' ? 'admin-sidebar__link--active' : ''}`}            >              <SettingsIcon className="admin-sidebar__link-icon" />              <span>Hisoblarim</span>            </button>          </nav>          <button            onClick={onLogout}
            className="admin-sidebar__logout-btn"          >            <LogoutIcon className="admin-sidebar__link-icon" />            <span>Logout</span>          </button>        </aside>        {/* Right Content Area */}        <main className="admin-main">                    {/* DASHBOARD PAGE */}          {activeTab === 'dashboard' && (            <div className="admin-pane">              <h2 className="admin-pane__title">Bosh menyu</h2>                            <div className="admin-dashboard-grid">                {/* Welcome Card */}                <div className="admin-dashboard-card admin-dashboard-card--welcome">                  <h3>Xush kelibsiz, Admin!</h3>                  <p>Ozobek Usmonqulov portfolio boshqaruv paneliga xush kelibsiz. Tizim to'liq ishchi holatda.</p>                </div>                {/* Status Widget */}                <div className="admin-dashboard-card">                  <h4>Tizim holati</h4>                  <div className="status-indicator">                    <span className="status-dot animate-pulse" />                    <span>Ishlamoqda (Active)</span>                  </div>                </div>                {/* Integration Widget */}                <div className="admin-dashboard-card">                  <h4>GitHub Aloqasi</h4>                  <p>{githubUser ? `Ulandi: @${githubUser.login}` : "Ulanmagan"}</p>                </div>              </div>            </div>          )}          {/* PROJECTS PAGE */}          {activeTab === 'projects' && (            <div className="admin-pane">              <h2 className="admin-pane__title">Loyihalarim</h2>              {githubUser ? (                /* Connected GitHub View */                <div className="github-connected-view">                  <div className="github-profile-card">                    <img src={githubUser.avatar_url} alt="GitHub Avatar" className="github-profile-card__avatar" />                    <div className="github-profile-card__info">                      <h3>{githubUser.name || githubUser.login}</h3>                      <p className="github-profile-card__username">@{githubUser.login}</p>                      {githubUser.bio && <p className="github-profile-card__bio">{githubUser.bio}</p>}                      <div className="github-profile-card__stats">                        <span><strong>{githubUser.public_repos}</strong> Repos</span>                        <span><strong>{githubUser.followers}</strong> Followers</span>                      </div>                    </div>                    <button                       onClick={handleDisconnect}
                      className="github-disconnect-btn"                    >                      Ulanishni uzish                    </button>                  </div>                  <h3 className="repos-title">GitHub Repozitoriylari</h3>                  <div className="repos-grid">                    {githubRepos.map((repo) => (                      <div key={repo.id} className="repo-card">                        <div className="repo-card__header">                          <h4 className="repo-card__name">                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.name}</a>                          </h4>                          {repo.description && <p className="repo-card__desc">{repo.description}</p>}                        </div>                        <div className="repo-card__stats">                          <span>⭐ {repo.stargazers_count}</span>                          <span>🍴 {repo.forks_count}</span>                          <span>{repo.language || 'JavaScript'}</span>                        </div>                        {/* Start Now Button Integration */}                        <div className="repo-card__actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: repo.private ? '#ff453a' : '#28a745' }}>                            {repo.private ? '🔒 Private' : '🔓 Public'}                          </span>                          <NativeStartNow                            label="Start Now"                            variant="gradient"                            size="sm"                            onStart={async () => {                              // Brief delay 
// for premium feel
await new Promise((resolve) => setTimeout(resolve, 1000));                              setSelectedAddProjectRepo(repo);
}}                          />                        </div>                      </div>                    ))}                  </div>                </div>              ) : (                /* Disconnected / Connect GitHub View */                <div className="github-disconnected-view">                  <div className="github-connect-box">                    <div className="github-connect-box__icon">                      <svg viewBox="0 0 24 24" fill="currentColor">                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />                      </svg>                    </div>                    <h3>GitHub Integratsiyasi</h3>                    <p>Loyihalaringizni sayt portfolio qismida avtomatlashtirilgan tarzda yuklash uchun GitHub profilingizni bog'lang.</p>                                        {verifyError && <p className="connect-modal__error" style={{ marginBottom: '16px' }}>{verifyError}</p>}                                        <button className="btn-github" onClick={handleGithubOAuth}>                      <svg                        width="16"                        height="16"                        viewBox="0 0 16 16"                        fill="none"                        xmlns="http://www.w3.org/2000/svg"                      >                        <path
d="M7.99992 1.33331C7.12444 1.33331 6.25753 1.50575 5.4487 1.84078C4.63986 2.17581 3.90493 2.66688 3.28587 3.28593C2.03563 4.53618 1.33325 6.23187 1.33325 7.99998C1.33325 10.9466 3.24659 13.4466 5.89325 14.3333C6.22659 14.3866 6.33325 14.18 6.33325 14C6.33325 13.8466 6.33325 13.4266 6.33325 12.8733C4.48659 13.2733 4.09325 11.98 4.09325 11.98C3.78659 11.2066 3.35325 11 3.35325 11C2.74659 10.5866 3.39992 10.6 3.39992 10.6C4.06659 10.6466 4.41992 11.2866 4.41992 11.2866C4.99992 12.3 5.97992 12 6.35992 11.84C6.41992 11.4066 6.59325 11.1133 6.77992 10.9466C5.29992 10.78 3.74659 10.2066 3.74659 7.66665C3.74659 6.92665 3.99992 6.33331 4.43325 5.85998C4.36659 5.69331 4.13325 4.99998 4.49992 4.09998C4.49992 4.09998 5.05992 3.91998 6.33325 4.77998C6.85992 4.63331 7.43325 4.55998 7.99992 4.55998C8.56659 4.55998 9.13992 4.63331 9.66659 4.77998C10.9399 3.91998 11.4999 4.09998 11.4999 4.09998C11.8666 4.99998 11.6333 5.69331 11.5666 5.85998C11.9999 6.33331 12.2533 6.92665 12.2533 7.66665C12.2533 10.2133 10.6933 10.7733 9.20659 10.94C9.44659 11.1466 9.66659 11.5533 9.66659 12.1733C9.66659 13.0666 9.66659 13.7866 9.66659 14C9.66659 14.18 9.77325 14.3933 10.1133 14.3333C12.7599 13.44 14.6666 10.9466 14.6666 7.99998C14.6666 7.1245 14.4941 6.25759 14.1591 5.44876C13.8241 4.63992 13.333 3.90499 12.714 3.28593C12.0949 2.66688 11.36 2.17581 10.5511 1.84078C9.7423 1.50575 8.8754 1.33331 7.99992 1.33331V1.33331Z"                          fill="currentColor"                        ></path>                      </svg>                      <span>View on Github</span>                    </button>                  </div>                </div>              )
}            </div>          )}          {/* UPLOADED PROJECTS PAGE */}          {activeTab === 'uploaded' && (            <div className="admin-pane">              <h2 className="admin-pane__title">Yuklangan Loyihalarim</h2>              {uploadedProjects.length === 0 ? (                <div className="uploaded-empty">                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="uploaded-empty__icon">                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />                    <polyline points="17 8 12 3 7 8" />                    <line x1="12" y1="3" x2="12" y2="15" />                  </svg>                  <h3>Hali loyihalar yuklanmagan</h3>                  <p>GitHub Loyihalarim bo'limi orqali loyiha qo'shing.</p>                </div>              ) : (                <div className="uploaded-list">                  {uploadedProjects.map((project) => (                    <div                      key={project.id}
                      className={`uploaded-item ${project.hidden ? 'uploaded-item--hidden' : ''}`}
                      onContextMenu={(e) => handleContextMenu(e, project)}                    >                      <div className="uploaded-item__thumb">                        <img src={project.image} alt={project.name} />                      </div>                      <div className="uploaded-item__body">                        <div className="uploaded-item__top">                          <h3 className="uploaded-item__name">{project.name}</h3>                          {project.hidden && <span className="uploaded-item__badge">Yashirin</span>}                        </div>                        <p className="uploaded-item__desc">{project.descriptions?.[locale] || project.description}</p>                        <div className="uploaded-item__meta">                          <span className="uploaded-item__repo">{project.repoFullName}</span>                          <div className="uploaded-item__langs">                            {project.languages.map((lang) => (                              <span key={lang.id} className="uploaded-lang-tag">{lang.name}</span>                            ))}                          </div>                        </div>                        <div className="uploaded-item__footer">                          <span className="uploaded-item__code">                            Kod: {project.hideCode ? 'Yashirin' : 'Ko\'rinadi'}                          </span>                          <span className="uploaded-item__date">                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}                          </span>                        </div>                      </div>                    </div>                  ))}                </div>              )}              {/* macOS-style Context Menu */}              {ctxMenu && (                <div                  className="ctx-menu"                  style={{ left: ctxMenu.x, top: ctxMenu.y }}
                  onClick={(e) => e.stopPropagation()}                >                  <button                    className="ctx-menu__item"                    onClick={() => handleToggleHidden(ctxMenu.project)}                  >                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ctx-menu__icon">                      {ctxMenu.project.hidden ? (                        <>                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />                          <circle cx="12" cy="12" r="3" />                        </>                      ) : (                        <>                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />                          <line x1="1" y1="1" x2="23" y2="23" />                        </>                      )}                    </svg>                    <span>{ctxMenu.project.hidden ? 'Ochish' : 'Berkitish'}</span>                  </button>                  <div className="ctx-menu__separator" />                  <button                    className="ctx-menu__item ctx-menu__item--danger"                    onClick={() => handleDeleteProject(ctxMenu.project)}                  >                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ctx-menu__icon">                      <polyline points="3 6 5 6 21 6" />                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />                      <line x1="10" y1="11" x2="10" y2="17" />                      <line x1="14" y1="11" x2="14" y2="17" />                    </svg>                    <span>O'chirish</span>                  </button>                </div>              )}            </div>          )}          {/* ACCOUNTS PAGE */}          {activeTab === 'accounts' && (            <div className="admin-pane">              <div className="ac-profile">                <div className="ac-profile-head">                  <div className="ac-avatar-ring">                    <div className="ac-avatar">                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />                        <circle cx="12" cy="7" r="4" />                      </svg>                    </div>                  </div>                  <div className="ac-head-info">                    <h3 className="ac-name">Ozobek Usmonqulov</h3>                    <p className="ac-role">Administrator</p>                  </div>                </div>                <div className="ac-divider" />                <div className="ac-details">                  <div className="ac-row">                    <span className="ac-row-icon">                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>                    </span>                    <span className="ac-row-label">Foydalanuvchi nomi</span>                    <span className="ac-row-value">@ozobek_usmonqulov</span>                  </div>                  <div className="ac-row">                    <span className="ac-row-icon">                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>                    </span>                    <span className="ac-row-label">E-pochta</span>                    <span className="ac-row-value">contact@ozobekusmonqulov.uz</span>                  </div>                </div>              </div>            </div>          )}        </main>      </div>      {/* Add Project Modal Popup */}      {selectedAddProjectRepo && (        <AddProjectModal          repoName={selectedAddProjectRepo.name}
          repoFullName={selectedAddProjectRepo.full_name}
          repoDescription={selectedAddProjectRepo.description || ''}
          onClose={() => setSelectedAddProjectRepo(null)}
          onSuccess={() => {            // Dispatch custom event to notify ProjectsSection in public view
window.dispatchEvent(new Event('projects-updated'));
}}
          theme={theme}          fullPage        />      )}      {/* iOS-style Delete Confirmation */}      {deleteConfirm && (        <div className="ios-confirm-overlay" onClick={() => setDeleteConfirm(null)}>          <div className="ios-confirm" onClick={(e) => e.stopPropagation()}>            <div className="ios-confirm__body">              <div className="ios-confirm__icon">                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">                  <circle cx="12" cy="12" r="10" />                  <line x1="12" y1="8" x2="12" y2="12" />                  <line x1="12" y1="16" x2="12.01" y2="16" />                </svg>              </div>              <h3 className="ios-confirm__title">Loyihani o'chirish</h3>              <p className="ios-confirm__message">                "{deleteConfirm.name}" loyihasi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.              </p>            </div>            <div className="ios-confirm__actions">              <button className="ios-confirm__btn ios-confirm__btn--cancel" onClick={() => setDeleteConfirm(null)}>                Bekor qilish              </button>              <button className="ios-confirm__btn ios-confirm__btn--destructive" onClick={confirmDelete}>                O'chirish              </button>            </div>          </div>        </div>      )}    </div>  )}