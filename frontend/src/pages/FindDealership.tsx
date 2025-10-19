import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

type Dealer = {
  id: string
  name: string
  address: string
  phone: string
  imageUrl: string
  rating: number
  hours: string
  website: string
}

const dealers: Dealer[] = [
  {
    id: '1',
    name: 'Toyota of Dallas',
    address: '2610 Forest Ln, Dallas, TX',
    phone: '(214) 555-1001',
    imageUrl: 'https://placehold.co/800x500?text=Toyota+of+Dallas',
    rating: 4.6,
    hours: 'Open until 8:00 PM',
    website: 'https://www.toyotaofdallas.com/'
  },
  {
    id: '2',
    name: 'Toyota North Dallas',
    address: '12345 Belt Line Rd, Dallas, TX',
    phone: '(214) 555-1002',
    imageUrl: 'https://placehold.co/800x500?text=Toyota+North+Dallas',
    rating: 4.5,
    hours: 'Open until 8:00 PM',
    website: 'https://www.toyotanorthdallas.com/'
  },
  {
    id: '3',
    name: 'Cowboy Toyota',
    address: '9525 E R L Thornton Fwy, Dallas, TX',
    phone: '(214) 555-1003',
    imageUrl: 'https://placehold.co/800x500?text=Cowboy+Toyota',
    rating: 4.4,
    hours: 'Open until 8:00 PM',
    website: 'https://www.cowboytoyota.com/'
  },
]

export default function FindDealership() {
  const location = useLocation()
  const state = (location.state as any) || {}
  const selectedPlan = state.selectedPlan as string | undefined
  const extractedScore = state.extractedScore as number | undefined
  const [modalDealer, setModalDealer] = useState<Dealer | null>(null)

  // Simple depth-of-field confetti when approved
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!state?.inRange) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationId = 0
    const particles = Array.from({ length: 140 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      size: 4 + Math.random() * 8,
      speedY: 1 + Math.random() * 3,
      speedX: -1 + Math.random() * 2,
      hue: Math.floor(0 + Math.random() * 360),
      depth: Math.random(), // 0 near (blurrier), 1 far (sharper)
    }))
    let start = performance.now()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = performance.now()
      const elapsed = (now - start) / 1000 // seconds
      // After 20s, gradually slow and fade
      const damping = elapsed < 20 ? 1 : Math.max(0, 1 - (elapsed - 20) / 6)
      const globalAlpha = Math.min(1, Math.max(0, damping))
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY * damping
        if (p.y > canvas.height + 20 && damping > 0.05) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }
        ctx.save()
        ctx.globalAlpha = globalAlpha
        ctx.fillStyle = `hsl(${p.hue}, 90%, 55%)`
        // depth-of-field blur: nearer flakes (lower depth) are blurrier
        const blur = (1 - p.depth) * 3
        ;(ctx as any).filter = `blur(${blur}px)`
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6)
        ctx.restore()
      })
      if (globalAlpha > 0.01) {
        animationId = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [state?.inRange])

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background image layer */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: 'url(/dealers-map.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="h-8 w-full bg-black" />
      <div className="h-1 w-full bg-[#EB0A1E]" />
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 text-[#111111]">
        <div className="mx-auto max-w-6xl px-6 py-4 md:py-6 flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
            Toyota <span className="text-[#EB0A1E]">Quote</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/carRec" className="px-3 py-1.5 text-sm font-medium rounded bg-[#111111] text-white">Back</Link>
          </nav>
        </div>
      </header>

      <main className="relative text-[#111111]">
        {/* Bottom-attached sheet */}
        <div className="fixed bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl rounded-t-[28px] bg-white shadow-2xl border border-gray-200 border-b-0 p-6 md:p-7" style={{ minHeight: '40vh' }}>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Find a dealership</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Selection: <span className="font-medium text-[#111111]">{selectedPlan || '—'}</span> • Verified score: <span className="font-medium text-[#111111]">{extractedScore ?? '—'}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:gap-6">
            {dealers.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setModalDealer(d)}
                className="mx-auto w-[92%] md:w-[85%] text-left rounded-2xl border border-gray-200 bg-white/90 shadow-sm overflow-hidden hover:shadow transition"
              >
                <div className="flex flex-col md:flex-row items-stretch gap-0">
                  <img
                    src={d.imageUrl}
                    alt={`${d.name} exterior`}
                    className="w-full md:w-64 h-40 md:h-auto object-cover md:object-cover"
                  />
                  <div className="p-4 md:p-5 flex-1">
                    <div className="text-lg font-semibold">{d.name}</div>
                    <div className="text-sm text-[#6b7280] mt-1">{d.address}</div>
                    <div className="text-sm text-[#6b7280]">{d.phone}</div>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="text-yellow-500">{'★'.repeat(Math.round(d.rating))}</span>
                      <span className="text-[#6b7280]">{d.rating.toFixed(1)} / 5</span>
                      <span className="text-[#6b7280]">• {d.hours}</span>
                    </div>
                    <div className="mt-2">
                      <a href={d.website} target="_blank" rel="noreferrer" className="text-[#111111] underline hover:opacity-80">Visit website</a>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          </div>
        </div>
      </main>

      {state?.inRange && (
        <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />
      )}

      {modalDealer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalDealer(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold">Send information to {modalDealer.name}?</h2>
              <p className="mt-2 text-sm text-[#6b7280]">We’ll share your selection and contact details with the dealership.</p>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setModalDealer(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-[#111111]">Cancel</button>
                <button type="button" onClick={() => setModalDealer(null)} className="px-4 py-2 rounded-lg bg-[#EB0A1E] text-white">Send information</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


