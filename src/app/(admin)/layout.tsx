import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { BottomNav } from "@/components/layout/BottomNav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 pb-20 md:pb-0 md:pr-72">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
