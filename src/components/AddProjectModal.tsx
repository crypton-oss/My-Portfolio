import { useState, useRef } from 'react';
import { NativeLiquidButton } from './NativeLiquidButton';
import { addProject } from '../data/projectsDB';
import { getLangIcon } from '../data/langIcons';
import './AddProjectModal.css';

interface Language {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AddProjectModalProps {
  repoName: string;
  repoFullName: string;
  repoDescription: string;
  onClose: () => void;
  onSuccess: () => void;
  theme: 'dark' | 'light';
  fullPage?: boolean;
}

const LANGUAGES: Language[] = [
  { id: 'html', name: 'HTML5', icon: getLangIcon('html', 'HTML5') },
  { id: 'css', name: 'CSS3', icon: getLangIcon('css', 'CSS3') },
  { id: 'js', name: 'JavaScript', icon: getLangIcon('js', 'JavaScript') },
  { id: 'ts', name: 'TypeScript', icon: getLangIcon('ts', 'TypeScript') },
  { id: 'react', name: 'React', icon: getLangIcon('react', 'React') },
  { id: 'python', name: 'Python', icon: getLangIcon('python', 'Python') },
  { id: 'nodejs', name: 'Node.js', icon: getLangIcon('nodejs', 'Node.js') },
  { id: 'mongodb', name: 'MongoDB', icon: getLangIcon('mongodb', 'MongoDB') },
  { id: 'postgresql', name: 'PostgreSQL', icon: getLangIcon('postgresql', 'PostgreSQL') },
  { id: 'redis', name: 'Redis', icon: getLangIcon('redis', 'Redis') },
  { id: 'flutter', name: 'Flutter', icon: getLangIcon('flutter', 'Flutter') },
  { id: 'kotlin', name: 'Kotlin', icon: getLangIcon('kotlin', 'Kotlin') },
  { id: 'reactnative', name: 'React Native', icon: getLangIcon('reactnative', 'React Native') },
  { id: 'docker', name: 'Docker', icon: getLangIcon('docker', 'Docker') },
  { id: 'linux', name: 'Linux', icon: getLangIcon('linux', 'Linux') },
  { id: 'ubuntu', name: 'Ubuntu', icon: getLangIcon('ubuntu', 'Ubuntu') },
  { id: 'git', name: 'Git', icon: getLangIcon('git', 'Git') },
  { id: 'nginx', name: 'Nginx', icon: getLangIcon('nginx', 'Nginx') },
  { id: 'visualstudiocode', name: 'VS Code', icon: getLangIcon('visualstudiocode', 'VS Code') },
  { id: 'powershell', name: 'PowerShell', icon: getLangIcon('powershell', 'PowerShell') },
  { id: 'openai', name: 'AI', icon: getLangIcon('openai', 'AI') },
  { id: 'github', name: 'GitHub', icon: getLangIcon('github', 'GitHub') },
  { id: 'figma', name: 'Figma', icon: getLangIcon('figma', 'Figma') },
  { id: 'androidstudio', name: 'Android Studio', icon: getLangIcon('androidstudio', 'Android Studio') },
];

export function AddProjectModal({
  repoName,
  repoFullName,
  repoDescription,
  onClose,
  onSuccess,
  theme,
  fullPage = false,
}: AddProjectModalProps) {
  const [name, setName] = useState(repoName);
  const [description, setDescription] = useState(repoDescription || '');
  const [image, setImage] = useState<string>(''); // Base64 image

  // Languages selection
  const [selectedLangs, setSelectedLangs] = useState<Language[]>([]);

  // Visibility: true = Public, false = Private
  const [isPublic, setIsPublic] = useState(true);

  // Form submission and loading states
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIosToast, setShowIosToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload parsing
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Language selection handler
  const handleSelectLang = (lang: Language) => {
    if (selectedLangs.some((item) => item.id === lang.id)) {
      setSelectedLangs(selectedLangs.filter((item) => item.id !== lang.id));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setProgress(0);

    // Simulate upload progress waves
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setProgress(p);
    }

    // Prepare project object
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      image: image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
      languages: selectedLangs.map((lang) => ({ id: lang.id, name: lang.name })),
      hideCode: !isPublic,
      hidden: false,
      repoFullName,
      createdAt: new Date().toISOString(),
    };

    // Save via IndexedDB (with localStorage fallback)
    await addProject(newProject);

    setIsSubmitting(false);

    // Show iOS Dynamic Island alert toast
    setShowIosToast(true);

    // Close modal after success animation complete
    setTimeout(() => {
      setShowIosToast(false);
      onSuccess();
      onClose();
    }, 2500);
  };

  const formContent = (
    <>
      <h3>Yangi Loyiha Qo'shish</h3>
      <p style={{ marginBottom: '20px' }}>Loyiha ma'lumotlarini to'ldiring va portfolioingizga joylashtiring.</p>

      <form onSubmit={handleSubmit} className="add-project-form">

        <div className="add-project-layout">

          {/* Left Column: Image upload, Name, Description */}
          <div className="add-project-left-column">

            {/* Image Upload Button */}
            <div className="form-group">
              <label className="form-label">Loyiha rasmi</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button type="button" className="add-project-upload-btn" onClick={triggerFileInput}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21.2 15c.6-1 .8-2.2.8-3.4C22 7.2 18 4 13 4S4 7.2 4 11.6c0 1.2.2 2.4.8 3.4" />
                  <path d="M12 12v9m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Rasm yuklash</span>
              </button>
              {image && <span className="add-project-upload-status">Rasm tanlandi</span>}
            </div>

            {/* Project Name */}
            <div className="form-group">
              <label className="form-label">Loyiha nomi</label>
              <input
                type="text"
                className="connect-modal__input form-input-text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Project Description */}
            <div className="form-group">
              <label className="form-label">Loyiha haqida (Description)</label>
              <textarea
                className="connect-modal__input form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

          </div>

          {/* Right Column: 24-icon grid */}
          <div className="add-project-right-column">
            <label className="form-label">Dasturlash tillari</label>
            <div className="lang-icon-grid">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLangs.some((item) => item.id === lang.id);
                return (
                  <div
                    key={lang.id}
                    className={`lang-grid-item ${isSelected ? 'lang-grid-item--selected' : ''}`}
                    onClick={() => handleSelectLang(lang)}
                  >
                    <div className={`lang-grid-icon ${isSelected ? 'lang-grid-icon--selected' : ''}`}>
                      {lang.icon}
                    </div>
                    <span className="lang-grid-tooltip">{lang.name}</span>
                  </div>
                );
              })}
            </div>
            {selectedLangs.length > 0 && (
              <div className="selected-langs-list" style={{ marginTop: '10px' }}>
                {selectedLangs.map((lang) => (
                  <div key={lang.id} className="selected-lang-pill" onClick={() => handleSelectLang(lang)}>
                    <span className="selected-lang-icon-wrap">{lang.icon}</span>
                    <span>{lang.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer: Public/Private toggle + Submit */}
        <div className="add-project-footer">
          <div className="add-project-visibility">
            <button
              type="button"
              className={`add-project-visibility-btn ${isPublic ? 'add-project-visibility-btn--active' : ''}`}
              onClick={() => setIsPublic(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Public
            </button>
            <button
              type="button"
              className={`add-project-visibility-btn ${!isPublic ? 'add-project-visibility-btn--active' : ''}`}
              onClick={() => setIsPublic(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Private
            </button>
          </div>
          <NativeLiquidButton
            type="submit"
            progress={progress}
            loading={isSubmitting}
            success={progress === 100}
            showPercentage
            className="add-project-submit-btn"
          >
            Yuklash
          </NativeLiquidButton>
        </div>

      </form>
    </>
  );

  if (fullPage) {
    return (
      <>
        {showIosToast && (
          <div className="ios-toast-container">
            <div className="ios-toast">
              <div className="ios-toast__status-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="ios-toast__content">
                <h4 className="ios-toast__title">Ozobek Usmonqulov Tizimi</h4>
                <p className="ios-toast__desc">Loyiha muvaffaqiyatli saqlandi!</p>
              </div>
            </div>
          </div>
        )}
        <div className={`add-project-fullpage add-project-fullpage--${theme}`}>
          <div className="add-project-fullpage__header">
            <button type="button" className="add-project-back-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <polyline points="19 12 5 12" />
                <polyline points="11 18 5 12 11 6" />
              </svg>
              <span>Bosh saxifaga qaytish</span>
            </button>
          </div>
          <div className="add-project-fullpage__body">
            <div className="add-project-form-container">
              {formContent}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`connect-modal-overlay connect-modal-overlay--${theme}`}>
      {showIosToast && (
        <div className="ios-toast-container">
          <div className="ios-toast">
            <div className="ios-toast__status-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="ios-toast__content">
              <h4 className="ios-toast__title">Ozobek Usmonqulov Tizimi</h4>
              <p className="ios-toast__desc">Loyiha muvaffaqiyatli saqlandi!</p>
            </div>
          </div>
        </div>
      )}

      <div className="connect-modal add-project-modal" style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="connect-modal__content" style={{ padding: '28px 28px 120px', overflowY: 'auto', flex: 1 }}>
          <button type="button" className="connect-modal__close-btn" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          {formContent}
        </div>
      </div>
    </div>
  );
}
