"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { History, Search, Loader2 } from "lucide-react"

interface AuditEntry {
  id: string
  action: string
  resource: string
  resource_id: string
  details: Record<string, unknown>
  created_at: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) return
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs((data as AuditEntry[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = logs.filter((l) =>
    !search || l.action.includes(search) || l.resource.includes(search)
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">سجل العمليات</h1>
          <p className="mt-1 text-sm text-on-surface-variant">جميع العمليات على المنصة</p>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
          <History className="mx-auto h-12 w-12 text-on-surface-variant/50" />
          <p className="mt-4 text-on-surface-variant">لا توجد عمليات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => (
            <div key={log.id} className="rounded-xl border border-outline-variant/30 bg-white p-4 transition-colors hover:bg-surface-container/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {log.action}
                  </span>
                  <span className="text-sm text-on-surface-variant">{log.resource}</span>
                  {log.resource_id && (
                    <span className="text-xs text-on-surface-variant/50" dir="ltr">#{log.resource_id.slice(0, 8)}</span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  {new Date(log.created_at).toLocaleString("ar-SA")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
