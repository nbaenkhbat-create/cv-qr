import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, EyeOff, ImagePlus, Trash2 } from 'lucide-react'
import { PublicHeader } from '../components/Layout'
import { CvSheet, defaultPublicVisibility } from '../components/CvSheet'
import { useAuth } from '../context/AuthContext'
import {
  firebaseErrorMessage,
  getApplication,
  getJob,
  updatePublicCv,
  uploadCvPhoto,
} from '../lib/api'
import type { Application, Job, PublicCvVisibility } from '../types'

export function PublicCvPage() {
  const { appId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [app, setApp] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [vis, setVis] = useState<PublicCvVisibility | null>(null)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!appId) return
    getApplication(appId).then((a) => {
      if (!a) {
        setMissing(true)
        return
      }
      setApp(a)
      getJob(a.jobId).then((j) => {
        setJob(j)
        setVis(defaultPublicVisibility(j, a))
      })
    })
  }, [appId])

  const isOwner = Boolean(user && app && user.uid === app.employerId)

  if (authLoading || (!app && !missing)) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  if (missing || !app || !vis) {
    return (
      <div className="page">
        <PublicHeader />
        <div className="auth-card">
          <h1>CV олдсонгүй</h1>
          <p className="muted">Энэ QR холбоос хүчингүй эсвэл устгагдсан.</p>
          <Link to="/" className="btn btn-primary">
            Нүүр хуудас
          </Link>
        </div>
      </div>
    )
  }

  function setField<K extends keyof PublicCvVisibility>(key: K, value: PublicCvVisibility[K]) {
    setVis((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function toggleQuestion(id: string) {
    setVis((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        questions: { ...prev.questions, [id]: !prev.questions[id] },
      }
    })
  }

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !app) return
    setError('')
    try {
      const url = await uploadCvPhoto(app.id, file)
      setApp({ ...app, photoUrl: url })
      setField('showPhoto', true)
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Зураг оруулахад алдаа гарлаа'))
    }
  }

  function removePhoto() {
    if (!app) return
    setApp({ ...app, photoUrl: '' })
    setField('showPhoto', false)
  }

  async function save() {
    if (!app || !vis) return
    setSaving(true)
    setError('')
    setMsg('')
    try {
      await updatePublicCv(app.id, {
        publicVisibility: vis,
        photoUrl: app.photoUrl || '',
      })
      setMsg('Хадгаллаа. QR уншуулсан хүн зөвхөн энэ хувилбарыг харна.')
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Хадгалахад алдаа гарлаа'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page cv-public">
      <PublicHeader />
      <div className={`container cv-public-wrap ${isOwner ? 'cv-public-owner' : ''}`}>
        <CvSheet app={app} job={job} visibility={vis} />

        {isOwner && (
          <aside className="panel cv-edit-panel">
            <p className="eyebrow">Зөвхөн ажил олгогч засна</p>
            <h2>Нийтийн CV тохируулах</h2>
            <p className="muted">
              QR уншуулсан хүн энэ тохиргоог засахгүй. Таны хадгалсан харагдах байдлыг л харна.
            </p>

            <label className="field">
              <span>Цээж зураг (заавал биш)</span>
              <div className="action-row">
                <label className="btn btn-ghost btn-sm">
                  <ImagePlus size={16} /> Зураг оруулах
                  <input type="file" accept="image/*" hidden onChange={onPhoto} />
                </label>
                {app.photoUrl && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={removePhoto}>
                    <Trash2 size={16} /> Зураг хасах
                  </button>
                )}
              </div>
            </label>

            <ul className="visibility-list">
              <li>
                <span>Цээж зураг</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setField('showPhoto', !vis.showPhoto)}
                  disabled={!app.photoUrl}
                >
                  {vis.showPhoto && app.photoUrl ? (
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
              <li>
                <span>Утас — {app.phone}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setField('showPhone', !vis.showPhone)}
                >
                  {vis.showPhone ? (
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
              <li>
                <span>Gmail — {app.email}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setField('showEmail', !vis.showEmail)}
                >
                  {vis.showEmail ? (
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
              {(job?.questions || []).map((q) => (
                <li key={q.id}>
                  <span>
                    {q.label}
                    <em className="vis-answer">{app.answers[q.id] || '—'}</em>
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    {vis.questions[q.id] ? (
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

            {error && <p className="error">{error}</p>}
            {msg && <p className="ok-msg">{msg}</p>}
            <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? 'Хадгалж байна…' : 'Хадгалах'}
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}
