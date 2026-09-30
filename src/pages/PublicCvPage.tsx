import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PublicHeader } from '../components/Layout'
import { getApplication, getJob } from '../lib/api'
import type { Application, Job } from '../types'
import { Download, Mail, MapPin, Phone, Printer } from 'lucide-react'

export function PublicCvPage() {
  const { appId } = useParams()
  const [app, setApp] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [tab, setTab] = useState<'intro' | 'answers'>('intro')

  useEffect(() => {
    if (!appId) return
    getApplication(appId).then((a) => {
      setApp(a)
      if (a) getJob(a.jobId).then(setJob)
    })
  }, [appId])

  if (!app) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  const visibleQs = (job?.questions || []).filter((q) => q.visibleOnPublic)

  function printCv() {
    window.print()
  }

  function downloadTxt() {
    const lines = [
      app!.name,
      app!.jobTitle,
      `Утас: ${app!.phone}`,
      `Имэйл: ${app!.email}`,
      '',
      ...visibleQs.map((q) => `${q.label}: ${app!.answers[q.id] || ''}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${app!.name}-CV.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page cv-public">
      <div className="no-print">
        <PublicHeader />
      </div>
      <article className="cv-sheet container">
        <header className="cv-header">
          <div className="cv-avatar">{app.name.slice(0, 1)}</div>
          <div>
            <h1>{app.name}</h1>
            <p className="cv-role">{app.jobTitle}</p>
            <ul className="cv-contacts">
              <li>
                <Phone size={14} /> {app.phone}
              </li>
              <li>
                <Mail size={14} /> {app.email}
              </li>
              {job?.title && (
                <li>
                  <MapPin size={14} /> {job.title}
                </li>
              )}
            </ul>
          </div>
        </header>

        <div className="cv-actions no-print">
          <button type="button" className="btn btn-primary" onClick={downloadTxt}>
            <Download size={18} /> CV татах
          </button>
          <button type="button" className="btn btn-ghost" onClick={printCv}>
            <Printer size={18} /> Хэвлэх
          </button>
        </div>

        <div className="cv-tabs no-print">
          <button
            type="button"
            className={tab === 'intro' ? 'active' : ''}
            onClick={() => setTab('intro')}
          >
            Танилцуулга
          </button>
          <button
            type="button"
            className={tab === 'answers' ? 'active' : ''}
            onClick={() => setTab('answers')}
          >
            Дэлгэрэнгүй
          </button>
        </div>

        <section className="cv-body">
          {visibleQs.length === 0 ? (
            <p className="muted">Нийтийн харагдах мэдээлэл тохируулаагүй байна.</p>
          ) : (
            <dl className="answer-list">
              {visibleQs.map((q) => (
                <div key={q.id}>
                  <dt>{q.label}</dt>
                  <dd>{app.answers[q.id] || '—'}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </article>
    </div>
  )
}
