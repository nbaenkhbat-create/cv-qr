import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download } from 'lucide-react'

interface Props {
  value: string
  title?: string
  size?: number
}

export function QrDownloadCard({ value, title = 'QR код', size = 220 }: Props) {
  const canvasWrap = useRef<HTMLDivElement>(null)

  function downloadPng() {
    const canvas = canvasWrap.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-')}-qr.png`
    a.click()
  }

  return (
    <div className="qr-card">
      <h3>{title}</h3>
      <div className="qr-canvas" ref={canvasWrap}>
        <QRCodeCanvas
          value={value}
          size={size}
          level="M"
          includeMargin
          fgColor="#0b3d91"
          bgColor="#ffffff"
        />
      </div>
      <p className="qr-link mono">{value}</p>
      <button type="button" className="btn btn-primary" onClick={downloadPng}>
        <Download size={18} /> QR татах
      </button>
    </div>
  )
}
