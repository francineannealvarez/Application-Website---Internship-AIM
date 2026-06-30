'use client'

import { useState } from 'react'

type DashboardTab = 'application' | 'status' | 'requirements'
type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'requirements'
  | 'hired'
  | 'rejected'

const statusFlow: Array<{
  key: ApplicationStatus
  label: string
  description: string
}> = [
  {
    key: 'submitted',
    label: 'Submitted',
    description: 'The application has been received and is waiting in queue.',
  },
  {
    key: 'under_review',
    label: 'Under Review',
    description: 'HR is evaluating your profile, resume, and position fit.',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    description: 'You are moving forward and can access the additional requirements tab.',
  },
  {
    key: 'requirements',
    label: 'Requirements',
    description: 'Complete any requested follow-up documents or tasks.',
  },
  {
    key: 'hired',
    label: 'Hired',
    description: 'Final offer has been approved and the process is complete.',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    description: 'The application cycle has ended for this role.',
  },
]

const notifications = [
  {
    title: 'Application submitted',
    message: 'Your applicant record is now in the dashboard queue.',
    time: 'Today · 9:24 AM',
  },
  {
    title: 'Resume received',
    message: 'The upload is stored in the application record for HR review.',
    time: 'Today · 9:25 AM',
  },
  {
    title: 'Requirements locked',
    message: 'Additional steps will appear after you are shortlisted.',
    time: 'Pending',
  },
]

const checklist = [
  'Personal information complete',
  'Position selected',
  'Resume uploaded',
  'Waiting for HR review',
]

const currentStatus: ApplicationStatus = 'under_review'

export default function ApplicantDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('application')

  const currentStatusIndex = statusFlow.findIndex((step) => step.key === currentStatus)
  const isRequirementsUnlocked = currentStatusIndex >= 2

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#e2e8f0_100%)] text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-8 lg:py-8">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Applicant dashboard
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Keep your application moving in one place.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  This dashboard is focused on the applicant journey only: submit your details,
                  watch your status, and unlock follow-up requirements once HR shortlists your
                  profile.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Current stage: {statusFlow[currentStatusIndex]?.label}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Requirements {isRequirementsUnlocked ? 'unlocked' : 'locked'}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Resume stored in Supabase
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-950 px-4 py-4 text-white shadow-lg shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Application ID</p>
                <p className="mt-3 text-lg font-semibold">APP-0147</p>
                <p className="mt-2 text-sm text-slate-300">Linked to your applicant profile</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last update</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Just now</p>
                <p className="mt-2 text-sm text-slate-600">Status sync from HR activity</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next action</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  Wait for review results
                </p>
                <p className="mt-2 text-sm text-slate-600">Additional tasks appear after shortlist</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Application workspace</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Build the form, monitor status, and continue only when the current step allows it.
                  </p>
                </div>
                <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                  {[
                    { key: 'application', label: 'Application' },
                    { key: 'status', label: 'Status' },
                    { key: 'requirements', label: 'Requirements' },
                  ].map((tab) => {
                    const tabKey = tab.key as DashboardTab
                    const lockedTab = tabKey === 'requirements' && !isRequirementsUnlocked

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          if (!lockedTab) {
                            setActiveTab(tabKey)
                          }
                        }}
                        disabled={lockedTab}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                          activeTab === tabKey
                            ? 'bg-slate-900 text-white shadow'
                            : lockedTab
                              ? 'cursor-not-allowed text-slate-400'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                        {lockedTab ? ' · Locked' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6">
                {activeTab === 'application' && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Personal info
                      </h3>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Full name
                          <input
                            defaultValue="Jasmine Cortez"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400"
                          />
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Email address
                          <input
                            defaultValue="jasmine.cortez@email.com"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-400"
                          />
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Contact number
                          <input
                            defaultValue="0917 555 0192"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-400"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Position and resume
                      </h3>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Position applied for
                          <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400">
                            <option>UI Design Intern</option>
                            <option>Front-End Intern</option>
                            <option>Graphic Design Intern</option>
                          </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Resume upload
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Resume.pdf connected to your application record
                          </div>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-700">
                          Short introduction
                          <textarea
                            defaultValue="I want to join the internship program and contribute to UI design work while learning from the team."
                            rows={5}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:col-span-2">
                      <button
                        type="button"
                        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
                      >
                        Save draft
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                      >
                        Submit application
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'status' && (
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status flow
                      </h3>
                      <ol className="mt-5 space-y-4">
                        {statusFlow.map((step, index) => {
                          const isComplete = index < currentStatusIndex
                          const isCurrent = index === currentStatusIndex

                          return (
                            <li key={step.key} className="flex gap-4">
                              <div
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                  isComplete
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : isCurrent
                                      ? 'border-slate-900 bg-slate-900 text-white'
                                      : 'border-slate-300 bg-white text-slate-400'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="pb-4">
                                <p className="font-semibold text-slate-950">{step.label}</p>
                                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                                  {step.description}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Quick checklist
                      </h3>
                      <div className="mt-5 space-y-3">
                        {checklist.map((item) => (
                          <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                              ✓
                            </span>
                            <span className="text-sm text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Notification rule
                        </p>
                        <p className="mt-2 text-lg font-semibold">HR updates trigger alerts</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          When HR changes your status, send an email and an in-app notification so the
                          applicant sees the update immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    {isRequirementsUnlocked ? (
                      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-950">
                            Additional requirements
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            This tab becomes available after your application reaches Shortlisted.
                            Use it for documents, forms, or follow-up tasks requested by HR.
                          </p>
                          <div className="mt-5 space-y-3">
                            <label className="block space-y-2 text-sm font-medium text-slate-700">
                              Upload requirement file
                              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-slate-500">
                                Select proof of enrollment, portfolio, or any requested document
                              </div>
                            </label>
                            <label className="block space-y-2 text-sm font-medium text-slate-700">
                              Notes for HR
                              <textarea
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                                placeholder="Add clarifications or availability notes"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Requirement status
                          </h4>
                          <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                              <span>Requirements tab unlocked</span>
                              <span className="font-semibold text-emerald-700">Yes</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                              <span>Documents received</span>
                              <span className="font-semibold text-slate-900">Pending</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                              <span>Final decision</span>
                              <span className="font-semibold text-slate-900">Pending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                          🔒
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-slate-950">
                          Additional requirements are locked
                        </h3>
                        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          This section unlocks only after your application reaches Shortlisted. Until
                          then, keep your resume and personal details ready for HR review.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-slate-950">Application tracker</h2>
              <div className="mt-5 space-y-3">
                {statusFlow.map((step, index) => {
                  const isComplete = index < currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border px-4 py-3 ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-950 text-white'
                          : isComplete
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{step.label}</p>
                        <span className="text-xs uppercase tracking-[0.18em]">
                          {isCurrent ? 'Now' : isComplete ? 'Done' : 'Next'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-slate-950">In-app notifications</h2>
              <div className="mt-5 space-y-4">
                {notifications.map((notification) => (
                  <article key={notification.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{notification.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                        {notification.time}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
