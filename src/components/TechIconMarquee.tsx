import { useState } from 'react'
import { techIcons } from '../data/techIcons'
import './TechIconMarquee.css'

type TechIconMarqueeProps = {
  theme: 'dark' | 'light'
}

export default function TechIconMarquee({ theme }: TechIconMarqueeProps) {
  const [paused, setPaused] = useState(false)
  const icons = [...techIcons, ...techIcons, ...techIcons]

  return (
    <div
      className={`tech-marquee tech-marquee--${theme} ${paused ? 'tech-marquee--paused' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Dasturlash tillari"
    >
      <div className="tech-marquee__fade tech-marquee__fade--left" />
      <div className="tech-marquee__fade tech-marquee__fade--right" />

      <div className="tech-marquee__track">
        {icons.map((icon, index) => (
          <div key={`${icon.name}-${index}`} className="tech-marquee__item">
            <div className="tech-marquee__icon-3d">
              <div className="tech-marquee__icon-inner">{icon.svg}</div>
              <span className="tech-marquee__label">{icon.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
