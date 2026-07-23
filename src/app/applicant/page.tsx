'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/*
This page handles the demo application form.
The submitted data is then handed off to /dashboard (src/app/dashboard/page.tsx),
which is the real dashboard used by authenticated non-demo users.
TODO: reconcile the submit flow once the backend is integrated — the real bridge
should use the persisted application record (likely via /api/applications) so the
dashboard can render the freshly submitted data after redirect.
*/

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface FormData {
  fullName: string
  email: string
  phone: string
  position: string
  resumeFile: string
}

const defaultFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  resumeFile: '',
}

const POSITIONS = [
  'UI Design Intern',
  'Front-End Intern',
  'Graphic Design Intern',
]

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

function validateFileSize(f: File): string | null {
  if (f.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Max file size is ${MAX_FILE_SIZE_MB}MB.`
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// Application Form
// ─────────────────────────────────────────────────────────────

function ApplicationForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void
}) {
  const [form, setForm] = useState<FormData>(defaultFormData)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleFile = (file: File) => {
    if (!(file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setFileError('Please upload a PDF or Word document (.pdf, .docx).')
      return
    }
    const sizeError = validateFileSize(file)
    if (sizeError) {
      setFileError(sizeError)
      return
    }
    setFileError('')
    set('resumeFile', file.name)
  }

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email address'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^(\+63\d{10}|0\d{10})$/.test(form.phone.trim().replace(/[\s-]/g, '')))
      e.phone = 'Enter a valid PH mobile number (e.g. 09171234567 or +639171234567)'
    if (!form.position) e.position = 'Please select a position'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  const inputClass = (field: keyof FormData) =>
    [
      'w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200',
      'bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-sm',
      errors[field] ? 'border-red-300' : 'border-gray-200',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f0f5fb_55%)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1E88E5] px-8 py-8 text-white text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Arvin International" className="w-full h-full object-contain" />
            </div>
            <div className="text-base font-medium text-blue-50 mt-1">Applicant Portal</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-gray-900">Application Form</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill out all fields to submit your application.</p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Juan dela Cruz"
                className={inputClass('fullName')}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="juan@email.com"
                className={inputClass('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+63 917 000 0000"
                className={inputClass('phone')}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Position Applying For</label>
            <div className="relative">
              <select
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                className={`${inputClass('position')} appearance-none ${!form.position ? 'text-gray-400' : ''}`}
              >
                <option value="">Select a position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {errors.position && <p className="text-xs text-red-500">{errors.position}</p>}
          </div>

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Resume / CV</label>
            <div
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-inner'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
              {form.resumeFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-blue-700">{form.resumeFile}</span>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      set('resumeFile', '')
                      setFileError('')
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">
                    Drag &amp; drop your resume, or <span className="text-blue-600">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 10 MB</p>
                </>
              )}
            </div>
            {fileError && <p className="text-xs text-red-500">{fileError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white font-semibold rounded-xl hover:from-[#0D47A1] hover:to-[#1565C0] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 text-sm mt-2"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────

export default function ApplicantDashboard() {
  const router = useRouter()

  return (
    <ApplicationForm
      onSubmit={() => {
        // TODO: pass the persisted application record (likely via /api/applications)
        // so /dashboard can render the freshly submitted data after redirect.
        router.push('/dashboard')
      }}
    />
  )
}