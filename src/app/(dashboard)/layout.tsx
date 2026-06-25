import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { AuthGuard } from "@/components/auth/AuthGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar />
        <main className="flex-1 pb-20 md:pb-0 md:pr-72">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
