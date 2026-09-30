import { useState } from 'react'
import { Send, X } from 'lucide-react'
import type { Application } from '../types'

interface Props {
  application: Application
  onClose: () => void
  onSent: (note: string) => Promise<void>
}

export function EmailModal({ application, onClose, onSent }: Props) {
  const [subject, setSubject] = useState(
    `CV QR — ${application.jobTitle} ярилцлагын урилга`,
  )
  const [body, setBody] = useState(
    `Сайн байна уу ${application.name},\n\nТаны илгээсэн CV-г хүлээн авч, зөвшөөрлөө.\nБид тантай удахгүй холбогдоно.\n\nХүндэтгэсэн,\nАжил олгогч`,
  )
  const [sending, setSending] = useState(false)

  async function handleSend() {
    setSending(true)
    try {
      const mailto = `mailto:${encodeURIComponent(application.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailto, '_blank')
      await onSent(body)
      onClose()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h3>Имэйл илгээх</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Хаах">
            <X size={20} />
          </button>
        </div>
        <label className="field">
          <span>Хүлээн авагч</span>
          <input value={application.email} readOnly />
        </label>
        <label className="field">
          <span>Гарчиг</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="field">
          <span>Зурвас (та өөрөө бичнэ)</span>
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <p className="hint">
          Имэйл таны Gmail/Outlook дээр нээгдэнэ. Илгээсний дараа CV статус
          «Зөвшөөрсөн» болно.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={sending}
          onClick={handleSend}
        >
          <Send size={18} /> Имэйл илгээх
        </button>
      </div>
    </div>
  )
}
