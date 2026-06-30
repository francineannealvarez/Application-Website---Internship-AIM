/**
 * AdminLayout.tsx
 * ─────────────────────────────────────────────────────────────
 * Wraps every admin page with the sidebar + main content area.
 * Import this in each admin page so the layout is consistent.
 *
 * Usage:
 *   import AdminLayout from '@/components/admin/AdminLayout'
 *   export default function SomePage() {
 *     return <AdminLayout><YourPageContent /></AdminLayout>
 *   }
 * ─────────────────────────────────────────────────────────────
 */
 
import AdminSidebar from './AdminSidebar'
import { components } from '@/lib/admin-theme'
import { Public_Sans } from 'next/font/google'
 
// Load Public Sans once here — admin-theme.ts holds the *name* of the font,
// but the actual font file loading has to happen via next/font like this.
// If you ever change the font, update BOTH this import/call AND the
// fontFamily string in admin-theme.ts so they stay in sync.
const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
 
interface AdminLayoutProps {
  children: React.ReactNode
}
 
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    // Locked to exact screen height — body itself never scrolls
    <div className={`flex h-screen overflow-hidden bg-[#f4f7f9] dark:bg-[#0d1f2d] ${publicSans.className}`}>

      {/* Sidebar stays fixed on the left, full height, no scroll */}
      <AdminSidebar />

      {/* Main scrollable content area — the ONLY thing that scrolls */}
      <main className={`flex-1 overflow-y-auto ${components.pageContent}`}>
        {children}
      </main>

    </div>
  )
}
 