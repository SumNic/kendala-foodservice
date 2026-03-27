"use client"

import type React from "react"

import { Download, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Order } from "@/lib/api"

interface StatusMapEntry {
  label: string
  variant: "default" | "secondary" | "outline"
}

interface AdminOrdersTabProps {
  filteredOrders: Order[]
  searchTerm: string
  statusFilter: string
  openOrderId: string | null
  statusMap: Record<string, StatusMapEntry>
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onToggleOrder: (orderId: string) => void
  onStatusChange: (orderId: string, newStatus: string) => void
  getStatusBadge: (status: string) => React.ReactNode
  getVariantStyle: (variant: string, isSelected: boolean) => string
  onExportOpen: () => void
}

export function AdminOrdersTab({
  filteredOrders,
  searchTerm,
  statusFilter,
  openOrderId,
  statusMap,
  onSearchTermChange,
  onStatusFilterChange,
  onToggleOrder,
  onStatusChange,
  getStatusBadge,
  getVariantStyle,
  onExportOpen,
}: AdminOrdersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Управление заказами</span>
          <Button
            onClick={onExportOpen}
            variant="outline"
            className="flex w-full items-center justify-center gap-2 bg-transparent sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени, телефону, офису..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="accepted">Принятые</option>
            <option value="paid">Оплаченные</option>
            <option value="delivered">Доставленные</option>
          </select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Офис</TableHead>
                <TableHead>Дата доставки</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="min-w-[110px]">Сумма</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead className="min-w-[400px]">Примечание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, i) => (
                <TableRow key={order.id || i}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.fullName}</div>
                      <div className="text-sm text-gray-600">{order.customer.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.customer.phone}</TableCell>
                  <TableCell>{order.customer.office}</TableCell>
                  <TableCell>
                    {order.orderDays.map((day, index) => (
                      <div key={`${index}`}>
                        {new Date(day.date).toLocaleDateString("ru-RU")}
                        <br />
                      </div>
                    ))}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      if (order.id) onToggleOrder(order.id)
                    }}
                    style={{ position: "relative", cursor: "pointer" }}
                  >
                    {order.status && getStatusBadge(order.status)}
                    {openOrderId === order.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "70%",
                          left: 0,
                          background: "white",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.375rem",
                          zIndex: 10,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          minWidth: "120px",
                        }}
                      >
                        {Object.entries(statusMap).map(([value, status]) => (
                          <div
                            key={value}
                            onClick={() => {
                              if (order.id) onStatusChange(order.id, value)
                            }}
                            className={`py-2 px-3 cursor-pointer transition-colors text-sm
                              ${
                                order.status === value
                                  ? getVariantStyle(status.variant, true)
                                  : getVariantStyle(status.variant, false)
                              }
                              ${value !== "delivered" ? "border-b border-gray-100" : ""}
                            `}
                            style={{
                              borderBottom: value !== "delivered" ? "1px solid #f3f4f6" : "none",
                            }}
                          >
                            {status.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{order.total} ₸</TableCell>
                  <TableCell>
                    <Badge variant={order.paymentMethod === "cash" ? "outline" : "secondary"}>
                      {order.paymentMethod === "cash" ? "Наличные" : "Счет"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.orderDays.some((day) => day.note) ? (
                      order.orderDays.map((day, index) =>
                        day.note ? (
                          <div key={`${index}`} className="text-sm">
                            <div>{day.note}</div>
                          </div>
                        ) : null,
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
