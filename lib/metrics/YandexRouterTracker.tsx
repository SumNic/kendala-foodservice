"use client"
import { YANDEX_METRICA_ID } from "@/lib/constants"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export const YandexRouterTracker = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined" && window.ym) {
      const url = pathname + (searchParams.toString() ? `?${searchParams}` : "")
      window.ym(YANDEX_METRICA_ID, "hit", url)
    }
  }, [pathname, searchParams])

  return null
}
