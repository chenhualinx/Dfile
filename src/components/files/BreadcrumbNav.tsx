import { ChevronRight } from "lucide-react"

interface BreadcrumbNavProps {
  path: { handle: number; name: string }[]
  onNavigate: (index: number) => void
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {path.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
          <button
            className={`hover:underline ${i === path.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
            onClick={() => onNavigate(i)}
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </div>
  )
}
