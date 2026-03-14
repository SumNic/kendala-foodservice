"use client"

import {
  DELIVERY_FEE,
  DESSERTS_PRICE,
  ORDER_START_HOUR,
  ORDER_START_MINUTS,
  PASTRIES_PRICE_MIN,
  PRICE_DISHES,
  formatPrice,
} from "@/lib/constants"
import ru from "@/locales/ru.json"
import kk from "@/locales/kk.json"
import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "ru" | "kk"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const orderStartTime = `${ORDER_START_HOUR}:${ORDER_START_MINUTS.toString().padStart(2, "0")}`

const tokenValues: Record<string, string> = {
  orderStartTime,
  priceDishes: formatPrice(PRICE_DISHES),
  deliveryFee: formatPrice(DELIVERY_FEE),
  dessertsPrice: formatPrice(DESSERTS_PRICE),
  pastriesPriceMin: formatPrice(PASTRIES_PRICE_MIN),
}

const applyTokens = (strings: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(strings).map(([key, value]) => [
      key,
      value.replace(/\{(\w+)\}/g, (match, token) => tokenValues[token] ?? match),
    ]),
  )
}

const translations = {
  ru: applyTokens(ru),
  kk: applyTokens(kk),
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["ru"]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
