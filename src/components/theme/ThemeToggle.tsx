import { useTranslation } from "react-i18next"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme, type Theme } from "./ThemeProvider"
import { Button } from "@/components/ui/button"

const themeOrder: Theme[] = ["light", "dark", "system"]

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
  system: <Monitor className="size-4" />,
}

const themeTitles: Record<Theme, { zh: string; en: string }> = {
  light: { zh: "浅色", en: "Light" },
  dark: { zh: "深色", en: "Dark" },
  system: { zh: "跟随系统", en: "System" },
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language?.startsWith("zh")

  const handleClick = () => {
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const currentTitle = themeTitles[theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={handleClick}
      title={isZh ? `当前: ${currentTitle.zh} (点击切换)` : `Current: ${currentTitle.en} (click to switch)`}
    >
      {themeIcons[theme]}
    </Button>
  )
}
