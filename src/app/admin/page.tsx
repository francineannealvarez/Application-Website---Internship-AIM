// Admin/HR Dashboard placeholder
// Real functionality (job postings, application reviews) will be added later

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin/HR Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to the Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">
              This is a placeholder page. Future functionality includes:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Create and manage job postings</li>
              <li>• Review and update application statuses</li>
              <li>• View applicant details</li>
              <li>• Track hiring pipeline</li>
            </ul>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-gray-900">Job Postings</h3>
              <p className="mt-2 text-gray-600">Coming soon...</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-gray-900">Applications</h3>
              <p className="mt-2 text-gray-600">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
