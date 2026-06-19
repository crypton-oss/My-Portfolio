import { useEffect } from 'react'

function generateId(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export default function useDeviceTracking() {
  useEffect(() => {
    let deviceId = localStorage.getItem('device_id')
    const isNew = !deviceId
    if (!deviceId) {
      deviceId = generateId()
      localStorage.setItem('device_id', deviceId)
    }

    fetch(`${import.meta.env.VITE_BOT_URL || 'https://my-portfolio-wb95.onrender.com'}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        userAgent: navigator.userAgent,
        isNew,
      }),
    }).catch(() => {
      // Bot server not running — silently ignore
    })
  }, [])
}
