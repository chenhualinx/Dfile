import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, X, Download, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"

interface TransferItem {
  file_name: string
  bytes_transferred: number
  total_bytes: number
  speed_mbps: number
  status: "downloading" | "uploading" | "completed" | "failed"
}

export function TransferQueuePanel() {
  const [expanded, setExpanded] = useState(true)
  const [transfers, setTransfers] = useState<TransferItem[]>([])

  // Load persisted transfers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dfile-transfers")
      if (saved) setTransfers(JSON.parse(saved))
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dfile-transfers", JSON.stringify(transfers))
    } catch {}
  }, [transfers])

  useEffect(() => {
    let unlisten: UnlistenFn | undefined
    const setup = async () => {
      unlisten = await listen<TransferItem>("transfer:progress", (event) => {
        setTransfers((prev) => {
          const idx = prev.findIndex((t) => t.file_name === event.payload.file_name)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = event.payload
            return next
          }
          return [...prev, event.payload]
        })
      })
    }
    setup()
    return () => { unlisten?.() }
  }, [])

  const clearCompleted = useCallback(() => {
    setTransfers((prev) => prev.filter((t) => t.status === "downloading" || t.status === "uploading"))
  }, [])

  const activeCount = transfers.filter((t) => t.status === "downloading" || t.status === "uploading").length
  const allDone = transfers.length > 0 && activeCount === 0

  return (
    <div className="border-t bg-muted/30">
      <div className="flex items-center justify-between px-4 py-1.5">
        <button
          className="flex items-center gap-2 text-sm font-medium"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          Transfers
          {activeCount > 0 && <Badge variant="secondary" className="text-xs">{activeCount} active</Badge>}
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {allDone && <span className="text-green-600">All complete</span>}
          {transfers.length > 0 && (
            <Button variant="ghost" size="icon" className="size-6" onClick={clearCompleted}>
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        <ScrollArea className="max-h-40">
          <div className="px-4 pb-2 space-y-1">
            {transfers.length === 0 && (
              <div className="text-sm text-muted-foreground py-1">No active transfers</div>
            )}
            {transfers.map((t) => (
              <div key={t.file_name} className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0">
                  {t.status === "completed" ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : t.status === "failed" ? (
                    <AlertCircle className="size-4 text-red-500" />
                  ) : (
                    <Loader2 className="size-4 animate-spin text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {t.status === "uploading" ? <Upload className="size-3" /> : <Download className="size-3" />}
                    <span className="truncate">{t.file_name}</span>
                  </div>
                  {t.status !== "completed" && t.status !== "failed" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-1 rounded-full bg-primary transition-all"
                          style={{ width: `${t.total_bytes > 0 ? (t.bytes_transferred / t.total_bytes) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap">
                        {formatSize(t.bytes_transferred)} / {formatSize(t.total_bytes)}
                      </span>
                      <span className="whitespace-nowrap">{t.speed_mbps.toFixed(1)} MB/s</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
