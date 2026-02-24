import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NudiNađi Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.15)',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 900, fontStyle: 'italic', color: 'white' }}>
            N
          </span>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: 'white',
            margin: 0,
            letterSpacing: '-2px',
          }}
        >
          NudiNađi
        </h1>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 16,
            fontWeight: 500,
          }}
        >
          Kupuj i Prodaj Brzo i Sigurno
        </p>
      </div>
    ),
    { ...size }
  );
}
