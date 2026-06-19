import { useState, useEffect, useRef } from 'react'
import './FakeAdminLogin.css'

const ERROR_MESSAGES = [
  'Yuzni aniqlash imkonsiz',
  'Biometrik ma\'lumotlar mos kelmadi',
  'Login yoki parol noto\'g\'ri',
  'Xavfsizlik protokoli buzildi',
  'Ushbu qurilma bloklangan',
  'Soxta kirish urinishi aniqlandi',
  'Tizimga kirish rad etildi',
  'IP manzilingiz qora ro\'yxatda',
  'Sessiya tugatildi',
  'Xatolik: 0x8A7F3D',
  'Kiritilgan ma\'lumotlar shubhali',
  'Serverga ulanish yo\'qoldi',
  'Yuz moslamasi topilmadi',
  'Kamera bilan bog\'liq xatolik',
  'Bloklandi — haddan tashqari ko\'p urinish',
]

function playScarySound() {
  try {
    const ctx = new AudioContext()

    // Low rumble
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.value = 55
    gain1.gain.setValueAtTime(0.4, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.6)

    // High screech
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'square'
    osc2.frequency.value = 800
    gain2.gain.setValueAtTime(0.2, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start()
    osc2.stop(ctx.currentTime + 0.3)

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const gain3 = ctx.createGain()
    gain3.gain.setValueAtTime(0.3, ctx.currentTime)
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    noise.connect(gain3)
    gain3.connect(ctx.destination)
    noise.start()
  } catch {}
}

export default function FakeAdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState<{ id: number; text: string }[]>([])
  const [time, setTime] = useState(new Date())
  const [shaking, setShaking] = useState(false)
  const [meltdown, setMeltdown] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const meltTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => {
      clearInterval(timer)
      if (meltTimeoutRef.current) clearTimeout(meltTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (attempts < 3) return

    playScarySound()
    setErrors((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)] },
    ])

    if (intervalRef.current) clearInterval(intervalRef.current)
    const speed = Math.max(30, 500 - (attempts - 3) * 50)
    intervalRef.current = setInterval(() => {
      playScarySound()
      setErrors((prev) => {
        const count = Math.floor((attempts - 2) * 1.5)
        const batch: { id: number; text: string }[] = []
        for (let i = 0; i < count; i++) {
          batch.push({
            id: Date.now() + Math.random(),
            text: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
          })
        }
        return [...prev, ...batch]
      })
    }, speed)

    meltTimeoutRef.current = setTimeout(() => setMeltdown(true), 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [attempts])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (meltdown) return
    setAttempts((n) => n + 1)
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
    setUsername('')
    setPassword('')
  }

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (meltTimeoutRef.current) clearTimeout(meltTimeoutRef.current)
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new Event('popstate'))
  }

  const formatTime = () => {
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={`ios-screen fake-admin ${meltdown ? 'fake-admin--meltdown' : ''}`}>
      {/* Time header — stays visible */}
      <div className={`ios-screen__header ${meltdown ? 'ios-screen__header--glitch' : ''}`}>
        <h1 className="ios-screen__time">{formatTime()}</h1>
        <p className="ios-screen__date">{formatDate()}</p>
      </div>

      {/* Login card — disappears in meltdown */}
      {!meltdown && (
        <div className={`ios-login-card fake-admin__card ${shaking ? 'ios-login-card--shake' : ''}`}>
          {/* Face Scan Area */}
          <div className="fake-admin__face-scan">
            <div className="fake-admin__face-frame">
              <svg className="fake-admin__face-icon" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="28" r="14" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 68c0-12 10.7-22 24-22s24 10 24 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="fake-admin__scan-line" />
            </div>
            <p className="fake-admin__face-label">Yuzni skanerlash</p>
          </div>

          <form className="ios-login-card__form" onSubmit={handleLogin}>
            <div className="ios-login-card__input-group">
              <input
                type="text"
                className="ios-login-card__input"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="ios-login-card__input-group">
              <input
                type="password"
                className="ios-login-card__input"
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="fake-admin__errors">
              {errors.map((e) => (
                <p key={e.id} className="fake-admin__error-msg">{e.text}</p>
              ))}
            </div>
            <button type="submit" className="ios-login-card__btn">
              {attempts >= 3 ? 'Qayta urinish' : 'Kirish'}
            </button>
          </form>

          <div className="ios-login-card__footer">
            <button type="button" className="ios-login-card__footer-btn" onClick={handleCancel}>
              Bekor qilish
            </button>
            <button type="button" className="ios-login-card__footer-btn" onClick={() => {}}>
              Favqulodda
            </button>
          </div>
        </div>
      )}

      {/* Meltdown — full screen error flood */}
      {meltdown && (
        <div className="fake-admin__meltdown">
          <div className="fake-admin__meltdown-overlay" />
          <div className="fake-admin__meltdown-errors">
            {errors.map((e) => (
              <span key={e.id} className="fake-admin__meltdown-msg">{e.text}</span>
            ))}
          </div>
          <button className="fake-admin__meltdown-btn" onClick={handleCancel}>
            Tizimni tark etish
          </button>
        </div>
      )}
    </div>
  )
}
