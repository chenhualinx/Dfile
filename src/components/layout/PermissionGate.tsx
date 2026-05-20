import { useTranslation } from "react-i18next"
import { ShieldOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUsbPermission } from "@/hooks/use-permissions"

const USB_SETTINGS_URL = "x-apple.systempreferences:com.apple.preference.security?Privacy_USB"

export function PermissionGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { data: permStatus, isLoading, isError } = useUsbPermission()

  if (isLoading) return <>{children}</>

  if (permStatus && !permStatus.usb_permission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center bg-background">
        <ShieldOff className="size-16 text-destructive" />
        <h2 className="text-xl font-semibold">{t("permission.usb_denied_title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {t("permission.usb_denied_description")}
        </p>
        <Button
          variant="default"
          onClick={() => {
            window.open(USB_SETTINGS_URL, "_blank")
          }}
        >
          <ExternalLink className="size-4" />
          {t("permission.open_system_settings")}
        </Button>
        <p className="text-xs text-muted-foreground/60 mt-2">
          {t("permission.usb_denied_guide")}
        </p>
        {permStatus.error && (
          <p className="text-xs text-destructive/60 max-w-sm truncate">
            {permStatus.error}
          </p>
        )}
      </div>
    )
  }

  if (isError) return null

  return <>{children}</>
}
