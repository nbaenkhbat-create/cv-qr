import { useState } from 'react'
import { Send, X, CheckCircle2, Mail, MailX } from 'lucide-react'
import type { Application } from '../types'

interface Props {
  application: Application
  onClose: () => void
  /** sendEmail=true үед note/imэйл бичвэр дамжина */
  onApproved: (opts: { sendEmail: boolean; note?: string }) => Promise<void>
}

function openMailtoCompose(to: string, subject: string, body: string) {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = mailto
  document.body.appendChild(iframe)
  window.setTimeout(() => iframe.remove(), 2000)
}

export function EmailModal({ application, onClose, onApproved }: Props) {
  const [step, setStep] = useState<'choose' | 'compose' | 'done'>('choose')
  const [sentMail, setSentMail] = useState(false)
  const [subject, setSubject] = useState(
    `CV QR — ${application.jobTitle} ярилцлагын урилга`,
  )
  const [body, setBody] = useState(
    `Сайн байна уу ${application.name},\n\nТаны илгээсэн CV-г хүлээн авч, зөвшөөрлөө.\nБид тантай удахгүй холбогдоно.\n\nХүндэтгэсэн,\nАжил олгогч`,
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function approveWithoutEmail() {
    setSending(true)
    setError('')
    try {
      await onApproved({ sendEmail: false })
      setSentMail(false)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setSending(false)
    }
  }

  async function approveWithEmail() {
    setSending(true)
    setError('')
    try {
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

      if (!delivered) {
        openMailtoCompose(application.email, subject, body)
      }

      await onApproved({ sendEmail: true, note: body })
      setSentMail(true)
      setStep('done')
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
          <h3>CV зөвшөөрөх</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Хаах">
            <X size={20} />
          </button>
        </div>

        {step === 'choose' && (
          <div className="stack">
            <p className="muted">
              <strong>{application.name}</strong>-ийн CV-г зөвшөөрөхдөө Gmail илгээх үү?
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sending}
              onClick={() => setStep('compose')}
            >
              <Mail size={18} /> Gmail илгээх
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={sending}
              onClick={approveWithoutEmail}
            >
              <MailX size={18} /> {sending ? 'Хадгалж байна…' : 'Gmail илгээхгүй · Зөвхөн зөвшөөрөх'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        )}

        {step === 'compose' && (
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
            <p className="hint">Имэйл илгээгдэж, CV «Зөвшөөрсөн» болно. Хуудас солигдохгүй.</p>
            {error && <p className="error">{error}</p>}
            <div className="action-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={sending}
                onClick={approveWithEmail}
              >
                <Send size={18} /> {sending ? 'Илгээж байна…' : 'Илгээх · Зөвшөөрөх'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={sending}
                onClick={() => setStep('choose')}
              >
                Буцах
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="stack">
            <div className="ok-banner">
              <CheckCircle2 size={28} />
              <div>
                <strong>CV зөвшөөрөгдлөө</strong>
                <p className="muted">
                  {sentMail
                    ? 'Gmail илгээх арга хэмжээ авсан. Хэрэв compose нээгдсэн бол «Илгээх» дарна уу.'
                    : 'Gmail илгээгээгүй. Зөвхөн статус «Зөвшөөрсөн» болсон.'}
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Хаах
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
