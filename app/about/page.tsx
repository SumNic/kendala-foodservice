"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Phone, MessageCircle } from "lucide-react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Contacts } from "@/components/contacts"

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#87CEEB]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="outline" className="mb-6 border-[#003D82] text-[#003D82] bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.backToOrder")}
          </Button>
        </Link>

        <Card className="bg-[#003D82] border-0 shadow-lg max-w-3xl">
          <CardContent className="p-8 text-white space-y-6">
            <h1 className="text-4xl font-bold text-[#FFD700]">{t("about.title")}</h1>
            <p className="text-lg font-semibold">{t("about.subtitle")}</p>

            <div className="bg-[#001F3F] p-6 rounded-lg border border-[#00A8E8] space-y-4">
              <p>{t("about.intro1")}</p>
              <p>{t("about.intro2")}</p>

              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{t("about.li1")}</li>
                <li>{t("about.li2")}</li>
              </ul>

              <p>{t("about.intro3")}</p>
            </div>

            <h2 className="text-2xl font-bold mt-8">{t("about.rule.title")}</h2>
            <p>{t("about.rule.text")}</p>

            <div className="bg-[#001F3F] p-6 rounded-lg border border-[#00A8E8] space-y-3">
              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title1")}</h3>
                <p>{t("about.rule.text1")}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title2")}</h3>
                <p>{t("about.rule.text2")}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title3")}</h3>
                <p>{t("about.rule.text3")}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title4")}</h3>
                <ul className="list-disc list-inside ml-2">
                  <li>{t("about.rule.li1")}</li>
                  <li>{t("about.rule.li2")}</li>
                  <li>{t("about.rule.li3")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title5")}</h3>
                <p>{t("about.rule.text5")}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title6")}</h3>
                <ul className="list-disc list-inside ml-2">
                  <li>{t("about.rule.li4")}</li>
                  <li>{t("about.rule.li5")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title7")}</h3>
                <p>{t("about.rule.text7")}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#FFD700]">{t("about.rule.title8")}</h3>
                <p>{t("about.rule.text8")}</p>
              </div>
            </div>

            <p className="text-lg font-semibold mt-8">{t("about.intro4")}</p>

            <div className="bg-[#001F3F] p-6 rounded-lg border border-[#00A8E8] space-y-3">
              <h3 className="font-bold text-[#FFD700] text-lg">{t("about.contacts.title")}</h3>
              <Contacts />
            </div>
          </CardContent>
        </Card>
      </main>
      <div className="fixed right-0 top-32 w-64 h-64 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#003D82]">
          <path
            d="M 100 20 Q 150 50, 150 100 T 100 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="150" cy="100" r="8" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}
