import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, Check } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"

const languages = [
  { code: "zh-CN", label: "简体中文" },
  { code: "en-US", label: "English" },
]

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const { i18n } = useTranslation()

  const switchLang = async (code: string) => {
    await i18n.changeLanguage(code)
    try { await invoke("set_language", { lang: code }) } catch {}
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setOpen(true)}>
        <Settings className="size-3" />
        {i18n.language?.startsWith("zh") ? "语言" : "Language"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-72">
          <DialogHeader>
            <DialogTitle>{i18n.language?.startsWith("zh") ? "选择语言" : "Language"}</DialogTitle>
            <DialogDescription>
              {i18n.language?.startsWith("zh") ? "切换应用界面语言" : "Switch application language"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent"
                onClick={() => switchLang(lang.code)}
              >
                <span>{lang.label}</span>
                {i18n.language === lang.code && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
