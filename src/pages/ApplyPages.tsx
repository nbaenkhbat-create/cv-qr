import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '../components/Layout'
import { getJob, submitApplication, firebaseErrorMessage } from '../lib/api'
import type { Job } from '../types'
import { Send } from 'lucide-react'

export function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!jobId) return
    getJob(jobId).then((j) => {
      if (!j || !j.active) setNotFound(true)
      else setJob(j)
    })
  }, [jobId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!job) return
    if (!phone.trim()) {
      setError('Утасны дугаар заавал оруулна')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Gmail хаяг заавал оруулна')
      return
    }
    setLoading(true)
    setError('')
    try {
      await submitApplication({
        jobId: job.id,
        employerId: job.employerId,
        jobTitle: job.title,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        answers,
      })
      navigate('/apply/success')
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Илгээхэд алдаа гарлаа'))
    } finally {
      setLoading(false)
    }
  }

  if (notFound) {
    return (
      <div className="page">
        <PublicHeader />
        <div className="auth-card">
          <h1>Холбоос идэвхгүй</h1>
          <p className="muted">Энэ ажил байр хаагдсан эсвэл олдсонгүй.</p>
          <Link to="/" className="btn btn-primary">
            Нүүр хуудас
          </Link>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page">
      <PublicHeader />
      <div className="auth-card wide">
        <p className="eyebrow">Хүсэлт илгээх</p>
        <h1>{job.title}</h1>
        {job.description && <p className="muted">{job.description}</p>}

        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            <span>Таны нэр</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Утасны дугаар *</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="99112233"
            />
            <small className="hint">
              Ажил олгогч CV-г зөвшөөрвөл таны Gmail руу мэдэгдэл очно. Утас болон
              Gmail-ийг үнэн зөв бичнэ үү.
            </small>
          </label>
          <label className="field">
            <span>Gmail хаяг *</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
            />
            <small className="hint">
              Заавал. Зөвшөөрөгдсөн тохиолдолд энэ хаяг руу имэйл ирнэ.
            </small>
          </label>

          {job.questions.map((q) => (
            <label className="field" key={q.id}>
              <span>
                {q.label}
                {q.required ? ' *' : ''}
              </span>
              {q.type === 'textarea' ? (
                <textarea
                  rows={4}
                  required={q.required}
                  value={answers[q.id] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              ) : (
                <input
                  required={q.required}
                  value={answers[q.id] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              )}
            </label>
          ))}

          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Send size={18} /> {loading ? 'Илгээж байна…' : 'Илгээх'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function ApplySuccessPage() {
  return (
    <div className="page">
      <PublicHeader />
      <div className="auth-card success-card">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>
        <h1>Амжилттай илгээлээ!</h1>
        <p className="muted">
          Таны CV ажил олгогчид хүргэгдлээ. Зөвшөөрөгдвөл Gmail руу мэдэгдэл ирнэ.
        </p>
        <Link to="/" className="btn btn-primary">
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  )
}
