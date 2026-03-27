"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LoginMethod = "telegram_id" | "whatsapp" | "e-mail"
export type LoginType = "phone" | "email" | undefined

export interface LoginData {
  login: string
  password: string
}

export interface RegistrationData {
  name: string
  login: string
  password: string
  method: "telegram" | "whatsapp"
  code: string
}

interface AdminAuthCardProps {
  isRegistering: boolean
  showCodeField: boolean
  loginData: LoginData
  registrationData: RegistrationData
  loginType: LoginType
  loginMethod: LoginMethod
  setLoginData: React.Dispatch<React.SetStateAction<LoginData>>
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>
  setIsRegistering: React.Dispatch<React.SetStateAction<boolean>>
  setShowCodeField: React.Dispatch<React.SetStateAction<boolean>>
  setLoginMethod: React.Dispatch<React.SetStateAction<LoginMethod>>
  onLogin: () => void
  onRegister: () => void
  t: (key: string) => string
}

export function AdminAuthCard({
  isRegistering,
  showCodeField,
  loginData,
  registrationData,
  loginType,
  loginMethod,
  setLoginData,
  setRegistrationData,
  setIsRegistering,
  setShowCodeField,
  setLoginMethod,
  onLogin,
  onRegister,
  t,
}: AdminAuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRegistering ? "Регистрация" : t("admin.login")}</CardTitle>
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
                  setRegistrationData({
                    ...registrationData,
                    name: e.target.value,
                  })
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
                  setRegistrationData({
                    ...registrationData,
                    login: e.target.value,
                  })
                }
                placeholder="+7xxx или your@mail.com"
              />
              <Label htmlFor="reg-password">Пароль</Label>
              <Input
                id="reg-password"
                type="password"
                value={registrationData.password}
                onChange={(e) =>
                  setRegistrationData({
                    ...registrationData,
                    password: e.target.value,
                  })
                }
                placeholder="kendala2024"
              />
            </div>

            {loginType === "phone" && !showCodeField && (
              <div>
                <Label>Способ регистрации</Label>
                <select
                  className="w-full border rounded-md px-2 py-1"
                  value={registrationData.method}
                  onChange={(e) =>
                    setRegistrationData({
                      ...registrationData,
                      method: e.target.value as RegistrationData["method"],
                    })
                  }
                >
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            )}
            {loginType === "phone" && registrationData.method === "telegram" && (
              <div>
                <Label htmlFor="reg-code">ID Телеграм</Label>
                <Input
                  id="reg-code"
                  value={registrationData.code}
                  onChange={(e) =>
                    setRegistrationData({
                      ...registrationData,
                      code: e.target.value,
                    })
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
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
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
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                placeholder="kendala2024"
                required
              />
            </div>

            {loginType === "phone" && (
              <div>
                <Label>Способ входа</Label>
                <select
                  className="w-full border rounded-md px-2 py-1"
                  value={loginMethod}
                  onChange={(e) => setLoginMethod(e.target.value as LoginMethod)}
                >
                  <option value="telegram_id">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            )}
          </>
        )}

        <Button onClick={isRegistering ? onRegister : onLogin} className="w-full">
          {isRegistering ? (showCodeField ? "Подтвердить" : "Сохранить") : t("admin.login")}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setShowCodeField(false)
            }}
          >
            {isRegistering ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
