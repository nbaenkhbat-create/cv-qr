import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from './firebase'
import type {
  Application,
  ApplicationStatus,
  EmployerProfile,
  Job,
  JobQuestion,
  PublicCvVisibility,
} from '../types'

function now() {
  return Date.now()
}

/** User-facing Firebase / Firestore error messages (MN) */
export function firebaseErrorMessage(err: unknown, fallback = 'Алдаа гарлаа') {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code)
      : ''
  const msg = err instanceof Error ? err.message : ''

  if (
    code.includes('permission-denied') ||
    msg.includes('permission-denied') ||
    msg.includes('Missing or insufficient permissions')
  ) {
    return 'Firestore эрх хаалттай (permission-denied). Firebase Console → Firestore → Rules дээр rules-ийг publish хийнэ үү.'
  }
  if (code.includes('unavailable') || msg.includes('Firestore')) {
    return 'Firestore холбогдохгүй байна. Database үүсгэсэн эсэхээ шалгана уу.'
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'Энэ Gmail аль хэдийн бүртгэлтэй'
  }
  if (code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
    return 'Нэвтрэх нэр эсвэл нууц үг буруу'
  }
  if (code.includes('auth/user-not-found')) {
    return 'Хэрэглэгч олдсонгүй'
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Хэт олон оролдлого. Түр хүлээнэ үү.'
  }
  return msg || fallback
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

export async function registerEmployer(data: {
  username: string
  email: string
  password: string
  companyName: string
  phone?: string
}) {
  const username = normalizeUsername(data.username)
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    throw new Error('Нэвтрэх нэр: 3–30 тэмдэгт, латин үсэг/тоо/._-')
  }

  const usernameRef = doc(db, 'usernames', username)
  const existing = await getDoc(usernameRef)
  if (existing.exists()) {
    throw new Error('Энэ нэвтрэх нэр аль хэдийн бүртгэлтэй байна')
  }

  const cred = await createUserWithEmailAndPassword(
    auth,
    data.email.trim(),
    data.password,
  )
  await updateProfile(cred.user, { displayName: data.companyName })

  const profile: EmployerProfile = {
    uid: cred.user.uid,
    email: data.email.trim(),
    username,
    companyName: data.companyName.trim(),
    phone: data.phone || '',
    createdAt: now(),
  }

  await setDoc(doc(db, 'employers', cred.user.uid), profile)
  await setDoc(usernameRef, {
    uid: cred.user.uid,
    email: profile.email,
    username,
    createdAt: now(),
  })

  return cred.user
}

export async function loginEmployer(usernameOrEmail: string, password: string) {
  const raw = usernameOrEmail.trim()
  let email = raw

  if (!raw.includes('@')) {
    const snap = await getDoc(doc(db, 'usernames', normalizeUsername(raw)))
    if (!snap.exists()) {
      throw new Error('Нэвтрэх нэр олдсонгүй')
    }
    email = String(snap.data().email)
  }

  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function resetPasswordByGmail(email: string) {
  await sendPasswordResetEmail(auth, email.trim())
}

export async function logout() {
  await signOut(auth)
}

export async function getEmployerProfile(uid: string): Promise<EmployerProfile | null> {
  const snap = await getDoc(doc(db, 'employers', uid))
  return snap.exists() ? (snap.data() as EmployerProfile) : null
}

export async function createJob(
  employerId: string,
  data: { title: string; description: string; questions: JobQuestion[] },
): Promise<string> {
  const ref = await addDoc(collection(db, 'jobs'), {
    employerId,
    title: data.title,
    description: data.description,
    questions: data.questions,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  })
  return ref.id
}

export async function updateJob(
  jobId: string,
  data: Partial<Pick<Job, 'title' | 'description' | 'questions' | 'active'>>,
) {
  await updateDoc(doc(db, 'jobs', jobId), { ...data, updatedAt: now() })
}

export async function getJobsByEmployer(employerId: string): Promise<Job[]> {
  const q = query(
    collection(db, 'jobs'),
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Job)
}

export async function getJob(jobId: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, 'jobs', jobId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Job
}

export async function submitApplication(data: {
  jobId: string
  employerId: string
  jobTitle: string
  name: string
  phone: string
  email: string
  answers: Record<string, string>
}): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...data,
    status: 'new' as ApplicationStatus,
    createdAt: now(),
    updatedAt: now(),
  })
  return ref.id
}

export async function getApplicationsByEmployer(employerId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application)
}

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('jobId', '==', jobId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application)
}

export async function getApplication(appId: string): Promise<Application | null> {
  const snap = await getDoc(doc(db, 'applications', appId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Application
}

export async function updateApplicationStatus(
  appId: string,
  status: ApplicationStatus,
  employerNote?: string,
) {
  const payload: Record<string, unknown> = { status, updatedAt: now() }
  if (employerNote !== undefined) payload.employerNote = employerNote
  await updateDoc(doc(db, 'applications', appId), payload)
}

export async function updateQuestionVisibility(
  jobId: string,
  questions: JobQuestion[],
) {
  await updateDoc(doc(db, 'jobs', jobId), { questions, updatedAt: now() })
}

export async function updatePublicCv(
  appId: string,
  data: { publicVisibility: PublicCvVisibility; photoUrl?: string },
) {
  const payload: Record<string, unknown> = {
    publicVisibility: data.publicVisibility,
    updatedAt: now(),
  }
  if (data.photoUrl !== undefined) payload.photoUrl = data.photoUrl
  await updateDoc(doc(db, 'applications', appId), payload)
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const max = 480
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas алдаа'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) reject(new Error('Зураг шахаж чадсангүй'))
          else resolve(blob)
        },
        'image/jpeg',
        0.82,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Зураг уншиж чадсангүй'))
    }
    img.src = url
  })
}

export async function uploadCvPhoto(appId: string, file: File): Promise<string> {
  const blob = await compressImage(file)
  try {
    const path = `cv-photos/${appId}.jpg`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
    return await getDownloadURL(storageRef)
  } catch {
    return await blobToDataUrl(blob)
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Зураг уншиж чадсангүй'))
    reader.readAsDataURL(blob)
  })
}

export function appBasePath() {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
}

/** Absolute public URL that includes GitHub Pages base (/cv-qr) */
export function publicUrl(path: string) {
  const base = appBasePath()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${window.location.origin}${base}${normalized}`
}

export function applyUrl(jobId: string) {
  return publicUrl(`/apply/${jobId}`)
}

export function cvUrl(applicationId: string) {
  return publicUrl(`/cv/${applicationId}`)
}

export type { User }
export { serverTimestamp, Timestamp }
