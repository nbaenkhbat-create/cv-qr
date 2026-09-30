import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { EmployerLayout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import {
  EmployerQrPage,
  JobCreatePage,
  JobDetailPage,
  JobsListPage,
} from './pages/employer/Jobs'
import {
  ApplicationDetailPage,
  ApplicationsPage,
} from './pages/employer/Applications'
import { ApplyPage, ApplySuccessPage } from './pages/ApplyPages'
import { PublicCvPage } from './pages/PublicCvPage'
import { ScanPage } from './pages/ScanPage'
import { HelpPage } from './pages/MiscPages'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/apply/success" element={<ApplySuccessPage />} />
          <Route path="/apply/:jobId" element={<ApplyPage />} />
          <Route path="/cv/:appId" element={<PublicCvPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<Navigate to="applications" replace />} />
              <Route path="jobs" element={<JobsListPage />} />
              <Route path="jobs/new" element={<JobCreatePage />} />
              <Route path="jobs/:jobId" element={<JobDetailPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/:appId" element={<ApplicationDetailPage />} />
              <Route path="qr" element={<EmployerQrPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
