import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../lib/api'
import { Briefcase, FileText, LogOut, QrCode } from 'lucide-react'

export function PublicHeader() {
  const { user } = useAuth()
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">CV</span>
          <span className="logo-text">CV QR</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/">Нүүр</NavLink>
          <NavLink to="/scan">QR</NavLink>
          <NavLink to="/help">Тусламж</NavLink>
        </nav>
        {user ? (
          <Link to="/employer/applications" className="btn btn-primary btn-sm">
            Хянах самбар
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  )
}

export function EmployerLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="employer-shell">
      <aside className="sidebar">
        <Link to="/" className="logo sidebar-logo">
          <span className="logo-mark">CV</span>
          <span className="logo-text">CV QR</span>
        </Link>
        <p className="sidebar-company">{profile?.companyName || 'Ажил олгогч'}</p>
        <nav className="sidebar-nav">
          <NavLink to="/employer/jobs">
            <Briefcase size={18} /> Ажил байр
          </NavLink>
          <NavLink to="/employer/applications">
            <FileText size={18} /> Ирсэн CV
          </NavLink>
          <NavLink to="/employer/qr">
            <QrCode size={18} /> CV QR
          </NavLink>
        </nav>
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Гарах
        </button>
      </aside>
      <main className="employer-main">
        <Outlet />
      </main>
    </div>
  )
}

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom">
      <NavLink to="/employer/jobs">
        <Briefcase size={20} />
        <span>Ажил</span>
      </NavLink>
      <NavLink to="/employer/applications">
        <FileText size={20} />
        <span>CV</span>
      </NavLink>
      <NavLink to="/employer/qr">
        <QrCode size={20} />
        <span>QR</span>
      </NavLink>
    </nav>
  )
}
