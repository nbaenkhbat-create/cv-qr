import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/Layout'

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
          <li>
            «Ирсэн CV» хэсэгт зөвшөөрөх/татгалзах — зөвшөөрөхдөө Gmail илгээх эсвэл
            илгээхгүй гэж сонгоно.
          </li>
          <li>CV QR-ийг уншуулахад hide/show талбарууд харагдана; татаж хэвлэж болно.</li>
        </ol>
        <Link to="/" className="btn btn-primary">
          Нүүр хуудас
        </Link>
      </div>
    </div>
  )
}
