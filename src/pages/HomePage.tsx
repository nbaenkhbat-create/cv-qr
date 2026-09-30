import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/Layout'
import {
  Building2,
  CheckCircle2,
  QrCode,
  ScanLine,
  UserRound,
  FileText,
  MessageCircle,
} from 'lucide-react'

export function HomePage() {
  return (
    <div className="page home-page">
      <PublicHeader />
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Нэрийн хуудас · CV · QR</p>
            <h1>Таны ирээдүйн ажил эндээс эхэлнэ</h1>
            <p className="lede">
              Ажил олгогч QR үүсгэж, ажил хайгч уншуулаад CV илгээнэ. CV-г
              файл болгон татаж, шууд хэвлэх боломжтой.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                <Building2 size={18} /> Ажил олгогч
              </Link>
              <Link to="/scan" className="btn btn-ghost">
                <UserRound size={18} /> Ажил хайгч
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mock">
              <div className="phone-screen">
                <QrCode size={120} strokeWidth={1.25} className="phone-qr" />
                <span>CV QR</span>
              </div>
            </div>
            <div className="float-chip chip-1">
              <FileText size={16} /> CV
            </div>
            <div className="float-chip chip-2">
              <ScanLine size={16} /> Scan
            </div>
            <div className="float-chip chip-3">
              <CheckCircle2 size={16} /> Hire
            </div>
          </div>
        </div>
      </section>

      <section className="features container">
        <article>
          <ScanLine size={28} />
          <h3>QR уншуулах</h3>
          <p>Нэрийн хуудасны QR-ийг уншуулаад CV шууд нээнэ.</p>
        </article>
        <article>
          <FileText size={28} />
          <h3>CV харах</h3>
          <p>Хариултуудыг hide/show хийж нийтэд харуулна.</p>
        </article>
        <article>
          <MessageCircle size={28} />
          <h3>Холбогдох</h3>
          <p>Зөвшөөрөхөд Gmail руу өөрийн бичсэн захиа илгээнэ.</p>
        </article>
        <article>
          <CheckCircle2 size={28} />
          <h3>Ажилд авах</h3>
          <p>Ирсэн CV-г шүүж, зөвшөөрөх/татгалзах.</p>
        </article>
      </section>
    </div>
  )
}
