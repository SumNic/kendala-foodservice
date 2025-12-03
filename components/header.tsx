"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useOrders } from "@/components/orders-provider"
import Image from "next/image"
import { MessageCircle, Phone, PhoneCall } from "lucide-react"
import { useState } from "react"
import { Contacts } from "@/components/contacts"

export function Header() {
  const [showMobileContacts, setShowMobileContacts] = useState(false)

  const { t } = useLanguage()
  const { token, hash } = useOrders()

  return (
    <header className="bg-gradient-to-r from-[#87CEEB] to-[#B0E0E6] border-b-4 border-[#003D82]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Ken Dala Food Service"
              width={180}
              height={120}
              className="h-20 w-auto"
              priority
            />
          </Link>

          <nav className="md:flex items-center gap-4">
            <Link
              href="/"
              className="text-[#003D82] font-semibold hover:text-[#001F3F] transition"
            ></Link>
            <Link
              href="/about"
              className="text-[#003D82] font-semibold hover:text-[#001F3F] transition"
            >
              <p>{t("nav.about")}</p>
            </Link>
            <Link
              href="/admin"
              className="text-[#003D82] font-semibold hover:text-[#001F3F] transition"
            >
              {token && hash && <p>{t("nav.admin")}</p>}
            </Link>
            <Link
              href="/kitchen"
              className="text-[#003D82] font-semibold hover:text-[#001F3F] transition"
            >
              {token && hash && <p>{t("nav.kitchen")}</p>}
            </Link>
            <Link
              href="/delivery"
              className="text-[#003D82] font-semibold hover:text-[#001F3F] transition"
            >
              {token && hash && <p>{t("nav.delivery")}</p>}
            </Link>
          </nav>

          <div className="flex gap-4 items-center">
            <div className="hidden  lg:flex">
              <Contacts styles="text-[#003D82]" />
            </div>

            <button
              className="lg:hidden text-[#003D82] p-2 rounded-md hover:bg-white/30 transition"
              onClick={() => setShowMobileContacts((s) => !s)}
              aria-label="contacts"
            >
              <PhoneCall className="w-6 h-6" />
            </button>

            <LanguageSwitcher />
          </div>
        </div>
        {showMobileContacts && (
          <div className="flex flex-col items-center gap-3 mt-4 lg:hidden text-[#003D82]">
            <Contacts styles="text-[#003D82]" />
          </div>
        )}
      </div>
    </header>
  )
}
