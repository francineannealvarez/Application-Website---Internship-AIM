// Applicant Dashboard placeholder
// Real functionality (view job postings, submit applications, track status) will be added later

export default function ApplicantDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Applicant Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to the Applicant Dashboard</h2>
            <p className="mt-2 text-gray-600">
              This is a placeholder page. Future functionality includes:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Browse open job postings</li>
              <li>• Submit job applications</li>
              <li>• Track your application status</li>
              <li>• Receive notifications on updates</li>
            </ul>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-gray-900">Job Postings</h3>
              <p className="mt-2 text-gray-600">Coming soon...</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-gray-900">My Applications</h3>
              <p className="mt-2 text-gray-600">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
