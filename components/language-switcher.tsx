"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2">
      <Button
        variant={language === "ru" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("ru")}
      >
        РУС
      </Button>
      <Button
        variant={language === "kk" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("kk")}
      >
        ҚАЗ
      </Button>
    </div>
  )
}
