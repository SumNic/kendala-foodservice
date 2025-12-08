"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

import { DayMenu } from "@/app/page"

import { commonApi, menuApi, Order, ordersApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import {
  ORDER_END_HOUR,
  ORDER_END_MINUTS,
  ORDER_START_HOUR,
  ORDER_START_MINUTS,
} from "@/lib/constants"

type WeekDay = {
  day: string
  date: string
}

interface OrdersContextType {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  menu: DayMenu[]
  setMenu: (menu: DayMenu[]) => void
  token: string | undefined
  setToken: (token: string | undefined) => void
  hash: string | undefined
  setHash: (token: string | undefined) => void
  getOrders: () => Promise<void>
  getMenu: (currentWeekDays: WeekDay[]) => Promise<void>
  getCurrentWeekDays: () => WeekDay[]
  isMaintenanceMode: boolean
  setIsMaintenanceMode: (status: boolean) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export const OrdersProvider: React.FC<{
  initialToken: string | undefined
  initialHash: string | undefined
  children: React.ReactNode
}> = ({ initialToken = undefined, initialHash = undefined, children }) => {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [menu, setMenu] = useState<DayMenu[]>([])
  const [token, setToken] = useState<string | undefined>(initialToken)
  const [hash, setHash] = useState<string | undefined>(initialHash)
  const [initialized, setInitialized] = useState(false)

  const getMenu = async (currentWeekDays: WeekDay[]) => {
    // отправляем запрос на получение кода
    const res = await menuApi.getMenu()
    const resData = res?.data

    if (currentWeekDays?.length && resData) {
      const menu: DayMenu[] = currentWeekDays.map((day, indexDay) => {
        return {
          day: day.day,
          date: day.date,
          dishes: resData.reduce((arrNew: DayMenu["dishes"], elem, index) => {
            if (indexDay + 1 === elem.day) arrNew.push({ id: `${index + 1}`, ...elem })
            return arrNew
          }, []),
        }
      })
      const noAvailableDaysMenu = getNoAvailableDays(menu)
      setMenu(noAvailableDaysMenu)
    } else {
      toast({
        title: t("common.error"),
        description: res.error || "Unknown error",
        variant: "destructive",
      })
    }
  }

  function getNoAvailableDays(menu: DayMenu[]) {
    const now = new Date()
    const currentDay = now.getDay()
    const hours = now.getHours()
    const minutes = now.getMinutes()

    const blockDaysMenu = menu.map((item, numberDay) => {
      if (minutes >= ORDER_END_MINUTS && hours >= ORDER_END_HOUR && numberDay <= currentDay) {
        return {
          ...item,
          isAvailable: false,
        }
      }
      if (
        minutes >= ORDER_START_MINUTS &&
        hours >= ORDER_START_HOUR &&
        numberDay + 1 <= currentDay
      ) {
        return {
          ...item,
          isAvailable: false,
        }
      }
      if (numberDay + 1 < currentDay) {
        return {
          ...item,
          isAvailable: false,
        }
      }
      return {
        ...item,
        isAvailable: item.dishes.length === 0 ? false : true,
      }
    })
    return blockDaysMenu
  }

  function getCurrentWeekDays() {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"]

    const today = new Date()
    const nextDay = today.getDay() // 0 (вс) - 6 (сб)
    const diffToMonday = (nextDay + 6) % 7 // сдвиг к понедельнику

    const monday = new Date(today)
    monday.setDate(today.getDate() - diffToMonday)

    const currentWeek = days.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        day,
        date: date.toISOString().split("T")[0], // формат YYYY-MM-DD
      }
    })
    return currentWeek
  }

  const getOrders = async () => {
    try {
      const res = await ordersApi.getOrders({
        token: token,
        u_hash: hash,
      })

      if (res.success) {
        const orders: Order[] = []
        Object.values(res?.data?.data.booking).forEach((elem: any) => {
          const id = elem.b_id
          const status = elem.b_start_address
          const orderFromServer = elem.b_options?.tickets?.seats[123][1]
          if (orderFromServer?.customer) {
            const order: Order = { id, ...orderFromServer, status }
            orders.push(order)
          }
        })

        setOrders(orders)
      } else {
        toast({
          title: t("common.error"),
          description: res.error || "Не удалось загрузить заказы",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: t("common.error"),
        description: "Ошибка при загрузке заказов",
        variant: "destructive",
      })
    }
  }

  const getSiteStatus = async () => {
    try {
      const res = await commonApi.getSiteStatus()

      if (res.success) {
        setIsMaintenanceMode(!res.data)
      } else {
        setIsMaintenanceMode(false)
      }
    } catch (error) {
      setIsMaintenanceMode(false)
      console.error(error)
    }
  }

  useEffect(() => {
    if (token && hash) {
      getOrders()
    }
    setInitialized(true)
  }, [token, hash])

  useEffect(() => {
    getSiteStatus()
    const currentWeekDays = getCurrentWeekDays()
    if (currentWeekDays?.length) getMenu(currentWeekDays)
  }, [])

  if (!initialized) {
    return null // или <Spinner/>
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        setOrders,
        menu,
        setMenu,
        token,
        setToken,
        hash,
        setHash,
        getOrders,
        getMenu,
        getCurrentWeekDays,
        isMaintenanceMode,
        setIsMaintenanceMode,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within a OrdersProvider")
  }
  return context
}
