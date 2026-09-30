import { useState } from 'react'
import { Send, X, CheckCircle2, Mail, MailX } from 'lucide-react'
import type { Application } from '../types'

interface Props {
  application: Application
  onClose: () => void
  onApproved: (opts: { sendEmail: boolean; note?: string }) => Promise<void>
}

export function gmailComposeUrl(to: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    tf: '1',
    to,
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

export function EmailModal({ application, onClose, onApproved }: Props) {
  const [step, setStep] = useState<'choose' | 'compose' | 'done'>('choose')
  const [sentMail, setSentMail] = useState(false)
  const [gmailUrl, setGmailUrl] = useState('')
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
      const url = gmailComposeUrl(application.email, subject, body)
      setGmailUrl(url)
      const popup = window.open(url, '_blank', 'noopener,noreferrer')
      if (!popup) {
        setError('Цонх хаагдсан. Доорх «Gmail нээх» холбоос дээр дарна уу.')
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
              <strong>{application.name}</strong> · {application.email}
            </p>
            <p className="hint">
              Gmail илгээх бол таны Gmail нээгдэж, хүлээн авагч/гарчиг/зурвас бөглөгдөнө.
              Тэнд <strong>Илгээх</strong> дарснаар ажил хайгчид очно.
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
            <p className="hint">
              Дараах товч таны Gmail-ийг нээнэ. Gmail дээр <strong>Илгээх</strong> дарна уу —
              тэгж байж ажил хайгчийн {application.email} хаяг руу очно.
            </p>
            {error && <p className="error">{error}</p>}
            <div className="action-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={sending}
                onClick={approveWithEmail}
              >
                <Send size={18} /> {sending ? 'Нээж байна…' : 'Gmail нээх · зөвшөөрөх'}
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
                    ? 'Gmail цонхонд «Илгээх» дарж дуусгана уу. Тэгж байж ажил хайгчид очно.'
                    : 'Gmail илгээгээгүй. Зөвхөн статус «Зөвшөөрсөн» болсон.'}
                </p>
              </div>
            </div>
            {sentMail && gmailUrl && (
              <a className="btn btn-primary" href={gmailUrl} target="_blank" rel="noreferrer">
                <Mail size={18} /> Gmail дахин нээх
              </a>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Хаах
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
