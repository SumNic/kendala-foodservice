import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/toaster"
import { OrdersProvider } from "@/components/orders-provider"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
   title: "KENDALA Foodservice by AZURE",
   description: "Food delivery service for Ken Dala Business Center",
   generator: 'v0.dev'
}

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   const token = cookies().get("token")?.value || undefined;
   const hash = cookies().get("hash")?.value || undefined;

   return (
      <html lang="ru">
         <body className={inter.className}>
            <LanguageProvider>
               <OrdersProvider initialToken={token} initialHash={hash}>
                  {children}
               </OrdersProvider>
               <Toaster />
            </LanguageProvider>

         </body>
      </html>
   )
}
