import type { ReactNode } from 'react'
import './HoverIconButton.css'

type HoverIconButtonProps = {
  href: string
  label: string
  icon: ReactNode
  variant?: 'solid' | 'ghost' | 'accent'
  download?: boolean
}

export default function HoverIconButton({
  href,
  label,
  icon,
  variant = 'ghost',
  download,
}: HoverIconButtonProps) {
  return (
    <a
      href={href}
      className={`hover-icon-btn hover-icon-btn--${variant}`}
      aria-label={label}
      {...(download ? { download: true } : {})}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="hover-icon-btn__icon">{icon}</span>
      <span className="hover-icon-btn__text">{label}</span>
    </a>
  )
}
