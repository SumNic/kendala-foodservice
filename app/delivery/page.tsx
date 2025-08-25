"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Truck, Printer, Search } from "lucide-react"
import { useOrders } from "@/components/orders-provider"
import { Dish } from "@/app/page"
import { timeUtils } from "@/lib/utils"

interface DeliveryOrder {
	id: string
	orderNumber: string
	customerName: string
	phone: string
	office: string
	floor: string
	company: string
	dishes: string[]
	deliveryTime: string
	paymentMethod: "cash" | "invoice"
	paymentStatus?: "new" | "accepted" | "paid" | "delivered"
	weekday: string
	date: string
}

export default function DeliveryPage() {
	const { t } = useLanguage()
	const { orders, menu } = useOrders()

	const [ordersDelivery, setOrdersDelivery] = useState<DeliveryOrder[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [floorFilter, setFloorFilter] = useState<string>("all")
	const [timeFilter, setTimeFilter] = useState<string>("all")

	useEffect(() => {
		if (orders && menu) getOrdersDelivery()
	}, [orders, menu])

	function getOrdersDelivery() {
		const today = new Date()
		today.getDate()
		const todayFormatted = today.toISOString().split('T')[0]

		const dishesWeek = menu.reduce((acc: Dish[], dish) => {
			acc.push(...dish.dishes)
			return acc
		}, [])

		const delivArr = orders.reduce((delivery: DeliveryOrder[], order) => {
			const orderCurrentDay = order.orderDays.find(day => day.date === todayFormatted)
			if (orderCurrentDay) {
				const dayTranslate = timeUtils.getWeekDays().find(day => day.key === orderCurrentDay.day)
				const orderDelivery = {
					id: order.id || 'non',
					orderNumber: `KD-${order.id}`,
					customerName: order.customer.fullName,
					phone: order.customer.phone,
					office: order.customer.office,
					company: order.customer.company,
					floor: order.customer.floor,
					dishes: orderCurrentDay.selectedDishes.map(dish => {
						return dishesWeek[+dish + 1].name
					}),
					deliveryTime: orderCurrentDay.deliveryTime,
					paymentMethod: order.paymentMethod,
					paymentStatus: order.status,
					weekday: dayTranslate?.name ? dayTranslate.name : '',
					date: orderCurrentDay.date,
				}
				delivery.push(orderDelivery)
				return delivery
			}
			return delivery
		}, [])

		setOrdersDelivery(delivArr)
	}

	const filteredOrders = ordersDelivery.filter((order) => {
		const matchesSearch =
			order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.office.includes(searchTerm) ||
			order.company.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesFloor = floorFilter === "all" || order.floor === floorFilter
		const matchesTime = timeFilter === "all" || order.deliveryTime.startsWith(timeFilter)
		return matchesSearch && matchesFloor && matchesTime
	})

	const sortedOrders = filteredOrders.sort((a, b) => {
		// Sort by time first, then by floor
		if (a.deliveryTime !== b.deliveryTime) {
			return a.deliveryTime.localeCompare(b.deliveryTime)
		}
		return Number.parseInt(a.floor) - Number.parseInt(b.floor)
	})

	const printLabel = (order: DeliveryOrder) => {
		// Mock print functionality - in real app, this would generate a printable label
		const printContent = `
      <div style="width: 210mm; height: 148mm; padding: 20px; font-family: Arial, sans-serif; border: 2px solid #000;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1>KENDALA Foodservice</h1>
          <h2>Этикетка доставки</h2>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Заказ №:</strong> ${order.orderNumber}<br>
          <strong>Дата:</strong> ${order.date} (${order.weekday})<br>
          <strong>Время доставки:</strong> ${order.deliveryTime}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Клиент:</strong> ${order.customerName}<br>
          <strong>Телефон:</strong> ${order.phone}<br>
          <strong>Компания:</strong> ${order.company}<br>
          <strong>Офис:</strong> ${order.office}, ${order.floor} этаж
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Блюда:</strong><br>
          ${order.dishes.map((dish) => `• ${dish}`).join("<br>")}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Оплата:</strong> ${order.paymentMethod === "cash" ? "Наличные/карта" : "По счету"}<br>
          <strong>Статус оплаты:</strong> ${order.paymentStatus === "paid" ? "Оплачено" : "Не оплачено"}
        </div>
      </div>
    `

		const printWindow = window.open("", "_blank")
		if (printWindow) {
			printWindow.document.write(printContent)
			printWindow.document.close()
			printWindow.print()
		}
	}

	const printSummary = () => {
		const summaryContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1>KENDALA Foodservice</h1>
          <h2>Сводка доставки на ${new Date().toLocaleDateString("ru-RU")}</h2>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px;">Время</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Этаж</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Офис</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Клиент</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Телефон</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Оплата</th>
            </tr>
          </thead>
          <tbody>
            ${sortedOrders
				.map(
					(order) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.deliveryTime}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.floor}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.office}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.customerName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.phone}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${order.paymentMethod === "cash" ? "Наличные" : "Счет"}</td>
              </tr>
            `,
				)
				.join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 30px;">
          <strong>Всего заказов: ${sortedOrders.length}</strong>
        </div>
      </div>
    `

		const printWindow = window.open("", "_blank")
		if (printWindow) {
			printWindow.document.write(summaryContent)
			printWindow.document.close()
			printWindow.print()
		}
	}

	const getPaymentBadge = (method: string, status: string) => {
		if (method === "invoice") {
			return <Badge variant="secondary">Счет</Badge>
		}
		return (
			<Badge variant={status === "paid" ? "default" : "outline"}>{status === "paid" ? "Оплачено" : "Наличные"}</Badge>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
						<Truck className="h-8 w-8 text-blue-600" />
						{t("delivery.title")}
					</h1>
					<p className="text-gray-600">Управление доставкой на {new Date().toLocaleDateString("ru-RU")}</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Список доставки ({sortedOrders.length} заказов)</span>
							<div className="flex gap-2">
								<Button onClick={printSummary} variant="outline" className="flex items-center gap-2 bg-transparent">
									<Printer className="h-4 w-4" />
									{t("delivery.printSummary")}
								</Button>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex gap-4 mb-6">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										placeholder="Поиск по имени, офису, компании..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<select
								value={floorFilter}
								onChange={(e) => setFloorFilter(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-md"
							>
								<option value="all">Все этажи</option>
								{[...new Set(ordersDelivery.map(order => order.floor).sort((a, b) => +a - +b))].map(floor => {
									return <option key={floor} value={floor}>{floor} этаж</option>
								})}
							</select>
							<select
								value={timeFilter}
								onChange={(e) => setTimeFilter(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-md"
							>
								<option value="all">Все время</option>
								<option value="12">12:00-12:59</option>
								<option value="13">13:00-13:59</option>
								<option value="14">14:00-14:59</option>
							</select>
						</div>

						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Время</TableHead>
										<TableHead>Этаж/Офис</TableHead>
										<TableHead>Клиент</TableHead>
										<TableHead>Телефон</TableHead>
										<TableHead>Блюда</TableHead>
										<TableHead>Оплата</TableHead>
										<TableHead>Действия</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sortedOrders.map((order) => (
										<TableRow key={order.id}>
											<TableCell className="font-mono font-semibold">{order.deliveryTime}</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{order.floor} этаж, офис {order.office}
													</div>
													<div className="text-sm text-gray-600">{order.company}</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">{order.customerName}</div>
											</TableCell>
											<TableCell>{order.phone}</TableCell>
											<TableCell>
												<div className="text-sm">
													{order.dishes.map((dish, index) => (
														<div key={index}>• {dish}</div>
													))}
												</div>
											</TableCell>
											<TableCell>{order.paymentStatus && getPaymentBadge(order.paymentMethod, order.paymentStatus)}</TableCell>
											<TableCell>
												<Button
													size="sm"
													variant="outline"
													onClick={() => printLabel(order)}
													className="flex items-center gap-1"
												>
													<Printer className="h-3 w-3" />
													Этикетка
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
