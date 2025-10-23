"use client"

import { useLanguage } from "@/components/language-provider"
import { PHONE_NUMBER } from "@/lib/constants"
import { reachGoal } from "@/lib/metrics/yandexMetrics"
import { MessageCircle, Phone } from "lucide-react"

interface Props {
  styles?: string
}

export function Contacts({ styles }: Props) {
  const { t } = useLanguage()

  return (
    <div className={`flex flex-col items-start justify-start gap-2 ${styles}`}>
      <a
        href={`https://wa.me/${PHONE_NUMBER.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        onClick={() => reachGoal('clickWhatsApp')}
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t("about.whatsapp")}</span>
        <span>{PHONE_NUMBER}</span>
      </a>

      <a
        href={`tel:${PHONE_NUMBER}`}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        onClick={() => reachGoal('clickTelNumber')}
      >
        <Phone className="w-5 h-5" />
        <span>{t("about.phone")}</span>
        <span>{PHONE_NUMBER}</span>
      </a>
    </div>
  )
}
