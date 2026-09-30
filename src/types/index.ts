export type UserRole = 'employer' | 'seeker'

export interface EmployerProfile {
  uid: string
  email: string
  username: string
  companyName: string
  phone?: string
  createdAt: number
}

export type QuestionType = 'text' | 'textarea' | 'select'

export interface JobQuestion {
  id: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[]
  /** Show on public QR CV view */
  visibleOnPublic: boolean
}

export interface Job {
  id: string
  employerId: string
  title: string
  description: string
  questions: JobQuestion[]
  active: boolean
  createdAt: number
  updatedAt: number
}

export type ApplicationStatus = 'new' | 'viewed' | 'approved' | 'rejected' | 'contacted'

export interface ApplicationAnswers {
  [questionId: string]: string
}

export interface Application {
  id: string
  jobId: string
  employerId: string
  jobTitle: string
  name: string
  phone: string
  email: string
  answers: ApplicationAnswers
  status: ApplicationStatus
  createdAt: number
  updatedAt: number
  employerNote?: string
}

export interface PublicCvVisibility {
  [fieldKey: string]: boolean
}
