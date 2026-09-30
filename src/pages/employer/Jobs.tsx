import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  applyUrl,
  createJob,
  cvUrl,
  getApplicationsByEmployer,
  getJob,
  getJobsByEmployer,
  updateJob,
  updateQuestionVisibility,
  firebaseErrorMessage,
} from '../../lib/api'
import type { Application, Job, JobQuestion } from '../../types'
import { QrDownloadCard } from '../../components/QrDownloadCard'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

function newQuestion(): JobQuestion {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'text',
    required: true,
    visibleOnPublic: true,
  }
}

export function JobsListPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!user) return
    getJobsByEmployer(user.uid).then(setJobs)
  }, [user])

  return (
    <div className="dash">
      <header className="dash-head">
        <h1>Ажил байр</h1>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          <Plus size={18} /> Шинэ ажил байр
        </Link>
      </header>
      <ul className="job-list carded">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link to={`/employer/jobs/${job.id}`}>
              <strong>{job.title}</strong>
              <span>{job.questions.length} асуулт · {job.active ? 'Идэвхтэй' : 'Хаалттай'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function JobCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<JobQuestion[]>([
    { ...newQuestion(), label: 'Таны туршлага / товч танилцуулга', type: 'textarea' },
    { ...newQuestion(), label: 'Мэргэжил / албан тушаал', type: 'text' },
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateQ(id: string, patch: Partial<JobQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (questions.some((q) => !q.label.trim())) {
      setError('Бүх асуултын гарчгийг бөглөнө үү')
      return
    }
    setLoading(true)
    setError('')
    try {
      const id = await createJob(user.uid, { title, description, questions })
      navigate(`/employer/jobs/${id}`)
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Алдаа гарлаа'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dash narrow">
      <h1>Шинэ ажил байр</h1>
      <p className="muted">
        Жишээ: Зөөгч, Тогооч — тус бүрд өөр асуулт хадгална. Ажил байр бүр өөрийн
        link + QR авна.
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Ажлын байрны нэр</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Жишээ: Зөөгч" />
        </label>
        <label className="field">
          <span>Тайлбар</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="questions-editor">
          <div className="panel-head">
            <h2>CV асуултууд</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuestions((q) => [...q, newQuestion()])}
            >
              <Plus size={16} /> Асуулт нэмэх
            </button>
          </div>
          {questions.map((q, i) => (
            <div className="question-row" key={q.id}>
              <span className="q-num">{i + 1}</span>
              <input
                required
                placeholder="Асуулт"
                value={q.label}
                onChange={(e) => updateQ(q.id, { label: e.target.value })}
              />
              <select
                value={q.type}
                onChange={(e) =>
                  updateQ(q.id, { type: e.target.value as JobQuestion['type'] })
                }
              >
                <option value="text">Богино хариулт</option>
                <option value="textarea">Урт хариулт</option>
              </select>
              <label className="check">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQ(q.id, { required: e.target.checked })}
                />
                Заавал
              </label>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                aria-label="Устгах"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? 'Хадгалж байна…' : 'Хадгалах · QR үүсгэх'}
        </button>
      </form>
    </div>
  )
}

export function JobDetailPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!jobId) return
    getJob(jobId).then(setJob)
  }, [jobId])

  if (!job) {
    return (
      <div className="dash">
        <div className="spinner" />
      </div>
    )
  }

  const url = applyUrl(job.id)

  async function toggleVisibility(qid: string) {
    if (!job) return
    const questions = job.questions.map((q) =>
      q.id === qid ? { ...q, visibleOnPublic: !q.visibleOnPublic } : q,
    )
    await updateQuestionVisibility(job.id, questions)
    setJob({ ...job, questions })
  }

  async function toggleActive() {
    if (!job) return
    await updateJob(job.id, { active: !job.active })
    setJob({ ...job, active: !job.active })
  }

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Ажил байр</p>
          <h1>{job.title}</h1>
          <p className="muted">{job.description}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={toggleActive}>
          {job.active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
        </button>
      </header>

      <div className="two-col">
        <QrDownloadCard value={url} title={job.title} />
        <div className="panel">
          <h2>Холбоос</h2>
          <p className="mono break">{url}</p>
          <button type="button" className="btn btn-primary" onClick={copyLink}>
            {copied ? 'Хуулсан!' : 'Link хуулах'}
          </button>
          <p className="hint">
            Энэ link/QR-ийг ажил хайгчид өгнө. Уншуулахад CV бөглөх форм нээгдэнэ.
          </p>
        </div>
      </div>

      <section className="panel">
        <h2>QR-ээр харагдах талбарууд (hide / show)</h2>
        <p className="muted">
          Нийтийн CV харагдах үед нуухыг хүссэн асуултаа нууна.
        </p>
        <ul className="visibility-list">
          {job.questions.map((q) => (
            <li key={q.id}>
              <span>{q.label}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleVisibility(q.id)}>
                {q.visibleOnPublic ? (
                  <>
                    <Eye size={16} /> Харагдана
                  </>
                ) : (
                  <>
                    <EyeOff size={16} /> Нуугдсан
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function EmployerQrPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getApplicationsByEmployer(user.uid)
      .then(setApps)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="dash">
      <h1>CV QR кодууд</h1>
      <p className="muted">
        Ажил хайгчдын илгээсэн CV бүрийн QR. Уншуулахад тухайн хүний хариулт бүхий CV
        нээгдэнэ. (Ажил байрны анкет QR энд биш — ажил байр дээрээс авна.)
      </p>
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="qr-grid">
            {apps.map((a) => (
              <div key={a.id} className="qr-with-meta">
                <QrDownloadCard
                  value={cvUrl(a.id)}
                  title={`${a.name} — ${a.jobTitle}`}
                  size={180}
                />
                <p className="muted center">
                  {a.email} · {new Date(a.createdAt).toLocaleDateString('mn-MN')}
                </p>
              </div>
            ))}
          </div>
          {apps.length === 0 && (
            <p className="muted">
              Одоогоор ирсэн CV алга. Ажил хайгч анкет бөглөсний дараа энд CV QR гарна.
            </p>
          )}
        </>
      )}
    </div>
  )
}

