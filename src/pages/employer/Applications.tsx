import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getApplication,
  getApplicationsByEmployer,
  getJob,
  updateApplicationStatus,
} from '../../lib/api'
import type { Application, ApplicationStatus, Job } from '../../types'
import { EmailModal } from '../../components/EmailModal'
import { MobileBottomNav } from '../../components/Layout'
import { Check, Search, X } from 'lucide-react'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: 'Шинэ',
  viewed: 'Үзсэн',
  approved: 'Зөвшөөрсөн',
  rejected: 'Татгалзсан',
  contacted: 'Холбогдсон',
}

export function ApplicationsPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'new'>('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!user) return
    getApplicationsByEmployer(user.uid).then(setApps)
  }, [user])

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false
      if (q && !`${a.name} ${a.jobTitle} ${a.email}`.toLowerCase().includes(q.toLowerCase()))
        return false
      return true
    })
  }, [apps, filter, q])

  return (
    <div className="dash">
      <header className="dash-head">
        <h1>Ирсэн CV</h1>
      </header>

      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Хайх…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="tabs">
          {(['all', 'new', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'all'
                ? 'Бүгд'
                : f === 'new'
                  ? 'Шинэ'
                  : f === 'approved'
                    ? 'Зөвшөөрсөн'
                    : 'Татгалзсан'}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Нэр</th>
              <th>Мэргэжил / Ажил</th>
              <th>Огноо</th>
              <th>Статус</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.name}</td>
                <td>{a.jobTitle}</td>
                <td>{new Date(a.createdAt).toLocaleDateString('mn-MN')}</td>
                <td>
                  <span className={`badge status-${a.status}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td>
                  <Link to={`/employer/applications/${a.id}`}>Харах</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted center pad">CV олдсонгүй</p>}
      </div>
      <MobileBottomNav />
    </div>
  )
}

export function ApplicationDetailPage() {
  const { appId } = useParams()
  const [app, setApp] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [showApprove, setShowApprove] = useState(false)

  useEffect(() => {
    if (!appId) return
    getApplication(appId).then(async (a) => {
      setApp(a)
      if (a) {
        if (a.status === 'new') {
          await updateApplicationStatus(a.id, 'viewed')
          setApp({ ...a, status: 'viewed' })
        }
        getJob(a.jobId).then(setJob)
      }
    })
  }, [appId])

  if (!app) {
    return (
      <div className="dash">
        <div className="spinner" />
      </div>
    )
  }

  async function reject() {
    await updateApplicationStatus(app!.id, 'rejected')
    setApp({ ...app!, status: 'rejected' })
  }

  async function onApproved(opts: { sendEmail: boolean; note?: string }) {
    const note = opts.sendEmail
      ? opts.note || ''
      : 'Gmail илгээгээгүй — зөвхөн зөвшөөрсөн'
    await updateApplicationStatus(app!.id, 'approved', note)
    setApp({ ...app!, status: 'approved', employerNote: note })
  }

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="eyebrow">{app.jobTitle}</p>
          <h1>{app.name}</h1>
          <p className="muted">
            {app.phone} · {app.email}
          </p>
        </div>
        <span className={`badge status-${app.status}`}>{STATUS_LABEL[app.status]}</span>
      </header>

      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={() => setShowApprove(true)}>
          <Check size={18} /> Зөвшөөрөх
        </button>
        <button type="button" className="btn btn-danger" onClick={reject}>
          <X size={18} /> Татгалзах
        </button>
        <Link className="btn btn-ghost" to={`/cv/${app.id}`} target="_blank">
          Нийтийн CV харах
        </Link>
      </div>

      <section className="panel">
        <h2>Хариултууд</h2>
        <dl className="answer-list">
          {(job?.questions || []).map((q) => (
            <div key={q.id}>
              <dt>{q.label}</dt>
              <dd>{app.answers[q.id] || '—'}</dd>
            </div>
          ))}
          {Object.keys(app.answers).length === 0 && (
            <p className="muted">Хариулт байхгүй</p>
          )}
        </dl>
      </section>

      {showApprove && (
        <EmailModal
          application={app}
          onClose={() => setShowApprove(false)}
          onApproved={onApproved}
        />
      )}
    </div>
  )
}
