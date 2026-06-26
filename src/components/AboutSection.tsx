import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useT } from '../i18n/LocaleContext'
import './AboutSection.css'

type AboutSectionProps = {
  visible: boolean
  theme: 'dark' | 'light'
  style?: React.CSSProperties
}

const timelineKeys = ['computer', 'frontend', 'backend', 'cloud', 'ai', 'ielts'] as const
const timelineYears = ['2023', '2024', '2025', '2025', '2026', '2026']

export default function AboutSection({ visible, theme, style }: AboutSectionProps) {
  const { t } = useT()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="about" className={`about-section about-section--${theme}`} style={style}>
      <div className={`about-section__inner ${visible ? 'about-section__inner--visible' : ''}`}>

        {/* OLD About Section - commented out */}
        {/* <div className="about-premium">
          <div className="about-premium__text">...</div>
        </div> */}

        {/* NEW Timeline Block */}
        <section ref={ref} className="timeline-block">
          <div className="timeline-block__container">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="timeline-block__header"
            >
              <span className="timeline-block__badge">
                <span className="timeline-block__badge-dot" />
                Haqimda
              </span>
              <h2 className="timeline-block__title">Usmonqulov Ozodbek </h2>
              <p className="timeline-block__subtitle">
                O'zim haqimda qisqacha malumot 
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="timeline-block__timeline">
              {/* Vertical line */}
              <motion.div
                className="timeline-block__line"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />

              <div className="timeline-block__events">
                {timelineKeys.map((key, index) => {
                  const isEven = index % 2 === 0
                  const year = timelineYears[index]

                  return (
                    <motion.div
                      key={year + key}
                      initial={{ opacity: 0, y: 30 }}
                      animate={
                        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                      }
                      transition={{
                        delay: index * 0.2,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className={`timeline-block__event ${isEven ? 'timeline-block__event--left' : 'timeline-block__event--right'}`}
                    >
                      {/* Timeline node */}
                      <div className="timeline-block__node">
                        <motion.div
                          className="timeline-block__node-dot"
                          initial={{ scale: 0 }}
                          animate={isInView ? { scale: 1 } : { scale: 0 }}
                          transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                        >
                          <CheckCircle2 className="timeline-block__node-icon" />
                        </motion.div>
                        <motion.div
                          className="timeline-block__node-pulse"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        />
                      </div>

                      {/* Content card */}
                      <div className="timeline-block__card-wrap">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="timeline-block__card">
                            <div className="timeline-block__card-glow" />
                            <div className="timeline-block__card-content">
                              <span className="timeline-block__card-year">{year}</span>
                              <h3 className="timeline-block__card-title">{t(`about.milestones.${key}.title`)}</h3>
                              <p className="timeline-block__card-desc">{t(`about.milestones.${key}.desc`)}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Future indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: timelineKeys.length * 0.2 + 0.5 }}
              className="timeline-block__footer"
            >
              <div className="timeline-block__footer-inner">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="timeline-block__footer-dot"
                />
                <span className="timeline-block__footer-text">And others...</span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  )
}
