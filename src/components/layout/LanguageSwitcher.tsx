import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings } from "lucide-react"
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
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="size-8" onClick={() => setOpen(true)}>
        <Settings className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{i18n.language?.startsWith("zh") ? "设置" : "Settings"}</DialogTitle>
            <DialogDescription>
              {i18n.language?.startsWith("zh") ? "应用设置" : "Application settings"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                {i18n.language?.startsWith("zh") ? "语言" : "Language"}
              </div>
              <div className="px-3 py-2">
                <Select value={i18n.language} onValueChange={switchLang}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
