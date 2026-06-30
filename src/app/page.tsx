import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session) {
    const userRole = (session.user as any).role;
    if (userRole === "HR_ADMIN") {
      redirect("/hr/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00AEEF] to-[#1B3A5C] text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">
          <span className="text-white">ARVIN</span>
          <span className="text-[#1B3A5C]"> INTERNATIONAL</span>
        </div>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-6 py-2 text-white hover:bg-white/20 rounded-lg transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-white text-[#00AEEF] rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Join the Arvin International Family
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Discover exciting career opportunities with the <strong>No. 1 Salt Provider in the Philippines</strong>. 
          <br />
          <em>Moving Ahead to Serve You Better</em>
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/apply"
            className="px-8 py-3 bg-white text-[#00AEEF] font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Start Your Application
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur">
          <div className="text-3xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Easy Application</h3>
          <p className="text-white/80">
            Complete your application in just 4 simple steps
          </p>
        </div>
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Track Status</h3>
          <p className="text-white/80">
            Monitor your application status in real-time
          </p>
        </div>
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur">
          <div className="text-3xl mb-4">🔔</div>
          <h3 className="text-xl font-bold mb-2">Stay Informed</h3>
          <p className="text-white/80">
            Receive instant notifications about your application
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 text-center py-8 text-white/70">
        <p>© 2024 Arvin International Marketing, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
