"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useOrders } from "@/components/orders-provider"

interface AdminSettingsTabProps {
  isMaintenanceMode: boolean
  isBannerVisible: boolean
  isUploadingBanner: boolean
  onToggleMaintenance: (value: boolean) => void
  onToggleBannerVisible: (value: boolean) => void
  onBannerFileChange: (file: File | null) => void
  onBannerUpload: () => void
}

export function AdminSettingsTab({
  isMaintenanceMode,
  isBannerVisible,
  isUploadingBanner,
  onToggleMaintenance,
  onToggleBannerVisible,
  onBannerFileChange,
  onBannerUpload,
}: AdminSettingsTabProps) {
  const { banner, isLoadingBanner } = useOrders()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Настройки</h2>

      <Card>
        <CardHeader>
          <CardTitle>Баннер</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-48 justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
            {banner?.url && !isUploadingBanner ? (
              <img
                src={banner.url}
                alt="Баннер"
                className="max-h-48 w-auto max-w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center text-sm text-gray-500">
                {isLoadingBanner || isUploadingBanner ? "Загрузка..." : "Нет фото"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isBannerVisible}
              onCheckedChange={onToggleBannerVisible}
              id="banner-visible"
            />
            <Label htmlFor="banner-visible" className="text-sm text-gray-700">
              Показывать баннер
            </Label>
          </div>
          <div className="space-y-3">
            <Input
              id="banner-file"
              type="file"
              accept="image/*"
              onChange={(event) => onBannerFileChange(event.target.files?.[0] ?? null)}
            />
            <Button
              className="flex items-center gap-2"
              onClick={onBannerUpload}
              disabled={isUploadingBanner}
            >
              <Upload className="h-4 w-4" />
              {isUploadingBanner ? "Загрузка..." : "Загрузить баннер"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Техобслуживание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isMaintenanceMode}
              onCheckedChange={onToggleMaintenance}
              id="maintenance-mode"
            />
            <Label htmlFor="maintenance-mode" className="text-sm text-gray-700">
              Сайт на техобслуживании (показать предупреждение и отключить заказ)
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
