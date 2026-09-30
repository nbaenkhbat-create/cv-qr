import type { Application, Job, PublicCvVisibility } from '../types'
import { Mail, Phone } from 'lucide-react'

export function defaultPublicVisibility(
  job: Job | null,
  app: Application,
): PublicCvVisibility {
  const questions: Record<string, boolean> = {}
  for (const q of job?.questions || []) {
    questions[q.id] = app.publicVisibility?.questions?.[q.id] ?? q.visibleOnPublic
  }
  return {
    showPhone: app.publicVisibility?.showPhone ?? true,
    showEmail: app.publicVisibility?.showEmail ?? true,
    showPhoto: app.publicVisibility?.showPhoto ?? Boolean(app.photoUrl),
    questions,
  }
}

export function CvSheet({
  app,
  job,
  visibility,
}: {
  app: Application
  job: Job | null
  visibility: PublicCvVisibility
}) {
  const visibleQs = (job?.questions || []).filter((q) => visibility.questions[q.id])
  const showPhoto = visibility.showPhoto && app.photoUrl

  return (
    <article className="cv-sheet">
      <header className="cv-header">
        {showPhoto ? (
          <img className="cv-avatar-img" src={app.photoUrl} alt={app.name} />
        ) : (
          <div className="cv-avatar">{app.name.slice(0, 1)}</div>
        )}
        <div>
          <h1>{app.name}</h1>
          <p className="cv-role">{app.jobTitle}</p>
          <ul className="cv-contacts">
            {visibility.showPhone && (
              <li>
                <Phone size={14} /> {app.phone}
              </li>
            )}
            {visibility.showEmail && (
              <li>
                <Mail size={14} /> {app.email}
              </li>
            )}
          </ul>
        </div>
      </header>

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
  )
}
