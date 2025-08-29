"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Search } from "lucide-react"
import { authApi, menuApi, ordersApi } from "@/lib/api"
import * as XLSX from 'xlsx';
import { useOrders } from "@/components/orders-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"

export default function AdminPage() {
   const { t } = useLanguage()
   const { orders, token, setToken, hash, setHash, getOrders } = useOrders()
   const { toast } = useToast()
   const [isLoggedIn, setIsLoggedIn] = useState(false)
   const [loginData, setLoginData] = useState({ login: "", password: "" })
   const [searchTerm, setSearchTerm] = useState("")
   const [statusFilter, setStatusFilter] = useState<string>("all")
   const [isRegistering, setIsRegistering] = useState(false)
   const [showCodeField, setShowCodeField] = useState(false)
   const [registrationData, setRegistrationData] = useState({
      name: "",
      login: "",
      password: "",
      method: "telegram",
      code: "",
   })
   const [loginMethod, setLoginMethod] = useState<"telegram_id" | "whatsapp" | "e-mail">("e-mail")
   const [loginType, setLoginType] = useState<"phone" | "email" | undefined>()
   const [dishes, setDishes] = useState<string>()
   const [openOrderId, setOpenOrderId] = useState<string | null>(null);
   const [isExportOpen, setIsExportOpen] = useState(false)
   const [period, setPeriod] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: new Date(),
      to: new Date(),
   })
   const [isLoadingExport, setIsLoadingExport] = useState(false)

   const normalizePhone = (val: string) => val.replace(/[^\d]/g, "") // только цифры

   const isPhone = (val: string) => {
      const digits = normalizePhone(val)
      return digits.length >= 10 && digits.length <= 15
   }

   // 🚦 улучшенный детектор логина
   const detectLogin = (value: string) => {
      const emailRe = /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i

      if (isPhone(value)) return { type: "phone" as const, method: "telegram_id" as const }
      if (emailRe.test(value.trim())) return { type: "email" as const, method: "e-mail" as const }

      return { type: undefined, method: "e-mail" as const }
   }

   useEffect(() => {
      const { type, method } = detectLogin(loginData.login)       // авторизация
      const { type: rType, method: rMethod } = detectLogin(registrationData.login) // регистрация

      setLoginType(type ?? rType)      // для поля «входа» важнее
      setLoginMethod(method ?? rMethod) // для поля «регистрации» важнее

      // если оба поля пусты → сброс
      if (!loginData.login && !registrationData.login) {
         setLoginType(undefined)
         setLoginMethod("e-mail")
      }
   }, [loginData.login, registrationData.login])

   useEffect(() => {
      if (token && hash) {
         setIsLoggedIn(true)
      }
   }, [token, hash])

   const handleLogin = async () => {
      if (!loginData.password) {
         toast({
            title: t("common.error"),
            description: "Укажите пароль",
            variant: "destructive",
         })

      } else {
         const resAuth = await authApi.login({
            login: loginData.login,
            password: loginData.password,
            type: !loginMethod ? 'e-mail' : loginMethod
         })


         if (resAuth.success && resAuth.data?.auth_hash) {
            const resToken = await authApi.token({
               auth_hash: resAuth.data.auth_hash,
            })
            setToken(resToken.data?.data.token)
            setHash(resToken.data?.data.u_hash)
            setIsLoggedIn(true)
            window.location.href = '/admin'
            toast({ title: t("common.success"), description: "Вход успешен" })
         } else {
            toast({
               title: t("common.error"),
               description: resAuth.error || "Неверный пароль",
               variant: "destructive",
            })
         }
      }
      return
   }

   const handleRegister = async () => {
      // 1. Проверяем, что логин валиден
      const { type } = detectLogin(registrationData.login) // helper выше
      if (!type) {
         toast({
            title: t("common.error"),
            description: "Некорректный логин – введите телефон или e-mail",
            variant: "destructive",
         })
         return           // дальше не идём
      }

      // отправляем запрос на получение кода
      const res = await authApi.register({
         u_name: registrationData.name,
         u_phone: loginType !== 'email' ? registrationData.login : undefined,
         u_email: loginType === 'email' ? registrationData.login : undefined,
         u_tg: loginType !== 'email' && registrationData.method === 'telegram' ? registrationData.code : undefined,
         u_wa: loginType !== 'email' && registrationData.method === 'whatsapp' ? registrationData.login : undefined,
         u_role: 2,
         st: registrationData.password ? "true" : undefined,
         data: JSON.stringify({
            password: registrationData.password
         })
      })

      if (res.success) {
         if (registrationData.password) {
            toast({ title: t("common.success"), description: "Регистрация успешна" })
            setIsLoggedIn(true)
            window.location.href = '/admin'
         } else {
            toast({
               title: t("common.success"),
               description: "Пароль отправлен на ваш контакт",
            })
         }
      } else {
         toast({
            title: t("common.error"),
            description: res.error || "Unknown error",
            variant: "destructive",
         })
      }
   }

   const handleLogout = async () => {
      const res = await authApi.logout()
      if (res.success) {
         setIsLoggedIn(false)
         setToken(undefined)
         setHash(undefined)
         toast({ title: t("common.success"), description: "Выход выполнен" })
      } else {
         toast({
            title: t("common.error"),
            description: res.error || "Не удалось выйти",
            variant: "destructive",
         })
      }
      return
   }

   const handleMenuShoose = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
         try {
            // Читаем файл как ArrayBuffer
            const data = await file.arrayBuffer();

            // Парсим Excel
            const workbook = XLSX.read(data, { type: 'array' });

            // Берём первый лист
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Конвертируем в JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const dataDishes = {
               lang_vls: {
                  dishes:
                  {
                     1: JSON.stringify(jsonData),
                  }
               }
            }

            setDishes(JSON.stringify(dataDishes))

         } catch (error) {
            console.error(error);
            toast({
               title: t("common.error"),
               description: "Ошибка при обработке файла",
               variant: "destructive",
            });
         }

      } else {
         toast({
            title: t("common.error"),
            description: "Пожалуйста, выберите файл Excel (.xlsx)",
            variant: "destructive",
         });
      }
   };

   const handleMenuUpload = async () => {
      if (dishes) {
         try {
            const res = await menuApi.uploadMenu({
               data: dishes,
               token: token,
               u_hash: hash
            })

            if (res.success) {
               toast({
                  title: t("common.success"),
                  description: "Меню успешно загружено",
               });
            } else {
               toast({
                  title: t("common.error"),
                  description: res.error || "Не удалось загрузить меню",
                  variant: "destructive",
               })
            }
         } catch (error) {
            console.error(error);
            toast({
               title: t("common.error"),
               description: "Ошибка при обработке файла",
               variant: "destructive",
            });
         }

      } else {
         toast({
            title: t("common.error"),
            description: "Пожалуйста, выберите файл Excel (.xlsx)",
            variant: "destructive",
         });
      }
   };

   const handleStatusChange = async (orderId: string, newStatus: string) => {
      try {
         await ordersApi.updateOrderStatus(orderId, newStatus);
         toast({
            title: t("common.success"),
            description: "Статус заказа успешно обновлен",
         });
         await getOrders();
      } catch (error) {

      }
   }

   const handleToggle = (orderId: string) => {
      setOpenOrderId(prev => prev === orderId ? null : orderId);
   };

   const getStatusBadge = (status: string) => {
      const statusMap = {
         new: { label: "Новый", variant: "default" as const },
         accepted: { label: "Принят", variant: "secondary" as const },
         paid: { label: "Оплачен", variant: "outline" as const },
         delivered: { label: "Доставлен", variant: "default" as const },
      }

      const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.new
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
   }

   const filteredOrders = orders.filter((order) => {
      const matchesSearch =
         order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.customer.phone.includes(searchTerm) ||
         order.customer.office.includes(searchTerm)
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
   })

   const exportToExcel = async () => {
      if (!period.from || !period.to) {
         toast({
            title: t("common.error"),
            description: "Выберите период",
            variant: "destructive",
         })
         return
      }

      try {
         setIsLoadingExport(true)

         const blob = await ordersApi.exportOrders({
            token: token,
            u_hash: hash,
            is_var: 1,
            s_t_data: {
               date_from: period.from.toISOString(),
               date_to: period.to.toISOString(),
            },
         })

         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = 'export.xlsx';
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);

         toast({ title: t("common.success"), description: "Отчёт сформирован" })
         setIsExportOpen(false)
      } catch (err: any) {
         toast({
            title: t("common.error"),
            description: err.message || "Не удалось сформировать отчёт",
            variant: "destructive",
         })
      } finally {
         setIsLoadingExport(false)
      }
   }

   if (!isLoggedIn) {
      return (
         <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
               <div className="max-w-md mx-auto">
                  <Card>
                     <CardHeader>
                        <CardTitle>
                           {isRegistering ? "Регистрация" : t("admin.login")}
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {isRegistering ? (
                           <>
                              <div>
                                 <Label htmlFor="reg-name">Имя</Label>
                                 <Input
                                    id="reg-name"
                                    value={registrationData.name}
                                    onChange={(e) =>
                                       setRegistrationData({ ...registrationData, name: e.target.value })
                                    }
                                    placeholder="Иван Иванович Иванов"
                                 />
                              </div>
                              <div>
                                 <Label htmlFor="reg-login">Логин (телефон или e-mail)</Label>
                                 <Input
                                    id="reg-login"
                                    value={registrationData.login}
                                    onChange={(e) =>
                                       setRegistrationData({ ...registrationData, login: e.target.value })
                                    }
                                    placeholder="+7xxx или your@mail.com"
                                 />
                                 <Label htmlFor="reg-password">Пароль</Label>
                                 <Input
                                    id="reg-password"
                                    type="password"
                                    value={registrationData.password}
                                    onChange={(e) =>
                                       setRegistrationData({ ...registrationData, password: e.target.value })
                                    }
                                    placeholder="kendala2024"
                                 />
                              </div>

                              {/* если логин похоже на телефон, предлагаем выбрать метод */}
                              {loginType === 'phone' && !showCodeField && (
                                 <div>
                                    <Label>Способ регистрации</Label>
                                    <select
                                       className="w-full border rounded-md px-2 py-1"
                                       value={registrationData.method}
                                       onChange={(e) =>
                                          setRegistrationData({ ...registrationData, method: e.target.value })
                                       }
                                    >
                                       <option value="telegram">Telegram</option>
                                       <option value="whatsapp">WhatsApp</option>
                                    </select>
                                 </div>
                              )}
                              {/* поле ввода кода после нажатия «Сохранить» */}
                              {loginType === 'phone' && registrationData.method === 'telegram' && (
                                 <div>
                                    <Label htmlFor="reg-code">ID Телеграм</Label>
                                    <Input
                                       id="reg-code"
                                       value={registrationData.code}
                                       onChange={(e) =>
                                          setRegistrationData({ ...registrationData, code: e.target.value })
                                       }
                                       placeholder="123456789"
                                    />
                                 </div>
                              )}
                           </>
                        ) : (
                           <>
                              <div>
                                 <Label htmlFor="username">Логин (телефон или e-mail)</Label>
                                 <Input
                                    id="username"
                                    value={loginData.login}
                                    onChange={(e) =>
                                       setLoginData({ ...loginData, login: e.target.value })
                                    }
                                    placeholder="+7xxx или your@mail.com"
                                 />
                              </div>
                              <div>
                                 <Label htmlFor="password">Пароль</Label>
                                 <Input
                                    id="password"
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                       setLoginData({ ...loginData, password: e.target.value })
                                    }
                                    placeholder="kendala2024"
                                    required
                                 />
                              </div>

                              {/* если пароль пуст и логин похож на телефон, показываем выбор метода */}
                              {loginType === 'phone' && (
                                 <div>
                                    <Label>Способ входа</Label>
                                    <select
                                       className="w-full border rounded-md px-2 py-1"
                                       value={loginMethod}
                                       onChange={(e) =>
                                          setLoginMethod(e.target.value as "telegram_id" | "whatsapp")
                                       }
                                    >
                                       <option value="telegram_id">Telegram</option>
                                       <option value="whatsapp">WhatsApp</option>
                                    </select>
                                 </div>
                              )}
                           </>
                        )}

                        <Button
                           onClick={isRegistering ? handleRegister : handleLogin}
                           className="w-full"
                        >
                           {isRegistering
                              ? showCodeField
                                 ? "Подтвердить"
                                 : "Сохранить"
                              : t("admin.login")}
                        </Button>

                        <div className="text-center">
                           <Button
                              variant="link"
                              onClick={() => {
                                 setIsRegistering(!isRegistering)
                                 setShowCodeField(false)
                              }}
                           >
                              {isRegistering
                                 ? "Уже есть аккаунт? Войти"
                                 : "Нет аккаунта? Зарегистрироваться"}
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <Header />

         <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900">{t("admin.title")}</h1>
               <Button variant="outline" onClick={() => handleLogout()}>
                  {t("admin.logout")}
               </Button>
            </div>

            <Tabs defaultValue="menu" className="space-y-6">
               <TabsList>
                  <TabsTrigger value="menu">{t("admin.uploadMenu")}</TabsTrigger>
                  <TabsTrigger value="orders" onClick={() => getOrders()}>{t("admin.orders")}</TabsTrigger>
               </TabsList>

               <TabsContent value="menu">
                  <Card>
                     <CardHeader>
                        <CardTitle>Загрузка меню на неделю</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div>
                           <Label htmlFor="menu-file">Выберите файл Excel (.xlsx)</Label>
                           <Input id="menu-file" type="file" accept=".xlsx" onChange={handleMenuShoose} className="mt-2" />
                        </div>
                        <div className="text-sm text-gray-600">
                           <p>Формат файла:</p>
                           <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Колонка day с номерами для каждого дня недели (Понедельник - 1 ... Пятница - 5)</li>
                              <li>3 блюда на каждый день</li>
                              <li>Колонки: day, name, description, calories</li>
                           </ul>
                        </div>
                        <Button className="flex items-center gap-2" onClick={handleMenuUpload}>
                           <Upload className="h-4 w-4" />
                           Загрузить меню
                        </Button>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="orders">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <span>Управление заказами</span>
                           <Button onClick={() => setIsExportOpen(true)} variant="outline" className="flex items-center gap-2 bg-transparent">
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                 />
                              </div>
                           </div>
                           <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
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
                                    <TableHead>Сумма</TableHead>
                                    <TableHead>Оплата</TableHead>
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
                                       <TableCell>{order.orderDays.map((day, index) => <div key={`${index}`}>{new Date(day.date).toLocaleDateString("ru-RU")}<br /></div>)}</TableCell>
                                       <TableCell
                                          onClick={() => {
                                             if (order.id) handleToggle(order.id)
                                          }}
                                          style={{ position: "relative", cursor: "pointer" }}>
                                          {order.status && getStatusBadge(order.status)}
                                          {openOrderId === order.id && (
                                             <div
                                                style={{
                                                   position: "absolute",
                                                   top: "70%",
                                                   left: 0,
                                                   background: "white",
                                                   border: "none",
                                                   zIndex: 10
                                                }}
                                             >
                                                <select
                                                   value={"all"}
                                                   onChange={(e) => {
                                                      if (order.id) handleStatusChange(order.id, e.target.value)
                                                   }
                                                   }
                                                   className="py-2 border border-gray-300 rounded-md text-center"
                                                >
                                                   <option value="all" hidden>Статус</option>
                                                   <option value="new">Новый</option>
                                                   <option value="accepted">Принят</option>
                                                   <option value="paid">Оплачен</option>
                                                   <option value="delivered">Доставлен</option>
                                                </select>
                                             </div>
                                          )}
                                       </TableCell>
                                       <TableCell>{order.total} ₸</TableCell>
                                       <TableCell>
                                          <Badge variant={order.paymentMethod === "cash" ? "outline" : "secondary"}>
                                             {order.paymentMethod === "cash" ? "Наличные" : "Счет"}
                                          </Badge>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>
               <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                  <DialogContent className="space-y-4 w-auto max-w-none">
                     <DialogHeader>
                        <DialogTitle>Экспорт отчёта</DialogTitle>
                     </DialogHeader>

                     <div className="grid gap-4">
                        <Label>Период</Label>
                        <Calendar
                           mode="range"
                           selected={period}
                           onSelect={(v) => setPeriod({ from: v?.from, to: v?.to })}
                           numberOfMonths={1}
                        />
                     </div>

                     <Button
                        onClick={exportToExcel}
                        disabled={isLoadingExport || !period.from || !period.to}
                        className="w-full"
                     >
                        {isLoadingExport ? "Формируем..." : "Скачать отчёт"}
                     </Button>
                  </DialogContent>
               </Dialog>
            </Tabs>
         </div>
      </div>
   )
}
