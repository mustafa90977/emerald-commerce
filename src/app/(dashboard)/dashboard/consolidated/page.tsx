import type { Metadata } from "next"
import dynamic from "next/dynamic"

export const metadata: Metadata = { title: "لوحة التحكم" }

const DashboardTabs = dynamic(() => import("@/components/dashboard/DashboardTabs").then((m) => m.DashboardTabs), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>,
})

export default function ConsolidatedDashboardPage() {
  return <DashboardTabs />
}
