import emailjs from '@emailjs/browser'

export type SendMailResult =
  | { ok: true; method: 'emailjs' }
  | { ok: true; method: 'gmail-compose' }
  | { ok: false; error: string }

/** Gmail web compose — ажил олгогч «Илгээх» дарахад л очно */
export function openGmailCompose(to: string, subject: string, body: string) {
  const url =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&to=${encodeURIComponent(to)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  if (!w) {
    // Popup блоклогдсон бол ижил tab-д нээх
    window.location.href = url
  }
}

function emailJsConfigured() {
  return Boolean(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  )
}

/**
 * Ажил хайгчийн Gmail руу имэйл илгээнэ.
 * EmailJS тохируулсан бол шууд inbox руу очно.
 * Тохируулаагүй бол Gmail compose нээгдэнэ (Илгээх товч дарна).
 */
export async function sendCandidateEmail(opts: {
  to: string
  subject: string
  message: string
  candidateName?: string
  jobTitle?: string
}): Promise<SendMailResult> {
  const { to, subject, message, candidateName, jobTitle } = opts

  if (emailJsConfigured()) {
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: to,
          to_name: candidateName || '',
          subject,
          message,
          job_title: jobTitle || '',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      return { ok: true, method: 'emailjs' }
    } catch (err) {
      // EmailJS алдаатай бол Gmail compose руу шилжинэ
      console.error('EmailJS failed', err)
      openGmailCompose(to, subject, message)
      return { ok: true, method: 'gmail-compose' }
    }
  }

  openGmailCompose(to, subject, message)
  return { ok: true, method: 'gmail-compose' }
}

export function isAutoEmailEnabled() {
  return emailJsConfigured()
}
