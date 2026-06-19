import './LoadingScreen.css'

type LoadingScreenProps = {
  exiting?: boolean
}

export default function LoadingScreen({ exiting = false }: LoadingScreenProps) {
  return (
    <div className={`loading-screen ${exiting ? 'loading-screen--exit' : ''}`}>
      <div className="spinner center">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="spinner-blade" />
        ))}
      </div>
    </div>
  )
}
