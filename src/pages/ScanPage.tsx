import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { PublicHeader } from '../components/Layout'
import { Flashlight, FlashlightOff } from 'lucide-react'

export function ScanPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [torch, setTorch] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const id = 'qr-reader'
    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras.length) {
          setError('Камер олдсонгүй')
          return
        }
        const camId = cameras[cameras.length - 1].id
        return scanner.start(
          camId,
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (started.current) return
            started.current = true
            scanner.stop().catch(() => {})
            try {
              const url = new URL(decoded)
              navigate(url.pathname + url.search)
            } catch {
              if (decoded.includes('/apply/') || decoded.includes('/cv/')) {
                const path = decoded.replace(/^https?:\/\/[^/]+/, '')
                navigate(path)
              } else {
                setError('QR танигдсангүй: ' + decoded)
                started.current = false
              }
            }
          },
          () => {},
        )
      })
      .catch(() => setError('Камер нээхэд алдаа гарлаа. HTTPS эсвэл localhost хэрэгтэй.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [navigate])

  async function toggleTorch() {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      // @ts-expect-error torch capability varies by device
      await scanner.applyVideoConstraints({ advanced: [{ torch: !torch }] })
      setTorch(!torch)
    } catch {
      setError('Гэрэл энэ төхөөрөмж дээр дэмжигдэхгүй')
    }
  }

  return (
    <div className="page scan-page">
      <PublicHeader />
      <div className="scan-frame">
        <h1>QR уншуулах</h1>
        <p>Кодыг уншуулаад CV эсвэл анкет шууд нээнэ</p>
        <div id="qr-reader" className="qr-reader" />
        {error && <p className="error">{error}</p>}
        <button type="button" className="btn btn-ghost" onClick={toggleTorch}>
          {torch ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
          {torch ? 'Гэрэл унтраах' : 'Гэрэл асаах'}
        </button>
      </div>
    </div>
  )
}
