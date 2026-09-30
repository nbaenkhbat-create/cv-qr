import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getApplicationsByEmployer, getJobsByEmployer } from '../../lib/api'
import type { Application, Job } from '../../types'
import { MobileBottomNav } from '../../components/Layout'
import { FileText, Plus, QrCode, Users } from 'lucide-react'

export function EmployerDashboard() {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getJobsByEmployer(user.uid), getApplicationsByEmployer(user.uid)])
      .then(([j, a]) => {
        setJobs(j)
        setApps(a)
      })
      .finally(() => setLoading(false))
  }, [user])

  const total = apps.length
  const neu = apps.filter((a) => a.status === 'new').length
  const contacted = apps.filter(
    (a) => a.status === 'approved' || a.status === 'contacted',
  ).length

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Ажил олгогч</p>
          <h1>{profile?.companyName || 'Хянах самбар'}</h1>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          <Plus size={18} /> Ажил байр нэмэх
        </Link>
      </header>

      <div className="stat-row">
        <div className="stat">
          <Users size={20} />
          <div>
            <strong>{total}</strong>
            <span>Нийт CV</span>
          </div>
        </div>
        <div className="stat">
          <FileText size={20} />
          <div>
            <strong>{neu}</strong>
            <span>Шинэ</span>
          </div>
        </div>
        <div className="stat">
          <QrCode size={20} />
          <div>
            <strong>{contacted}</strong>
            <span>Холбогдсон</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>Ажил байрнууд</h2>
              <Link to="/employer/jobs">Бүгд</Link>
            </div>
            {jobs.length === 0 ? (
              <p className="muted">Одоогоор ажил байр алга. Эхнийхээ үүсгэнэ үү.</p>
            ) : (
              <ul className="job-list">
                {jobs.slice(0, 5).map((job) => (
                  <li key={job.id}>
                    <Link to={`/employer/jobs/${job.id}`}>
                      <strong>{job.title}</strong>
                      <span>{job.active ? 'Идэвхтэй' : 'Хаалттай'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Сүүлийн CV</h2>
              <Link to="/employer/applications">Бүгд</Link>
            </div>
            {apps.length === 0 ? (
              <p className="muted">Ирсэн CV байхгүй байна.</p>
            ) : (
              <ul className="cv-list">
                {apps.slice(0, 6).map((a) => (
                  <li key={a.id}>
                    <Link to={`/employer/applications/${a.id}`}>
                      <span className="avatar">{a.name.slice(0, 1)}</span>
                      <div>
                        <strong>{a.name}</strong>
                        <span>{a.jobTitle}</span>
                      </div>
                      <time>{new Date(a.createdAt).toLocaleDateString('mn-MN')}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <MobileBottomNav />
    </div>
  )
}
