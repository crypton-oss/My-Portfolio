export const siteConfig = {
  name: 'Ozodbek Usmonqulov',
  brand: '',
  roles: [
    'Full Stack Dasturchi',
    'Frontend Dasturchi',
    'Backend Dasturchi',
    'UI/UX Dizayner',
  ],
  cvUrl: '/my-pdf-resume.pdf',
  social: {
    github: 'https://github.com/crypton-oss',
    linkedin: 'https://linkedin.com',
    telegram: 'https://t.me/anonim_crypton',
    discord: 'https://discord.com',
  },
  botUrl: import.meta.env.VITE_BOT_URL || 'https://my-portfolio-wb95.onrender.com',
  apiUrl: import.meta.env.VITE_API_URL || '/api',

} as const

export const navLinks = [
  { label: 'Bosh saxifa', href: '#home' },
  { label: "O'zim haqimda", href: '#about' },
  { label: 'Loyihalar', href: '#project' },
  { label: 'Konikmalar', href: '#skills' },
  { label: "Bog'lanish", href: '#contact' },
  { label: 'Download CV', href: '#cv', accent: true },
] as const
