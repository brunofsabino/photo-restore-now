import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PhotoRestoreNow – AI Photo Restoration'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          Restore Old Photos with AI
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Repair • Colorize • Bring Memories Back to Life
        </div>
        <div
          style={{
            background: 'white',
            color: '#1e40af',
            fontSize: 24,
            fontWeight: 700,
            padding: '16px 48px',
            borderRadius: 50,
          }}
        >
          Starting at $17.99 · Results in 24 Hours
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          photorestorenow.com
        </div>
      </div>
    ),
    { ...size }
  )
}
