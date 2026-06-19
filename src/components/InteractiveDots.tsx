import { useEffect, useRef, useCallback } from 'react'

type InteractiveDotsProps = {
  backgroundColor?: string
  dotColor?: string
  gridSpacing?: number
  animationSpeed?: number
  removeWaveLine?: boolean
}

export default function InteractiveDots({
  backgroundColor = '#F0EEE6',
  dotColor = '#666666',
  gridSpacing = 30,
  animationSpeed = 0.005,
  removeWaveLine = true,
}: InteractiveDotsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const animationFrameId = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const ripples = useRef<
    Array<{ x: number; y: number; time: number; intensity: number }>
  >([])
  const dotsRef = useRef<
    Array<{
      x: number
      y: number
      originalX: number
      originalY: number
      phase: number
    }>
  >([])

  const getMouseInfluence = (x: number, y: number): number => {
    const dx = x - mouseRef.current.x
    const dy = y - mouseRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 150
    return Math.max(0, 1 - distance / maxDistance)
  }

  const getRippleInfluence = (
    x: number,
    y: number,
    currentTime: number,
  ): number => {
    let totalInfluence = 0
    ripples.current.forEach((ripple) => {
      const age = currentTime - ripple.time
      const maxAge = 3000
      if (age < maxAge) {
        const dx = x - ripple.x
        const dy = y - ripple.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const rippleRadius = (age / maxAge) * 300
        const rippleWidth = 60
        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const rippleStrength = (1 - age / maxAge) * ripple.intensity
          const proximityToRipple =
            1 - Math.abs(distance - rippleRadius) / rippleWidth
          totalInfluence += rippleStrength * proximityToRipple
        }
      }
    })
    return Math.min(totalInfluence, 2)
  }

  const initializeDots = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasWidth = canvas.clientWidth
    const canvasHeight = canvas.clientHeight

    const dots: Array<{
      x: number
      y: number
      originalX: number
      originalY: number
      phase: number
    }> = []

    for (let x = gridSpacing / 2; x < canvasWidth; x += gridSpacing) {
      for (let y = gridSpacing / 2; y < canvasHeight; y += gridSpacing) {
        dots.push({
          x,
          y,
          originalX: x,
          originalY: y,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    dotsRef.current = dots
  }, [gridSpacing])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = container.clientWidth
    const displayHeight = container.clientHeight

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    initializeDots()
  }, [initializeDots])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const target = e.target as HTMLElement | null
    if (target && target.closest('.tech-marquee')) {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
      return
    }

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.x = -1000
    mouseRef.current.y = -1000
    mouseRef.current.isDown = false
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    if (target && target.closest('.tech-marquee')) {
      return
    }

    mouseRef.current.isDown = true
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ripples.current.push({
      x,
      y,
      time: Date.now(),
      intensity: 2,
    })

    const now = Date.now()
    ripples.current = ripples.current.filter(
      (ripple) => now - ripple.time < 3000,
    )
  }, [])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    if (!touch) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = touch.clientX - rect.left
    mouseRef.current.y = touch.clientY - rect.top
    mouseRef.current.isDown = true

    ripples.current.push({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      time: Date.now(),
      intensity: 2,
    })

    const now = Date.now()
    ripples.current = ripples.current.filter(
      (ripple) => now - ripple.time < 3000,
    )
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    if (!touch) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = touch.clientX - rect.left
    mouseRef.current.y = touch.clientY - rect.top
  }, [])

  const handleTouchEnd = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    resizeCanvas()

    const handleResize = () => resizeCanvas()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    const tick = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      timeRef.current += animationSpeed
      const currentTime = Date.now()
      const dpr = window.devicePixelRatio || 1
      const canvasWidth = canvas.clientWidth
      const canvasHeight = canvas.clientHeight

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      dotsRef.current.forEach((dot) => {
        const mouseInfluence = getMouseInfluence(dot.originalX, dot.originalY)
        const rippleInfluence = getRippleInfluence(
          dot.originalX,
          dot.originalY,
          currentTime,
        )
        const totalInfluence = mouseInfluence + rippleInfluence

        dot.x = dot.originalX
        dot.y = dot.originalY

        const baseDotSize = 2
        const dotSize =
          baseDotSize +
          totalInfluence * 6 +
          Math.sin(timeRef.current + dot.phase) * 0.5
        const opacity = Math.max(
          0.3,
          0.6 +
            totalInfluence * 0.4 +
            Math.abs(Math.sin(timeRef.current * 0.5 + dot.phase)) * 0.1,
        )

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2)

        const red = Number.parseInt(dotColor.slice(1, 3), 16)
        const green = Number.parseInt(dotColor.slice(3, 5), 16)
        const blue = Number.parseInt(dotColor.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`
        ctx.fill()
      })

      if (!removeWaveLine) {
        ripples.current.forEach((ripple) => {
          const age = currentTime - ripple.time
          const maxAge = 3000
          if (age < maxAge) {
            const progress = age / maxAge
            const radius = progress * 300
            const alpha = (1 - progress) * 0.3 * ripple.intensity

            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`
            ctx.lineWidth = 2
            ctx.arc(ripple.x, ripple.y, radius, 0, 2 * Math.PI)
            ctx.stroke()

            const innerRadius = progress * 150
            const innerAlpha = (1 - progress) * 0.2 * ripple.intensity
            ctx.beginPath()
            ctx.strokeStyle = `rgba(120, 120, 120, ${innerAlpha})`
            ctx.lineWidth = 1
            ctx.arc(ripple.x, ripple.y, innerRadius, 0, 2 * Math.PI)
            ctx.stroke()
          }
        })
      }

      animationFrameId.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      timeRef.current = 0
      ripples.current = []
      dotsRef.current = []
    }
  }, [
    animationSpeed,
    backgroundColor,
    dotColor,
    removeWaveLine,
    resizeCanvas,
    handleMouseMove,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ])

  return (
    <div
      ref={containerRef}
      className="interactive-dots"
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="interactive-dots__canvas" />
    </div>
  )
}
