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
    "nav.about": "О нас",

    // Order page
    "order.title": "Заказ обедов",
    "order.subtitle": "Бизнес-центр Кен Дала, Алматы",
    "order.dishes": "блюда",
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
    "order.quantity": "Количество",
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
    "common.backToOrder": "Вернуться к заказу",

    // About
    "about.title": "«PRO ОБЕДЫ»",
    "about.subtitle": "от «Ken Dala Food Service» — просто, вкусно, удобно",
    "about.intro1": "Вам не нужно никуда ходить, звонить или тратить время — просто со своего рабочего места закажите обед на удобное для вас время. Наши обеды готовит ресторан AZURE, и вы можете быть уверены в их свежести, качестве и происхождении продуктов — что особенно важно в современном ритме жизни.",
    "about.intro2": "Меню обновляется каждый день! Ланчи доступны по очень актуальным ценам: можно выбрать 2 или 3 блюда. А если заказываете на компанию — получите бонусы:",
    "about.li1": "при заказе 5 и более полных обедов — всем дарим фирменную выпечку",
    "about.li2": "при заказе на неделю вперёд — каждый обед комплектуется бесплатным напитком и десертом",
    "about.intro3": "Ken Dala Food Service — это обеды не только для офиса. Срок хранения наших блюд — 72 часа, поэтому вы \
                можете заказать их и для ужина дома. Позаботьтесь не только о себе, но и о своих близких — вкусно, \
                быстро, безопасно.",
    "about.rule.title": "Правила заказа",
    "about.rule.text": "Мы делаем всё, чтобы ваш обед был вкусным, свежим и максимально удобным. Выбирайте блюда, оформляйте заказ \
              за пару кликов и получайте еду в нужное время — без лишней суеты.",
    "about.rule.title1": "1. Оформление заказа",
    "about.rule.text1": "Все заказы принимаются через наш сайт: www.kdfs.kz",
    "about.rule.title2": "2. Доступный формат обеда",
    "about.rule.text2": "PRO ОБЕД — удобная упаковка, улучшенное меню и свежие блюда каждый день.",
    "about.rule.title3": "3. Состав обеда",
    "about.rule.text3": "Комбинируйте по вкусу: Салат / Суп / Горячее. Можно выбрать 2 или 3 блюда, напиток добавляется \
                  автоматический.",
    "about.rule.title4": "4. Цены",
    "about.rule.li1": "2 блюда — 2 390 ₸",
    "about.rule.li2": "3 блюда — 2 990 ₸",
    "about.rule.li3": "Доставка: 300 ₸ за каждый обед",
    "about.rule.title5": "5. Время доставки",
    "about.rule.text5": "С 12:00 до 16:00. Выберите удобный интервал (30 минут) при оформлении заказа.",
    "about.rule.title6": "6. Специальные предложения",
    "about.rule.li4": "Заказ 5 и более обедов — всем выпечка в подарок",
    "about.rule.li5": "При заказе на неделю вперёд — десерт бесплатно включены в каждый обед",
    "about.rule.title7": "7. Срок годности и свежесть",
    "about.rule.text7": "Все блюда готовятся утром и доставляются в день заказа. Срок годности — 72 часа с даты изготовления \
                  (указана на упаковке).",
    "about.rule.title8": "8. Можно заказывать и домой",
    "about.rule.text8": "Наши обеды подойдут не только для офиса, но и для ужина дома. Благодаря герметичной упаковке и сроку \
                  хранения 72 часа, вы можете заказывать несколько боксов вперёд и спокойно кормить всю семью — вкусно, \
                  свежо и удобно.",
    "about.intro4": "Мы всегда на связи — пишите или звоните, с радостью всё подскажем и поможем оформить заказ. «Ken Dala Food \
              Service» — обеды, к которым хочется возвращаться.",
    "about.contacts.title": "Наши контакты",
    "about.whatsapp": "WhatsApp:",
    "about.phone": "Телефон:",
    "about.contacts": "+7 771 400 4404",
  },
  kk: {
    // Header
    "site.title": "KENDALA Foodservice by AZURE",
    "nav.order": "Тапсырыс беру",
    "nav.admin": "Админ панелі",
    "nav.kitchen": "Ас үй",
    "nav.delivery": "Жеткізу",
    "nav.about": "Біз туралы",

    // Order page
    "order.title": "Түскі ас тапсырысы",
    "order.subtitle": "Кен Дала бизнес орталығы, Алматы",
    "order.dishes": "тағамдар",
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
    "order.quantity": "Саны",
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
    "common.backToOrder": "Тапсырысқа қайта оралу",

    // About {t('')}
    "about.title": "«PRO ТҮСКІ АС»",
    "about.subtitle": "«Ken Dala Food Service» компаниясынан — оңай, дәмді, ыңғайлы",
    "about.intro1": "Ешқайда барудың, қоңырау шалудың немесе уақытыңызды өткізудің қажеті жоқ — тек жұмыс орныңыздан өзіңізге ыңғайлы уақытта түскі асқа тапсырыс беріңіз. Біздің түскі астарды AZURE мейрамханасы дайындайды, сондықтан тағамдардың балғындығына, сапасына және өнімдердің шығу тегіне сенімді бола аласыз — бұл қазіргі қарқынды өмір ырғағында өте маңызды.",
    "about.intro2": "Мәзір күн сайын жаңарып отырады! Ланчтар қолжетімді бағамен ұсынылады: 2 немесе 3 тағамды таңдауға болады. Ал егер сіз компанияңызбен бірге тапсырыс берсеңіз — бонустар аласыз:",
    "about.li1": "5 және одан да көп толық түскі асқа тапсырыс бергенде — бәріне фирмалық тәтті тағам сыйлыққа",
    "about.li2": "Апта бойына алдын ала тапсырыс берсеңіз — әрбір түскі асқа тегін сусын мен десерт қосылады",
    "about.intro3": "Ken Dala Food Service — тек кеңсеге ғана емес, үйге де арналған түскі астар. Тағамдарымыздың сақтау мерзімі — 72 сағат, сондықтан сіз оларды кешкі асқа да тапсырыс бере аласыз. Өзіңізге ғана емес, жақындарыңызға да қамқор болыңыз — дәмді, тез және қауіпсіз.",
    "about.rule.title": "Тапсырыс беру ережелері",
    "about.rule.text": "Біз сіздің түскі асыңыз дәмді, балғын және барынша ыңғайлы болуы үшін барымызды саламыз. Тағамдарды таңдап, бірнеше рет басу арқылы тапсырыс беріңіз — және өз уақытыңызда дәмді асты алыңыз.",
    "about.rule.title1": "1. Тапсырыс рәсімдеу",
    "about.rule.text1": "Барлық тапсырыстар біздің сайт арқылы қабылданады: www.kdfs.kz",
    "about.rule.title2": "2. Ыңғайлы түскі ас форматы",
    "about.rule.text2": "PRO ТҮСКІ АС — ыңғайлы орама, жаңартылған мәзір және күн сайын балғын тағамдар.",
    "about.rule.title3": "3. Түскі ас құрамы",
    "about.rule.text3": "Өзіңізге ұнайтындай таңдаңыз: Салат / Сорпа / Ыстық тағам. 2 немесе 3 тағамды таңдауға болады, сусын автоматты түрде қосылады.",
    "about.rule.title4": "4. Бағалар",
    "about.rule.li1": "2 тағам — 2 390 ₸",
    "about.rule.li2": "3 тағам — 2 990 ₸",
    "about.rule.li3": "Жеткізу: әр түскі ас үшін 300 ₸",
    "about.rule.title5": "5. Жеткізу уақыты",
    "about.rule.text5": "12:00-ден 16:00-ге дейін. Тапсырыс беру кезінде ыңғайлы 30 минуттық аралықты таңдаңыз.",
    "about.rule.title6": "6. Арнайы ұсыныстар",
    "about.rule.li4": "5 және одан көп түскі ас тапсырысы — бәріне тәтті тағам сыйлыққа",
    "about.rule.li5": "Аптаға алдын ала тапсырыс берсеңіз — әр түскі асқа тегін десерт кіреді",
    "about.rule.title7": "7. Сақтау мерзімі және балғындық",
    "about.rule.text7": "Барлық тағамдар таңертең дайындалып, сол күні жеткізіледі. Сақтау мерзімі — дайындау күнінен бастап 72 сағат (қаптамада көрсетілген).",
    "about.rule.title8": "8. Үйге де тапсырыс беруге болады",
    "about.rule.text8": "Біздің түскі астар тек кеңсе үшін емес, үйдегі кешкі асқа да тамаша сай келеді. Герметикалық орам мен 72 сағаттық сақтау мерзімі арқасында бірнеше боксты алдын ала тапсырыс беріп, бүкіл отбасыңызды дәмді және балғын тағаммен қамтамасыз ете аласыз.",
    "about.intro4": "Біз әрдайым байланыстамыз — жазыңыз немесе қоңырау шалыңыз, қуана көмектесеміз және кеңес береміз. «Ken Dala Food Service» — қайта-қайта тапсырыс бергіңіз келетін түскі астар.",
    "about.contacts.title": "Байланыс деректеріміз",
    "about.whatsapp": "WhatsApp:",
    "about.phone": "Телефон:",
    "about.contacts": "+7 771 400 4404",

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
