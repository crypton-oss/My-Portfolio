import { useState, useEffect, useRef, useCallback } from 'react';
import { NativeNestedList, type ListItem } from './NativeNestedList';
import './RepoCodeViewer.css';

interface RepoCodeViewerProps {
  repoFullName: string; // e.g. "octocat/Hello-World"
  onClose: () => void;
  theme: 'dark' | 'light';
}

export default function RepoCodeViewer({ repoFullName, onClose, theme }: RepoCodeViewerProps) {
  const [fileTree, setFileTree] = useState<ListItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('Select a file from the explorer to view its code.');
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');
  
  const [sidebarWidth, setSidebarWidth] = useState(() => window.innerWidth <= 768 ? 140 : 260);
  const [isResizing, setIsResizing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '';

  // Helper to build nested ListItem tree from flat GitHub tree API response
  const buildTreeFromPaths = (paths: Array<{ path: string; type: 'blob' | 'tree' | string }>) => {
    const root: ListItem[] = [];
    
    // Sort directories first, then files alphabetically
    const sorted = [...paths].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'tree' ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });

    sorted.forEach((item) => {
      const parts = item.path.split('/');
      let currentLevel = root;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = i === parts.length - 1;

        let existing = currentLevel.find((node) => node.label === part);
        if (!existing) {
          const node: ListItem = {
            id: currentPath,
            label: part,
            path: isLast && item.type === 'blob' ? currentPath : undefined,
            type: isLast && item.type === 'blob' ? 'blob' : 'tree',
            children: !isLast || item.type === 'tree' ? [] : undefined,
          };
          currentLevel.push(node);
          existing = node;
        }
        if (existing.children) {
          currentLevel = existing.children;
        }
      }
    });

    return root;
  };

  // Fetch file tree
  const fetchRepositoryTree = async () => {
    setIsLoadingTree(true);
    setError(null);
    try {
      // 1. Get default branch first
      const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
      if (!repoRes.ok) {
        throw new Error('Repository data fetch failed');
      }
      const repoData = await repoRes.json();
      const branch = repoData.default_branch || 'main';
      setDefaultBranch(branch);

      // 2. Fetch recursive git tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );
      
      if (!treeRes.ok) {
        throw new Error('File tree fetch failed (API rate limit or private repo access)');
      }
      
      const treeData = await treeRes.json();
      
      // Filter out git metadata folder (.git)
      const filteredPaths = (treeData.tree || []).filter(
        (item: any) => !item.path.startsWith('.git/') && item.path !== '.gitignore'
      );

      const tree = buildTreeFromPaths(filteredPaths);
      setFileTree(tree);
    } catch (err: any) {
      console.warn('Falling back to mock file tree due to API failure:', err.message);
      setError(err.message || 'API connection failed. Showing mock files.');
      loadMockFileTree();
    } finally {
      setIsLoadingTree(false);
    }
  };

  // Load mock file tree when GitHub API is unavailable or rate-limited
  const loadMockFileTree = () => {
    const mockPaths = [
      { path: 'src', type: 'tree' },
      { path: 'src/components', type: 'tree' },
      { path: 'src/components/Navbar.tsx', type: 'blob' },
      { path: 'src/components/AboutSection.tsx', type: 'blob' },
      { path: 'src/components/HeroSection.tsx', type: 'blob' },
      { path: 'src/App.tsx', type: 'blob' },
      { path: 'src/main.tsx', type: 'blob' },
      { path: 'src/index.css', type: 'blob' },
      { path: 'package.json', type: 'blob' },
      { path: 'vite.config.ts', type: 'blob' },
      { path: 'README.md', type: 'blob' },
    ];
    setFileTree(buildTreeFromPaths(mockPaths));
  };

  // Fetch file content
  const handleFileSelect = async (path: string) => {
    setSelectedFilePath(path);
    setIsLoadingContent(true);
    setFileContent('Loading file content...');
    try {
      if (token === 'mock_oauth_token' || !token) {
        // Return mock contents based on extension
        setTimeout(() => {
          setFileContent(getMockFileContent(path));
          setIsLoadingContent(false);
        }, 300);
        return;
      }

      const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${path}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const data = await response.json();
      
      // Decode base64 content safely handles UTF-8 characters
      const decoded = decodeURIComponent(
        atob(data.content.replace(/\s/g, ''))
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      setFileContent(decoded);
    } catch (err: any) {
      setFileContent(`Error loading file: ${err.message || 'Unknown error'}\n\nFalling back to offline mock code:\n\n${getMockFileContent(path)}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const getMockFileContent = (path: string) => {
    const fileName = path.split('/').pop() || '';
    const ext = fileName.split('.').pop() || '';

    if (ext === 'md') {
      return `# ${repoFullName.split('/').pop()}\n\nThis is a mock README file for local preview.\n\n### Installation\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``;
    }
    if (ext === 'json') {
      return `{\n  "name": "${repoFullName.split('/').pop()}",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^19.0.0",\n    "framer-motion": "^11.0.0"\n  }\n}`;
    }
    if (ext === 'css') {
      return `/* Mock styles for ${fileName} */\n.container {\n  display: flex;\n  flex-direction: column;\n  padding: 24px;\n  background-color: var(--panel-bg);\n}`;
    }
    
    // Default mock component TSX code
    return `import React from 'react';\n\n// Mock code for ${fileName}\nexport default function ${fileName.split('.')[0]}() {\n  return (\n    <div className="flex flex-col p-6 rounded-lg bg-card">\n      <h3 className="text-lg font-bold">${fileName.split('.')[0]}</h3>\n      <p className="text-sm text-secondary">Connected successfully via Ozobek Usmonqulov Admin Panel.</p>\n    </div>\n  );\n}`;
  };

  useEffect(() => {
    fetchRepositoryTree();
  }, [repoFullName]);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  // Line count generation for gutters
  const lines = fileContent.split('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    alert('Code copied to clipboard!');
  };

  const handleDownloadZip = () => {
    const zipUrl = `https://github.com/${repoFullName}/archive/refs/heads/${defaultBranch}.zip`;
    window.open(zipUrl, '_blank');
  };

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const isPhone = window.innerWidth <= 768;
    const minW = isPhone ? 120 : 180;
    const maxW = isPhone ? 300 : 500;

    const handleMouseMove = (e: MouseEvent) => {
      if (!bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const newWidth = Math.max(minW, Math.min(maxW, e.clientX - rect.left));
      setSidebarWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const newWidth = Math.max(minW, Math.min(maxW, e.touches[0].clientX - rect.left));
      setSidebarWidth(newWidth);
    };

    const stopResize = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', stopResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', stopResize);
    };
  }, [isResizing]);

  return (
    <div className={`repo-viewer-overlay repo-viewer-overlay--${theme}`}>
      <div className="repo-viewer-window">
        {/* Header */}
        <header className="repo-viewer-header">
          <div className="repo-viewer-header__brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="repo-viewer-header__icon">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span className="repo-viewer-header__title">{repoFullName}</span>
          </div>

          <div className="repo-viewer-header__actions">
            <button type="button" className="repo-viewer-zip-btn" onClick={handleDownloadZip}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="repo-viewer-zip-btn__icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download ZIP</span>
            </button>
            <button type="button" className="repo-viewer-copy-btn" onClick={copyToClipboard} disabled={isLoadingContent}>
              Copy Code
            </button>
            <button type="button" className="repo-viewer-close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div ref={bodyRef} className={`repo-viewer-body${isResizing ? ' repo-viewer-body--resizing' : ''}`}>
          {/* Left Sidebar - Folder Explorer */}
          <aside className="repo-viewer-sidebar" style={{ width: sidebarWidth }}>
            <div className="repo-viewer-sidebar__title">Files</div>
            <div className="repo-viewer-sidebar__content">
              {error && (
                <div style={{ padding: '8px', marginBottom: '12px', fontSize: '11px', color: '#ff453a', background: 'rgba(255, 69, 58, 0.1)', borderRadius: '6px' }}>
                  {error}
                </div>
              )}
              {isLoadingTree ? (
                <div className="repo-viewer-loader">
                  <span className="repo-viewer-spinner animate-spin" />
                  <span>Loading tree...</span>
                </div>
              ) : (
                <NativeNestedList
                  items={fileTree}
                  onFileSelect={handleFileSelect}
                  selectedFilePath={selectedFilePath}
                />
              )}
            </div>
          </aside>

          {/* Resize Handle */}
          <div
            className={`repo-viewer-resize-handle${isResizing ? ' repo-viewer-resize-handle--active' : ''}`}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />

          {/* Right Panel - Code viewer */}
          <main className="repo-viewer-content">
            {isLoadingContent ? (
              <div className="repo-viewer-content-loader">
                <span className="repo-viewer-spinner animate-spin" />
                <span>Loading content...</span>
              </div>
            ) : (
              <div className="repo-viewer-code-container">
                {/* Line Gutter */}
                <div className="repo-viewer-gutter">
                  {lines.map((_, i) => (
                    <span key={i} className="repo-viewer-line-number">
                      {i + 1}
                    </span>
                  ))}
                </div>
                {/* Code viewport */}
                <pre className="repo-viewer-pre">
                  <code>{fileContent}</code>
                </pre>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
