import { useState, useEffect } from 'react'
import './IosLoginScreen.css'

type IosLoginScreenProps = {
  theme: 'dark' | 'light'
  onLoginSuccess: () => void
}

export default function IosLoginScreen({ onLoginSuccess }: IosLoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'
    if (username === adminUser && password === adminPass) {
      onLoginSuccess()
    } else {
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  const formatTime = () => {
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
    return time.toLocaleDateString('en-US', options)
  }

  return (
    <div className="ios-screen">
      <div className="ios-screen__header">
        <h1 className="ios-screen__time">{formatTime()}</h1>
        <p className="ios-screen__date">{formatDate()}</p>
      </div>

      <div className={`ios-login-card ${error ? 'ios-login-card--shake' : ''}`}>
        <div className="ios-login-card__header">
          <h2 className="ios-login-card__title">Admin Panel</h2>
          <p className="ios-login-card__subtitle">Kirish uchun parolni kiriting</p>
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

          {error && <p className="ios-login-card__error">Foydalanuvchi nomi yoki parol noto'g'ri</p>}

          <button type="submit" className="ios-login-card__btn">
            Kirish
          </button>
        </form>

        <div className="ios-login-card__footer">
          <button type="button" className="ios-login-card__footer-btn" onClick={() => window.location.hash = ''}>
            Bekor qilish
          </button>
          <button type="button" className="ios-login-card__footer-btn" onClick={() => window.location.hash = ''}>
            Favqulodda
          </button>
        </div>
      </div>
    </div>
  )
}
