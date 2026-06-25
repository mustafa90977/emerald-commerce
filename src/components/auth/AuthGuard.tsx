"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      if (!supabase) {
        router.replace("/login")
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login")
        return
      }
      setChecked(true)
    }
    check()
  }, [router, supabase])

  if (!checked) return null

  return <>{children}</>
}
