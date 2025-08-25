"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "ru" | "kk"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  ru: {
    // Header
    "site.title": "KENDALA Foodservice by AZURE",
    "nav.order": "Заказать",
    "nav.admin": "Админ панель",
    "nav.kitchen": "Кухня",
    "nav.delivery": "Доставка",

    // Order page
    "order.title": "Заказ обедов",
    "order.subtitle": "Бизнес-центр Кен Дала, Алматы",
    "order.selectDishes": "Выберите блюда",
    "order.dishesRequired": "Выберите 2 или 3 блюда",
    "order.price2dishes": "2 блюда: 2390 ₸",
    "order.price3dishes": "3 блюда: 2990 ₸",
    "order.deliveryFee": "Доставка: +300 ₸ за ланчбокс",
    "order.customerInfo": "Информация о заказчике",
    "order.fullName": "ФИО",
    "order.phone": "Телефон",
    "order.office": "Офис",
    "order.floor": "Этаж",
    "order.company": "Компания",
    "order.deliveryTime": "Время доставки",
    "order.quantity": "Количество ланчбоксов",
    "order.paymentMethod": "Способ оплаты",
    "order.cashCard": "Наличные/карта при доставке",
    "order.invoice": "Запросить счет",
    "order.total": "Итого",
    "order.submit": "Оформить заказ",
    "order.orderClosed": "Заказы на сегодня закрыты (до 11:00)",
    "order.orderClosesTomorrow": "Заказы на завтра закрываются в 17:00",

    // Days
    "day.monday": "Понедельник",
    "day.tuesday": "Вторник",
    "day.wednesday": "Среда",
    "day.thursday": "Четверг",
    "day.friday": "Пятница",

    // Admin
    "admin.title": "Админ панель",
    "admin.uploadMenu": "Загрузить меню",
    "admin.orders": "Заказы",
    "admin.login": "Войти",
    "admin.logout": "Выйти",

    // Kitchen
    "kitchen.title": "Кухня - Сводка на завтра",
    "kitchen.dishSummary": "Сводка блюд",

    // Delivery
    "delivery.title": "Доставка",
    "delivery.printLabels": "Печать этикеток",
    "delivery.printSummary": "Печать сводки",

    // Common
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.calories": "ккал",
  },
  kk: {
    // Header
    "site.title": "KENDALA Foodservice by AZURE",
    "nav.order": "Тапсырыс беру",
    "nav.admin": "Админ панелі",
    "nav.kitchen": "Ас үй",
    "nav.delivery": "Жеткізу",

    // Order page
    "order.title": "Түскі ас тапсырысы",
    "order.subtitle": "Кен Дала бизнес орталығы, Алматы",
    "order.selectDishes": "Тағамдарды таңдаңыз",
    "order.dishesRequired": "2 немесе 3 тағам таңдаңыз",
    "order.price2dishes": "2 тағам: 2390 ₸",
    "order.price3dishes": "3 тағам: 2990 ₸",
    "order.deliveryFee": "Жеткізу: +300 ₸ ланчбокс үшін",
    "order.customerInfo": "Тапсырыс беруші туралы ақпарат",
    "order.fullName": "Толық аты-жөні",
    "order.phone": "Телефон",
    "order.office": "Кеңсе",
    "order.floor": "Қабат",
    "order.company": "Компания",
    "order.deliveryTime": "Жеткізу уақыты",
    "order.quantity": "Ланчбокс саны",
    "order.paymentMethod": "Төлем әдісі",
    "order.cashCard": "Қолма-қол/карта жеткізу кезінде",
    "order.invoice": "Шот сұрау",
    "order.total": "Барлығы",
    "order.submit": "Тапсырыс беру",
    "order.orderClosed": "Бүгінгі тапсырыстар жабылды (11:00-ге дейін)",
    "order.orderClosesTomorrow": "Ертеңгі тапсырыстар 17:00-де жабылады",

    // Days
    "day.monday": "Дүйсенбі",
    "day.tuesday": "Сейсенбі",
    "day.wednesday": "Сәрсенбі",
    "day.thursday": "Бейсенбі",
    "day.friday": "Жұма",

    // Admin
    "admin.title": "Админ панелі",
    "admin.uploadMenu": "Мәзірді жүктеу",
    "admin.orders": "Тапсырыстар",
    "admin.login": "Кіру",
    "admin.logout": "Шығу",

    // Kitchen
    "kitchen.title": "Ас үй - Ертеңгі қорытынды",
    "kitchen.dishSummary": "Тағамдар қорытындысы",

    // Delivery
    "delivery.title": "Жеткізу",
    "delivery.printLabels": "Жапсырмаларды басып шығару",
    "delivery.printSummary": "Қорытындыны басып шығару",

    // Common
    "common.loading": "Жүктелуде...",
    "common.error": "Қате",
    "common.success": "Сәтті",
    "common.cancel": "Болдырмау",
    "common.save": "Сақтау",
    "common.delete": "Жою",
    "common.edit": "Өңдеу",
    "common.calories": "ккал",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["ru"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
