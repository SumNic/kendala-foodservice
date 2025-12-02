"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Clock } from "lucide-react"
import { useOrders } from "@/components/orders-provider"
import { Dish } from "@/app/page"

interface DishSummary {
  name: string
  count: number
  totalCalories: number
}

export default function KitchenPage() {
  const { t } = useLanguage()
  const { orders, menu } = useOrders()

  const [dishSummary, setDishSummary] = useState<DishSummary[]>()

  useEffect(() => {
    if (orders && menu) getDishSummary()
  }, [orders, menu])

  function getDishSummary() {
    // Получить дату формата 2025-08-14 на один день больше, чем сегодня
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0]

    const leftArr = new Array(15).fill(0)

    const dishesWeek = menu.reduce((acc: Dish[], dish) => {
      acc.push(...dish.dishes)
      return acc
    }, [])

    orders.forEach((order) => {
      order.orderDays.forEach((day) => {
        if (day.date === tomorrowFormatted) {
          day.selectedDishes.forEach((dish) => {
            leftArr[+dish - 1] += day.quantity
          })
        }
      })
    })

    const dishes = leftArr.reduce((dishSum, left, index) => {
      if (left > 0) {
        dishSum.push({
          name: dishesWeek[index].name,
          count: left,
          totalCalories: dishesWeek[index].calories,
        })
        return dishSum
      }
      return dishSum
    }, [])

    setDishSummary(dishes)
  }

  const totalPortions = dishSummary?.reduce((sum, dish) => sum + dish.count, 0)
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-orange-600" />
            {t("kitchen.title")}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {tomorrowDate.toLocaleDateString("ru-RU", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{totalPortions}</div>
                <div className="text-gray-600">Всего порций</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{dishSummary?.length}</div>
                <div className="text-gray-600">Видов блюд</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {dishSummary?.length &&
                    totalPortions &&
                    Math.round(
                      dishSummary.reduce((sum, dish) => sum + dish.totalCalories * dish.count, 0) /
                        totalPortions,
                    )}
                </div>
                <div className="text-gray-600">Средняя калорийность</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("kitchen.dishSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dishSummary &&
                dishSummary
                  .sort((a, b) => b.count - a.count)
                  .map((dish, index) => (
                    <div
                      key={dish.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{dish.name}</h3>
                          <p className="text-gray-600">{dish.totalCalories} ккал на порцию</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{dish.count}</div>
                        <div className="text-sm text-gray-600">порций</div>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Итого к приготовлению:</span>
                <span className="text-2xl font-bold text-orange-600">{totalPortions} порций</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
