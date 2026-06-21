"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, HeadphonesIcon, Loader2, ChevronDown, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TicketStatus, TicketPriority } from "@/lib/types"

interface Ticket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  messages: { content: string; sender_name: string }[]
}

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  waiting: "bg-yellow-50 text-yellow-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-50 text-gray-500",
}

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-surface-container text-on-surface-variant",
  medium: "bg-yellow-50 text-yellow-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")
  const supabase = createClient()

  async function fetchTickets() {
    if (!supabase) return
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false })
    if (search) query = query.ilike("subject", `%${search}%`)
    const { data } = await query
    setTickets((data as Ticket[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [search])

  async function sendReply() {
    if (!supabase || !selectedTicket || !reply.trim()) return
    const newMessage = { content: reply, sender_name: "المشرف", created_at: new Date().toISOString() }
    const updatedMessages = [...(selectedTicket.messages ?? []), newMessage]
    await supabase.from("support_tickets").update({ messages: updatedMessages, status: "in_progress" }).eq("id", selectedTicket.id)
    setSelectedTicket({ ...selectedTicket, messages: updatedMessages, status: "in_progress" })
    setReply("")
    fetchTickets()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">الدعم الفني</h1>
        <p className="mt-1 text-sm text-on-surface-variant">إدارة تذاكر الدعم</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="w-full rounded-xl border border-outline-variant/50 bg-white py-3 pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant/50 bg-white py-20 text-center">
              <HeadphonesIcon className="mx-auto h-12 w-12 text-on-surface-variant/50" />
              <p className="mt-4 text-on-surface-variant">لا توجد تذاكر</p>
            </div>
          ) : tickets.map((t) => (
            <div key={t.id} onClick={() => setSelectedTicket(t)}
              className={cn("cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md",
                selectedTicket?.id === t.id ? "border-primary" : "border-outline-variant/50")}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-on-surface">{t.subject}</h3>
                <div className="flex gap-2">
                  <span className={cn("rounded-lg px-2 py-0.5 text-xs", statusColors[t.status])}>{t.status}</span>
                  <span className={cn("rounded-lg px-2 py-0.5 text-xs", priorityColors[t.priority])}>{t.priority}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{new Date(t.created_at).toLocaleDateString("ar-SA")}</p>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="rounded-2xl border border-outline-variant/50 bg-white flex flex-col">
            <div className="border-b border-outline-variant/50 p-4">
              <h3 className="font-bold text-on-surface">{selectedTicket.subject}</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-96">
              {(selectedTicket.messages ?? []).map((msg, i) => (
                <div key={i} className={cn("rounded-xl p-3 max-w-[80%]",
                  msg.sender_name === "المشرف" ? "bg-primary/10 mr-auto" : "bg-surface-container")}>
                  <p className="text-xs font-medium text-on-surface-variant mb-1">{msg.sender_name}</p>
                  <p className="text-sm text-on-surface">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant/50 p-4">
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="اكتب رداً..."
                  className="flex-1 rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && sendReply()} />
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="flex items-center justify-center rounded-xl bg-primary px-4 text-white disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
