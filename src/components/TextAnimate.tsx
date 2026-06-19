import { useEffect, useState } from 'react'
import './TextAnimate.css'

type TextAnimateProps = {
  texts: readonly string[]
  as?: 'h1' | 'h2' | 'p' | 'span'
  className?: string
  interval?: number
}

export default function TextAnimate({
  texts,
  as: Tag = 'h2',
  className = '',
  interval = 3500,
}: TextAnimateProps) {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (texts.length <= 1) return

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
      setAnimKey((prev) => prev + 1)
    }, interval)

    return () => window.clearInterval(timer)
  }, [texts, interval])

  return (
    <Tag key={animKey} className={`text-animate text-animate--blur-in ${className}`}>
      {texts[index]}
    </Tag>
  )
}
