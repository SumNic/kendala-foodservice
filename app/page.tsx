"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, ShoppingCart } from "lucide-react"
import { ordersApi } from "@/lib/api"
import cloneDeep from "lodash/cloneDeep";
import { useOrders } from "@/components/orders-provider"

export interface Dish {
   id: string
   name: string
   description: string
   calories: number
}

export interface DayMenu {
   day: string
   date: string
   dishes: Dish[]
   isAvailable?: boolean
}

interface OrderDay {
   day: string
   date: string
   selectedDishes: string[]
   deliveryTime: string
   quantity: number
}

export default function OrderPage() {
   const { t } = useLanguage()
   const { toast } = useToast()
   const { menu, setMenu } = useOrders()
   const [orderDays, setOrderDays] = useState<OrderDay[]>([])
   const [customerInfo, setCustomerInfo] = useState({
      fullName: "",
      phone: "",
      office: "",
      floor: "",
      company: "",
   })
   const [paymentMethod, setPaymentMethod] = useState<"cash" | "invoice">("cash")   

   useEffect(() => {
      // Check if ordering is allowed based on current time
      const interval = setInterval(() => {
         const now = new Date();
         const currentDay = now.getDay()
         const hours = now.getHours();
         const minutes = now.getMinutes();

         if (minutes >= 0 && hours >= 11 && hours < 17 && menu.length && menu[currentDay - 1]?.isAvailable !== false) {
            const newMenu = cloneDeep(menu)
            newMenu[currentDay - 1].isAvailable = false
            setMenu(newMenu)
         }

         if (minutes >= 0 && hours >= 17 && menu.length && menu[currentDay]?.isAvailable !== false) {
            const newMenu = cloneDeep(menu)
            newMenu[currentDay].isAvailable = false
            setMenu(newMenu)
         }
      }, 1000 * 60); // проверка каждую минуту

      return () => clearInterval(interval);
   }, []);

   const getDayName = (day: string) => {
      return t(`day.${day}`)
   }

   const toggleDay = (dayMenu: DayMenu) => {
      const existingIndex = orderDays.findIndex((od) => od.day === dayMenu.day)

      if (existingIndex >= 0) {
         setOrderDays(orderDays.filter((_, index) => index !== existingIndex))
      } else {
         setOrderDays([
            ...orderDays,
            {
               day: dayMenu.day,
               date: dayMenu.date,
               selectedDishes: [],
               deliveryTime: "12:00",
               quantity: 1,
            },
         ])
      }
   }

   const updateOrderDay = (day: string, updates: Partial<OrderDay>) => {
      const hours = updates.deliveryTime?.slice(0, 2)
      const minutes = updates.deliveryTime?.slice(3)
      if ((hours && +hours < 12) || (hours && +hours >= 15 && minutes && +minutes > 30) || (hours && +hours >= 16)) {
         toast({
            title: t("common.error"),
            description: "Доставка с 12:00 до 15:30",
            variant: "destructive",
         })
      }
      setOrderDays(orderDays.map((od) => (od.day === day ? { ...od, ...updates } : od)))
   }

   const toggleDish = (day: string, dishId: string) => {
      const orderDay = orderDays.find((od) => od.day === day)
      if (!orderDay) return

      const currentDishes = orderDay.selectedDishes
      const isSelected = currentDishes.includes(dishId)

      let newDishes: string[]
      if (isSelected) {
         newDishes = currentDishes.filter((id) => id !== dishId)
      } else {
         if (currentDishes.length >= 3) {
            toast({
               title: t("common.error"),
               description: "Максимум 3 блюда в день",
               variant: "destructive",
            })
            return
         }
         newDishes = [...currentDishes, dishId]
      }

      updateOrderDay(day, { selectedDishes: newDishes })
   }

   const calculateTotal = () => {
      let total = 0

      orderDays.forEach((orderDay) => {
         const dishCount = orderDay.selectedDishes.length
         if (dishCount === 2) {
            total += 2390 * orderDay.quantity
         } else if (dishCount === 3) {
            total += 2990 * orderDay.quantity
         }
         total += 300 * orderDay.quantity // Delivery fee
      })

      return total
   }

   const canSubmitOrder = () => {
      if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.office) {
         return false
      }
      return true
   }

   const canSubmitOrderTwoDishes = () => {
      return (
         orderDays.every(
            (od) => od.selectedDishes.length >= 2 && od.selectedDishes.length <= 3 && od.deliveryTime && od.quantity > 0,
         ) && orderDays.length > 0
      )
   }

   const submitOrder = async () => {
      if (!canSubmitOrder()) {
         toast({
            title: t("common.error"),
            description: "Заполните все обязательные поля",
            variant: "destructive",
         })
         return
      }
      if (!canSubmitOrderTwoDishes()) {
         toast({
            title: t("common.error"),
            description: "Можно заказать не менее двух блюд в день",
            variant: "destructive",
         })
         return
      }
      // },

      // Here you would send to your backend API
      const orderData = {
         customer: customerInfo,
         orderDays,
         paymentMethod,
         total: calculateTotal(),
         timestamp: new Date().toISOString(),
      }

      const res = await ordersApi.createOrder(orderData, menu)

      if (res.success) {
         toast({ title: t("common.success"), description: "Заказ успешно оформлен!" })
      } else {
         toast({
            title: t("common.error"),
            description: res.error || "Ошибка при оформлении заказа",
            variant: "destructive",
         })
         return
      }

      // Reset form
      setOrderDays([])
      setCustomerInfo({
         fullName: "",
         phone: "",
         office: "",
         floor: "",
         company: "",
      })
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <Header />

         <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("order.title")}</h1>
               <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                     <Clock className="h-4 w-4" />
                     <span>Заказы на сегодня до 11:00, на завтра до 17:00</span>
                  </div>
               </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
               {/* Menu Selection */}
               <div className="lg:col-span-2">
                  <Card>
                     <CardHeader>
                        <CardTitle>{t("order.selectDishes")}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm">
                           <Badge variant="outline">{t("order.price2dishes")}</Badge>
                           <Badge variant="outline">{t("order.price3dishes")}</Badge>
                           <Badge variant="outline">{t("order.deliveryFee")}</Badge>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        {menu?.map((dayMenu) => {
                           const orderDay = orderDays.find((od) => od.day === dayMenu.day)
                           const isSelected = !!orderDay

                           return (
                              <div key={dayMenu.day} className={`border rounded-lg p-4 ${!dayMenu.isAvailable ? "bg-gray-100 text-gray-400 pointer-events-none" : ""}`}>
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                       <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => dayMenu.isAvailable && toggleDay(dayMenu)}
                                          disabled={!dayMenu.isAvailable} />
                                       <div>
                                          <h3 className="font-semibold">{getDayName(dayMenu.day)}</h3>
                                          <p className={`text-sm text-gray-600 ${!dayMenu.isAvailable ? "text-gray-400" : ""}`}>{dayMenu.date}</p>
                                       </div>
                                    </div>

                                    {isSelected && (
                                       <div className="flex flex-col sm:flex-row items-center gap-4">
                                          <div>
                                             <Label className="text-xs">Время доставки</Label>
                                             <Input
                                                type="time"
                                                lang="ru"
                                                value={orderDay.deliveryTime}
                                                onChange={(e) => updateOrderDay(dayMenu.day, { deliveryTime: e.target.value })}
                                                min="12:00"        // разрешённое раннее время
                                                max="15:30"        // разрешённое позднее время
                                                step="300"         // шаг в секундах (здесь – 5 минут)
                                                className="w-24"
                                             />
                                          </div>
                                          <div>
                                             <Label className="text-xs">Количество</Label>
                                             <Input
                                                type="number"
                                                min="1"
                                                value={orderDay.quantity}
                                                onChange={(e) =>
                                                   updateOrderDay(dayMenu.day, { quantity: Number.parseInt(e.target.value) || 1 })
                                                }
                                                className="w-20"
                                             />
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {isSelected && (
                                    <div className="grid gap-3">
                                       <p className="text-sm text-gray-600 mb-2">
                                          {t("order.dishesRequired")} ({orderDay.selectedDishes.length}/3)
                                       </p>
                                       {dayMenu.dishes.map((dish) => (
                                          <div
                                             key={dish.id}
                                             className={`border rounded p-3 cursor-pointer transition-colors ${orderDay.selectedDishes.includes(dish.id)
                                                ? "border-orange-500 bg-orange-50"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                             onClick={() => toggleDish(dayMenu.day, dish.id)}
                                          >
                                             <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                   <h4 className="font-medium">{dish.name}</h4>
                                                   <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                                                </div>
                                                <Badge variant="secondary" className="ml-2">
                                                   {dish.calories} {t("common.calories")}
                                                </Badge>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )
                        })}
                     </CardContent>
                  </Card>
               </div>

               {/* Order Summary & Customer Info */}
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle>{t("order.customerInfo")}</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                           <Label htmlFor="fullName">{t("order.fullName")} *</Label>
                           <Input
                              id="fullName"
                              value={customerInfo.fullName}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                              placeholder="Иванов Иван Иванович"
                           />
                        </div>

                        <div>
                           <Label htmlFor="phone">{t("order.phone")} *</Label>
                           <Input
                              id="phone"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                              placeholder="+7 (777) 123-45-67"
                           />
                        </div>

                        <div>
                           <Label htmlFor="office">{t("order.office")} *</Label>
                           <Input
                              id="office"
                              value={customerInfo.office}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, office: e.target.value })}
                              placeholder="101"
                           />
                        </div>

                        <div>
                           <Label htmlFor="floor">{t("order.floor")}</Label>
                           <Input
                              id="floor"
                              value={customerInfo.floor}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, floor: e.target.value })}
                              placeholder="1"
                           />
                        </div>

                        <div>
                           <Label htmlFor="company">{t("order.company")}</Label>
                           <Input
                              id="company"
                              value={customerInfo.company}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                              placeholder="ТОО Компания"
                           />
                        </div>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader>
                        <CardTitle>{t("order.paymentMethod")}</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <RadioGroup
                           value={paymentMethod}
                           onValueChange={(value: "cash" | "invoice") => setPaymentMethod(value)}
                        >
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash">{t("order.cashCard")}</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                              <RadioGroupItem value="invoice" id="invoice" />
                              <Label htmlFor="invoice">{t("order.invoice")}</Label>
                           </div>
                        </RadioGroup>
                     </CardContent>
                  </Card>

                  {orderDays.length > 0 && (
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5" />
                              {t("order.total")}
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-2 text-sm">
                              {orderDays.map((orderDay) => {
                                 const dayMenu = menu.find((m) => m.day === orderDay.day)
                                 const dishCount = orderDay.selectedDishes.length
                                 const mealPrice = dishCount === 2 ? 2390 : dishCount === 3 ? 2990 : 0
                                 const deliveryPrice = 300

                                 return (
                                    <div key={orderDay.day} className="flex justify-between">
                                       <span>
                                          {getDayName(orderDay.day)} ({dishCount} блюда × {orderDay.quantity})
                                       </span>
                                       <span>{(mealPrice + deliveryPrice) * orderDay.quantity} ₸</span>
                                    </div>
                                 )
                              })}
                              <div className="border-t pt-2 font-semibold flex justify-between">
                                 <span>Итого:</span>
                                 <span>{calculateTotal()} ₸</span>
                              </div>
                           </div>

                           <Button className="w-full mt-4" onClick={submitOrder} >
                              {t("order.submit")}
                           </Button>
                        </CardContent>
                     </Card>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
