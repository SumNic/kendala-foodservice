"use client"

import { useLanguage } from "@/components/language-provider"
import { MessageCircle, Phone } from "lucide-react"

interface Props {
  styles?: string
}

export function Contacts({ styles }: Props) {
  const { t } = useLanguage()

  return (
    <div className={`flex flex-col items-start justify-start gap-2 ${styles}`}>
      <a
        href={`https://wa.me/${t("about.contacts").replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t("about.whatsapp")}</span>
        <span>{t("about.contacts")}</span>
      </a>

      <a
        href={`tel:${t("about.contacts")}`}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
      >
        <Phone className="w-5 h-5" />
        <span>{t("about.phone")}</span>
        <span>{t("about.contacts")}</span>
      </a>
    </div>
  )
}
