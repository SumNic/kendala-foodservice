"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed } from "lucide-react"
import { useOrders } from "@/components/orders-provider"

export function Header() {
  const { t } = useLanguage()
  const { token, hash, getMenu, getCurrentWeekDays } = useOrders()
  const week = getCurrentWeekDays()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t("site.title")}</h1>
              <p className="text-sm text-gray-600">{t("order.subtitle")}</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" onClick={() => getMenu(week)}>{t("nav.order")}</Button>
            </Link>
            <Link href="/admin">
              {token && hash  && <Button variant="ghost">{t("nav.admin")}</Button>}
            </Link>
            <Link href="/kitchen">
              {token && hash  &&  <Button variant="ghost">{t("nav.kitchen")}</Button>}
            </Link>
            <Link href="/delivery">
              {token && hash  && <Button variant="ghost">{t("nav.delivery")}</Button>}
            </Link>
          </nav>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
