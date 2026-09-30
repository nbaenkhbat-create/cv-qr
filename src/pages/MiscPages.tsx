import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PublicHeader } from '../components/Layout'

export function ProfilePage() {
  const { profile, user } = useAuth()
  return (
    <div className="dash">
      <h1>Профайл</h1>
      <div className="panel">
        <dl className="answer-list">
          <div>
            <dt>Байгууллага</dt>
            <dd>{profile?.companyName || '—'}</dd>
          </div>
          <div>
            <dt>Нэвтрэх нэр</dt>
            <dd>{profile?.username || '—'}</dd>
          </div>
          <div>
            <dt>Gmail</dt>
            <dd>{user?.email || profile?.email || '—'}</dd>
          </div>
          <div>
            <dt>Утас</dt>
            <dd>{profile?.phone || '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="dash">
      <h1>Тохиргоо</h1>
      <div className="panel">
        <p className="muted">
          Имэйл илгээх: зөвшөөрөх үед Gmail/mailto нээгдэнэ. Cloud Functions-ээр
          автомат SMTP дараа нэмж болно.
        </p>
      </div>
    </div>
  )
}

export function HelpPage() {
  return (
    <div className="page">
      <PublicHeader />
      <div className="container help">
        <h1>Тусламж</h1>
        <ol className="help-steps">
          <li>Ажил олгогч бүртгүүлж, ажил байр үүсгэнэ (асуултуудтай).</li>
          <li>Ажил байр бүрийн link/QR-ийг татаж, нэрийн хуудсанд хэвлэнэ.</li>
          <li>Ажил хайгч QR уншуулж эсвэл link-ээр орж CV бөглөнө (утас+Gmail заавал).</li>
          <li>«Ирсэн CV» хэсэгт зөвшөөрөх/татгалзах — зөвшөөрвөл имэйл бичнэ.</li>
          <li>CV QR-ийг уншуулахад hide/show талбарууд харагдана; татаж хэвлэж болно.</li>
        </ol>
        <Link to="/" className="btn btn-primary">
          Нүүр хуудас
        </Link>
      </div>
    </div>
  )
}
