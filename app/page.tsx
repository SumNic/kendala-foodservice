"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Clock, ShoppingCart } from "lucide-react"
import { ordersApi } from "@/lib/api"
import cloneDeep from "lodash/cloneDeep";
import { useOrders } from "@/components/orders-provider"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
   const [timeRestrictionMessage, setTimeRestrictionMessage] = useState("")

   useEffect(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (minutes >= 0 && hours >= 17) setTimeRestrictionMessage(t("order.orderClosesTomorrow"))
      if (minutes >= 0 && hours >= 11 && hours < 17) setTimeRestrictionMessage(t("order.orderClosed"))

      // Check if ordering is allowed based on current time
      const interval = setInterval(() => {
         const now = new Date();
         const currentDay = now.getDay()
         const hours = now.getHours();
         const minutes = now.getMinutes();

         if (minutes >= 0 && hours >= 17) setTimeRestrictionMessage(t("order.orderClosesTomorrow"))
         if (minutes >= 0 && hours >= 11 && hours < 17) setTimeRestrictionMessage(t("order.orderClosed"))

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

   const handleChange = (value: string) => {
      setCustomerInfo({ ...customerInfo, phone: value.replace(/\D/g, "") })
   };

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
      <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#87CEEB]">
         <Header />

         <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
               <h1 className="text-4xl font-bold text-gray-900 text-[#003D82] mb-2">{t("order.title")}</h1>
               {timeRestrictionMessage && <Alert className="bg-red-50 border-red-200 flex">
                  <Clock className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{timeRestrictionMessage}</AlertDescription>
               </Alert>}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
               {/* Menu Selection */}
               <div className="lg:col-span-2">
                  <Card className="bg-[#003D82] border-0 shadow-lg">
                     <CardHeader>
                        <CardTitle className="text-3xl font-bold text-white mb-6">{t("order.selectDishes")}</CardTitle>
                        <div className="text-white text-sm mb-6 pb-4 border-b border-[#00A8E8]">
                           <span className="font-semibold">{t('order.price2dishes')}</span>
                           <span className="mx-4">•</span>
                           <span className="font-semibold">{t('order.price3dishes')}</span>
                           <span className="mx-4">•</span>
                           <span className="font-semibold">{t('order.deliveryFee')}</span>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        {menu?.map((dayMenu) => {
                           const orderDay = orderDays.find((od) => od.day === dayMenu.day)
                           const isSelected = !!orderDay

                           return (
                              <div
                                 key={dayMenu.day}
                                 className={`rounded-lg p-4 border ${!dayMenu.isAvailable
                                    ? "bg-gray-500 border-gray-600 text-gray-400 pointer-events-none"
                                    : "bg-[#002855] border-[#00A8E8]"
                                    }`}
                              >
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 sm:flex-row">
                                       <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => dayMenu.isAvailable && toggleDay(dayMenu)}
                                          disabled={!dayMenu.isAvailable}
                                          className="border-[#00A8E8]"
                                       />
                                       <div>
                                          <h3 className={`font-semibold ${dayMenu.isAvailable ? "text-white" : "text-gray-400 pointer-events-none"}`}>
                                             {getDayName(dayMenu.day)}
                                          </h3>
                                          <p className={`text-sm text-gray-600 ${!dayMenu.isAvailable ? "text-gray-400" : "text-white"}`}>{dayMenu.date}</p>
                                       </div>
                                    </div>

                                    {isSelected && (
                                       <div className="flex sm:flex-row justify-end items-center gap-4">
                                          <div className="flex flex-col items-center">
                                             <Label className="text-xs py-0.5 text-white">{t('order.deliveryTime')}</Label>
                                             <select
                                                value={orderDay.deliveryTime}
                                                onChange={(e) => updateOrderDay(dayMenu.day, { deliveryTime: e.target.value })}
                                                className="bg-[#001F3F] w-full h-8 px-3 py-1 border border-[#00A8E8] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black appearance-none text-white placeholder:text-[#87CEEB]"
                                             >
                                                <option value="12:00">12:00 - 12:30</option>
                                                <option value="12:30">12:30 - 13:00</option>
                                                <option value="13:00">13:00 - 13:30</option>
                                                <option value="13:30">13:30 - 14:00</option>
                                                <option value="14:00">14:00 - 14:30</option>
                                                <option value="14:30">14:30 - 15:00</option>
                                                <option value="15:00">15:00 - 15:30</option>
                                                <option value="15:30">15:30 - 16:00</option>
                                             </select>
                                          </div>
                                          <div className="flex flex-col items-center">
                                             <Label className="text-xs text-white py-0.5">{t('order.quantity')}</Label>
                                             <Input
                                                type="number"
                                                inputMode="numeric"
                                                step="1"
                                                value={orderDay.quantity}
                                                onFocus={(e) => {
                                                   e.target.value = "";
                                                }}
                                                onBlur={(e) => {
                                                   const val = Number.parseInt(e.target.value, 10);
                                                   if (!Number.isInteger(val) || val < 1) {
                                                      updateOrderDay(dayMenu.day, { quantity: 1 });
                                                   } else {
                                                      updateOrderDay(dayMenu.day, { quantity: val });
                                                   }
                                                }}
                                                onChange={(e) => {
                                                   const value = e.target.value;
                                                   if (value === "") return; // не обновляем при пустом поле
                                                   const parsed = Number.parseInt(value, 10);
                                                   if (!Number.isNaN(parsed)) {
                                                      updateOrderDay(dayMenu.day, { quantity: parsed });
                                                   }
                                                }}
                                                className="bg-[#001F3F] w-20 h-8 px-3 py-1 border border-[#00A8E8] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black appearance-none text-white placeholder:text-[#87CEEB]"
                                             />
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {isSelected && (
                                    <div className="grid gap-3">
                                       {dayMenu.dishes.map((dish) => (
                                          <div
                                             key={dish.id}
                                             className={`bg-[#001F3F] border  rounded p-3 cursor-pointer transition-colors ${orderDay.selectedDishes.includes(dish.id)
                                                ? "border-orange-500 bg-orange-50"
                                                : "border-[#00A8E8]/30 md:hover:border-[#00A8E8] md:transition"
                                                }`}
                                             onClick={() => toggleDish(dayMenu.day, dish.id)}
                                          >
                                             <div className="flex flex-col sm:flex-row justify-between items-start">
                                                <div className="flex-1">
                                                   <h4 className="font-medium text-white">{dish.name}</h4>
                                                   <p className="text-sm text-[#87CEEB] mt-1 w-full">{dish.description}</p>
                                                </div>
                                                <Badge variant="secondary" className="mt-2 sm:mt-0 sm:ml-2 bg-[#00A8E8] text-white border-0">
                                                   {dish.calories} {t("common.calories")}
                                                </Badge>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                                 {orderDay && orderDay.selectedDishes.length >= 0 && orderDay.selectedDishes.length < 2 && (
                                    <Alert className="mt-4 bg-yellow-900/30 border-yellow-600">
                                       <AlertDescription className="text-yellow-200">{t("order.dishesRequired")}</AlertDescription>
                                    </Alert>
                                 )}
                              </div>
                           )
                        })}
                     </CardContent>
                  </Card>
               </div>

               {/* Order Summary & Customer Info */}
               <div>
                  <div className="space-y-4 sticky top-6">
                     <Card className="bg-[#003D82] border-0 shadow-lg">
                        <CardHeader>
                           <CardTitle className="text-2xl font-bold text-white">{t("order.customerInfo")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                              <Label htmlFor="fullName" className="text-white text-sm">{t("order.fullName")} *</Label>
                              <Input
                                 id="fullName"
                                 value={customerInfo.fullName}
                                 onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                 placeholder="Иванов Иван Иванович"
                                 className="bg-[#001F3F] border-[#00A8E8] text-white placeholder:text-[#87CEEB]"
                              />
                           </div>

                           <div>
                              <Label htmlFor="phone" className="text-white text-sm">{t("order.phone")} *</Label>
                              <PhoneInput
                                 country="kz"
                                 preferredCountries={["kz"]}
                                 excludeCountries={["ru"]}
                                 value={customerInfo.phone}
                                 onChange={handleChange}
                                 enableSearch={true}
                                 countryCodeEditable={false}
                                 inputProps={{
                                    name: "phone",
                                    required: true,
                                    autoFocus: false,
                                    placeholder: "+7 (777) 123-45-67",
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                 }}
                                 inputClass="!h-10 !text-[16px] !text-[#87CEEB] !w-full !bg-[#001F3F] !border-[#00A8E8] !placeholder:text-[#87CEEB]"
                                 buttonClass="!border !border-gray-300 !rounded-l-md !bg-gray-300"
                                 dropdownClass="!bg-gray-300 !text-gray-800 !border !border-gray-300 !shadow-md"
                                 disableCountryCode={false}
                                 disableDropdown={false}
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                 <Label htmlFor="office" className="text-white text-sm">{t("order.office")} *</Label>
                                 <Input
                                    id="office"
                                    value={customerInfo.office}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, office: e.target.value })}
                                    placeholder="101"
                                    className="bg-[#001F3F] border-[#00A8E8] text-white placeholder:text-[#87CEEB]"
                                 />
                              </div>

                              <div>
                                 <Label htmlFor="floor" className="text-white text-sm">{t("order.floor")}</Label>
                                 <Input
                                    id="floor"
                                    value={customerInfo.floor}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, floor: e.target.value })}
                                    placeholder="1"
                                    className="bg-[#001F3F] border-[#00A8E8] text-white placeholder:text-[#87CEEB]"
                                 />
                              </div>
                           </div>

                           <div>
                              <Label htmlFor="company" className="text-white text-sm">{t("order.company")}</Label>
                              <Input
                                 id="company"
                                 value={customerInfo.company}
                                 onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                                 placeholder="ТОО Компания"
                                 className="bg-[#001F3F] border-[#00A8E8] text-white placeholder:text-[#87CEEB]"
                              />
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="bg-[#003D82] border-0 shadow-lg">
                        <CardHeader>
                           <CardTitle className="text-2xl font-bold text-white">{t("order.paymentMethod")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <RadioGroup
                              value={paymentMethod}
                              onValueChange={(value: "cash" | "invoice") => setPaymentMethod(value)}
                           >
                              <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="cash" id="cash" className="border-[#00A8E8]" />
                                 <Label htmlFor="cash" className="text-white text-sm">{t("order.cashCard")}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="invoice" id="invoice" className="border-[#00A8E8]" />
                                 <Label htmlFor="invoice" className="text-white text-sm">{t("order.invoice")}</Label>
                              </div>
                           </RadioGroup>
                        </CardContent>
                     </Card>

                     {orderDays.length > 0 && (
                        <Card className="bg-[#003D82] border-0 shadow-lg">
                           <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
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
                                          <span className="text-white text-sm">
                                             {getDayName(orderDay.day)} ({dishCount} {t('order.dishes')} × {orderDay.quantity})
                                          </span>
                                          <span className="text-white text-sm">{(mealPrice + deliveryPrice) * orderDay.quantity} ₸</span>
                                       </div>
                                    )
                                 })}
                                 <div className="border-t pt-2 font-semibold flex justify-between">
                                    <span className="text-white text-sm">{t("order.total")}:</span>
                                    <span className="text-white text-sm">{calculateTotal()} ₸</span>
                                 </div>
                              </div>

                              <Button className="w-full mt-4 bg-[#00A8E8] hover:bg-[#0099CC] text-[#003D82] font-bold h-10" onClick={submitOrder} >
                                 {t("order.submit")}
                              </Button>
                           </CardContent>
                        </Card>
                     )}
                  </div>
               </div>
            </div>
         </div>
         <div className="fixed right-0 top-32 w-64 h-64 opacity-20 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#003D82]">
               <path d="M 100 20 Q 150 50, 150 100 T 100 180" stroke="currentColor" strokeWidth="2" fill="none" />
               <circle cx="150" cy="100" r="8" fill="currentColor" />
            </svg>
         </div>
      </div>
   )
}
