import { useState } from 'react'
import { Send, X, CheckCircle2 } from 'lucide-react'
import type { Application } from '../types'

interface Props {
  application: Application
  onClose: () => void
  onSent: (note: string) => Promise<void>
}

function openMailtoCompose(to: string, subject: string, body: string) {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  // iframe — цагаан хоосон tab/цонх нээхгүй, SPA дээр үлдэнэ
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = mailto
  document.body.appendChild(iframe)
  window.setTimeout(() => {
    iframe.remove()
  }, 2000)
}

export function EmailModal({ application, onClose, onSent }: Props) {
  const [subject, setSubject] = useState(
    `CV QR — ${application.jobTitle} ярилцлагын урилга`,
  )
  const [body, setBody] = useState(
    `Сайн байна уу ${application.name},\n\nТаны илгээсэн CV-г хүлээн авч, зөвшөөрлөө.\nБид тантай удахгүй холбогдоно.\n\nХүндэтгэсэн,\nАжил олгогч`,
  )
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      // 1) Бодит имэйл илгээх оролдлого (FormSubmit → ажил хайгчийн Gmail)
      let delivered = false
      try {
        const res = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(application.email)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              name: 'CV QR',
              subject,
              message: body,
              _replyto: application.email,
              _template: 'box',
              _captcha: 'false',
            }),
          },
        )
        delivered = res.ok
      } catch {
        delivered = false
      }

      // 2) Хэрэв шууд илгээгдээгүй бол Gmail compose нээнэ (цагаан дэлгэцгүй)
      if (!delivered) {
        openMailtoCompose(application.email, subject, body)
      }

      await onSent(body)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Илгээхэд алдаа гарлаа')
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

        {done ? (
          <div className="stack">
            <div className="ok-banner">
              <CheckCircle2 size={28} />
              <div>
                <strong>Зөвшөөрөгдөж, имэйл бэлдлээ</strong>
                <p className="muted">
                  Хэрэв Gmail compose нээгдсэн бол «Илгээх» товчийг дарна уу. CV статус
                  «Зөвшөөрсөн» болсон.
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Хаах
            </button>
          </div>
        ) : (
          <>
            <label className="field">
              <span>Хүлээн авагч (ажил хайгчийн Gmail)</span>
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
              Зөвшөөрөх үед энэ захиа ажил хайгчийн Gmail руу илгээгдэнэ. Хуудас солигдохгүй.
            </p>
            {error && <p className="error">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              disabled={sending}
              onClick={handleSend}
            >
              <Send size={18} /> {sending ? 'Илгээж байна…' : 'Зөвшөөрөх · Имэйл илгээх'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
