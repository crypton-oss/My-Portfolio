import { useState, useEffect } from 'react';
import RepoCodeViewer from './RepoCodeViewer';
import { getAllProjects, initializeProjectsDB } from '../data/projectsDB';
import { getLangIcon } from '../data/langIcons';
import { useT } from '../i18n/LocaleContext';
import './ProjectsSection.css';

interface Project {
  id: string;
  name: string;
  description: string;
  descriptions?: Record<string, string>;
  image: string;
  languages: Array<{ id: string; name: string }>;
  hideCode: boolean;
  repoFullName: string;
}

interface ProjectsSectionProps {
  visible: boolean;
  theme: 'dark' | 'light';
  style?: React.CSSProperties;
}

export default function ProjectsSection({ visible, theme, style }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const { locale } = useT();

  const loadProjects = async () => {
    await initializeProjectsDB();
    const items = await getAllProjects();
    setProjects(items.filter((p) => !p.hidden));
  };

  useEffect(() => {
    loadProjects();
    
    const handleUpdate = () => loadProjects();
    window.addEventListener('projects-updated', handleUpdate);
    return () => window.removeEventListener('projects-updated', handleUpdate);
  }, []);

  return (
    <section id="project" className={`projects-section projects-section--${theme}`} style={style}>
      <div className={`projects-section__inner ${visible ? 'projects-section__inner--visible' : ''}`}>
        
        {/* Header */}
        <div className="about-header">
          <div className="about-header__badge">
            <span className="about-header__badge-dot animate-pulse" />
            Loyihalarim
          </div>
          <h2 className="about-header__title"></h2>
          <p className="about-header__subtitle">
            Yaratgan va ishlab chiqqan asosiy dasturiy mahsulotlarim ro'yxati
          </p>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid-layout">
          {projects.map((project) => (
            <div key={project.id} className="project-card-item">
              <div className="project-card-image-wrap">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="project-card-image"
                />
              </div>
              <div className="project-card-info">
                <h3 className="project-card-title">{project.name}</h3>
                <p className="project-card-desc">{project.descriptions?.[locale] || project.description}</p>
                
                {/* Languages list tags */}
                <div className="project-card-langs">
                  {project.languages.map((lang) => (
                    <span key={lang.id} className="project-lang-tag" title={lang.name}>
                      {getLangIcon(lang.id, lang.name)}
                    </span>
                  ))}
                </div>

                {/* View Code trigger button - hidden if hideCode is true */}
                {!project.hideCode && (
                  <button 
                    type="button" 
                    className="project-view-code-btn"
                    onClick={() => setSelectedRepo(project.repoFullName)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>Kodni ko'rish</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Code Viewer Modal Popover */}
      {selectedRepo && (
        <RepoCodeViewer
          repoFullName={selectedRepo}
          onClose={() => setSelectedRepo(null)}
          theme={theme}
        />
      )}
    </section>
  );
}
