import { DayMenu } from "@/app/page"
import { Order } from "@/lib/api"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time utilities
export const timeUtils = {
  isOrderingAllowed(targetDate: Date): boolean {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

    // Same day - must order before 11:00
    if (target.getTime() === today.getTime()) {
      return now.getHours() < 11
    }

    // Next day - must order before 17:00 of previous day
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (target.getTime() === tomorrow.getTime()) {
      return now.getHours() < 17
    }

    // Future dates are allowed
    return target > tomorrow
  },

  formatDeliveryTime(time: string): string {
    return time.substring(0, 5) // Remove seconds if present
  },

  getWeekDays(): Array<{ key: string; name: string }> {
    return [
      { key: "monday", name: "Понедельник" },
      { key: "tuesday", name: "Вторник" },
      { key: "wednesday", name: "Среда" },
      { key: "thursday", name: "Четверг" },
      { key: "friday", name: "Пятница" },
    ]
  },
}

// Price calculations
export const priceUtils = {
  calculateMealPrice(dishCount: number): number {
    if (dishCount === 2) return 2390
    if (dishCount === 3) return 2990
    return 0
  },

  calculateDeliveryFee(): number {
    return 300
  },

  calculateOrderTotal(
    orderDays: Array<{
      selectedDishes: string[]
      quantity: number
    }>,
  ): number {
    return orderDays.reduce((total, day) => {
      const mealPrice = priceUtils.calculateMealPrice(day.selectedDishes.length)
      const deliveryFee = priceUtils.calculateDeliveryFee()
      return total + (mealPrice + deliveryFee) * day.quantity
    }, 0)
  },

  formatPrice(amount: number): string {
    return `${amount.toLocaleString("ru-RU")} ₸`
  },
}

// Validation utilities
export const validationUtils = {
  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+7\s?\d{3}\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/

    return phoneRegex.test(phone)
  },

  validateOrder(order: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!order.customer.fullName.trim()) {
      errors.push("Укажите ФИО")
    }

    if (!order.customer.phone.trim()) {
      errors.push("Укажите телефон")
    } else if (!validationUtils.validatePhone(order.customer.phone)) {
      errors.push("Неверный формат телефона")
    }

    if (!order.customer.office.trim()) {
      errors.push("Укажите номер офиса")
    }

    if (!order.orderDays.length) {
      errors.push("Выберите хотя бы один день")
    }

    order.orderDays.forEach((day: any, index: number) => {
      if (day.selectedDishes.length < 2 || day.selectedDishes.length > 3) {
        errors.push(`День ${index + 1}: выберите 2 или 3 блюда`)
      }
      if (!day.deliveryTime) {
        errors.push(`День ${index + 1}: укажите время доставки`)
      }
      if (day.quantity < 1) {
        errors.push(`День ${index + 1}: укажите количество`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

// Excel processing utilities
export const excelUtils = {
  async parseMenuFile(file: File): Promise<any> {
    // This would use a library like xlsx to parse the Excel file
    // For now, return mock data structure
    return {
      monday: [
        { name: "Блюдо 1", description: "Описание 1", calories: 400 },
        { name: "Блюдо 2", description: "Описание 2", calories: 350 },
        { name: "Блюдо 3", description: "Описание 3", calories: 450 },
      ],
      // ... other days
    }
  },

  generateOrdersExport(orders: any[]): Blob {
    // This would generate an Excel file with order data
    // For now, return a mock blob
    const csvContent = orders
      .map((order) => `${order.id},${order.customerName},${order.phone},${order.total}`)
      .join("\n")

    return new Blob([csvContent], { type: "text/csv" })
  },
}

// Print utilities
export const printUtils = {
  generateLabel(order: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Этикетка доставки - ${order.orderNumber}</title>
        <style>
          @page { size: A5; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; }
          .dishes { margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KENDALA Foodservice</h1>
          <h2>Этикетка доставки</h2>
        </div>
        
        <div class="section">
          <div><span class="label">Заказ №:</span> ${order.orderNumber}</div>
          <div><span class="label">Дата:</span> ${order.date} (${order.weekday})</div>
          <div><span class="label">Время доставки:</span> ${order.deliveryTime}</div>
        </div>
        
        <div class="section">
          <div><span class="label">Клиент:</span> ${order.customerName}</div>
          <div><span class="label">Телефон:</span> ${order.phone}</div>
          <div><span class="label">Компания:</span> ${order.company}</div>
          <div><span class="label">Офис:</span> ${order.office}, ${order.floor} этаж</div>
        </div>
        
        <div class="section">
          <div class="label">Блюда:</div>
          <div class="dishes">
            ${order.dishes.map((dish: string) => `<div>• ${dish}</div>`).join("")}
          </div>
        </div>
        
        <div class="section">
          <div><span class="label">Оплата:</span> ${order.paymentMethod === "cash" ? "Наличные/карта" : "По счету"}</div>
          <div><span class="label">Статус оплаты:</span> ${order.paymentStatus === "paid" ? "Оплачено" : "Не оплачено"}</div>
        </div>
      </body>
      </html>
    `
  },

  printDocument(content: string): void {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  },
}
