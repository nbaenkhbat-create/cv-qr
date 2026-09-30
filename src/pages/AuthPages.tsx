import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/Layout'
import {
  loginEmployer,
  registerEmployer,
  resetPasswordByGmail,
} from '../lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginEmployer(username.trim(), password)
      navigate('/employer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Нэвтрэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  async function onReset(e: FormEvent) {
    e.preventDefault()
    setResetMsg('')
    setError('')
    setResetLoading(true)
    try {
      await resetPasswordByGmail(resetEmail)
      setResetMsg('Нууц үг сэргээх холбоосыг Gmail руу илгээлээ. Имэйлээ шалгана уу.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сэргээхэд алдаа гарлаа')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="page">
      <PublicHeader />
      <div className="auth-card">
        <h1>Нэвтрэх</h1>
        <p className="muted">Ажил олгогчийн бүртгэлээр нэвтэрнэ үү</p>

        {!showForgot ? (
          <>
            <form onSubmit={onSubmit} className="stack">
              <label className="field">
                <span>Нэвтрэх нэр</span>
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="жишээ: abc_restaurant"
                />
              </label>
              <label className="field">
                <span>Нууц үг</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="auth-row">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setShowForgot(true)
                    setError('')
                    setResetMsg('')
                  }}
                >
                  Нууц үг мартсан уу?
                </button>
              </div>
              {error && <p className="error">{error}</p>}
              <button className="btn btn-primary" disabled={loading} type="submit">
                {loading ? 'Түр хүлээнэ үү…' : 'Нэвтрэх'}
              </button>
            </form>
            <p className="center muted">
              Бүртгэл байхгүй юу? <Link to="/register">Бүртгүүлэх</Link>
            </p>
          </>
        ) : (
          <>
            <p className="muted">
              Бүртгэлийнхээ Gmail хаягийг оруулна уу. Сэргээх холбоос имэйлээр ирнэ.
            </p>
            <form onSubmit={onReset} className="stack">
              <label className="field">
                <span>Gmail</span>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@gmail.com"
                />
              </label>
              {error && <p className="error">{error}</p>}
              {resetMsg && <p className="ok-msg">{resetMsg}</p>}
              <button className="btn btn-primary" disabled={resetLoading} type="submit">
                {resetLoading ? 'Илгээж байна…' : 'Gmail-ээр сэргээх'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowForgot(false)
                  setError('')
                  setResetMsg('')
                }}
              >
                Буцах
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerEmployer({
        username: username.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        phone: phone.trim(),
      })
      navigate('/employer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Бүртгэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <PublicHeader />
      <div className="auth-card">
        <h1>Ажил олгогч бүртгэл</h1>
        <p className="muted">Компани / байгууллагын бүртгэл үүсгэнэ</p>
        <form onSubmit={onSubmit} className="stack">
          <label className="field">
            <span>Байгууллагын нэр</span>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Жишээ: ABC Restaurant"
            />
          </label>
          <label className="field">
            <span>Нэвтрэх нэр *</span>
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="жишээ: abc_restaurant"
              pattern="[A-Za-z0-9._-]{3,30}"
              title="3–30 тэмдэгт, латин үсэг/тоо/._-"
            />
            <small className="hint">Нэвтрэхэд энэ нэрийг ашиглана</small>
          </label>
          <label className="field">
            <span>Утас</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="field">
            <span>Gmail *</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
            />
            <small className="hint">
              Нууц үг мартсан үед энэ Gmail руу сэргээх холбоос илгээнэ
            </small>
          </label>
          <label className="field">
            <span>Нууц үг *</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Үүсгэж байна…' : 'Бүртгүүлэх'}
          </button>
        </form>
        <p className="center muted">
          Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link>
        </p>
      </div>
    </div>
  )
}
