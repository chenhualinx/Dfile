import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, FolderOpen, Loader2 } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { useDirectory } from "@/hooks/use-devices"
import type { FileEntry } from "@/hooks/use-devices"

interface FreeUpSpaceProps {
  deviceId: string | null
  storageId: number | null
}

export function FreeUpSpace({ deviceId, storageId }: FreeUpSpaceProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Fetch root directory to find large files
  const { data, isLoading } = useDirectory(deviceId, storageId, 0xFFFFFFFF, 0, 500)

  const largeFiles = useMemo(() => {
    // Files over 100MB
    return (data?.entries ?? [])
      .filter((e) => !e.is_directory && e.size > 100 * 1024 * 1024)
      .sort((a, b) => b.size - a.size)
  }, [data])

  const toggleFile = (handle: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(handle) ? next.delete(handle) : next.add(handle)
      return next
    })
  }

  const handleDelete = async () => {
    if (!deviceId || selected.size === 0) return
    if (!window.confirm(`Delete ${selected.size} file(s) (${formatBytes(totalSelectedSize)})?`)) return
    setDeleting(true)
    try {
      await invoke("delete_objects", { deviceId, handles: [...selected] })
      setSelected(new Set())
    } finally {
      setDeleting(false)
    }
  }

  const totalSelectedSize = useMemo(
    () => [...selected].reduce((sum, h) => {
      const f = largeFiles.find((e) => e.handle === h)
      return sum + (f?.size ?? 0)
    }, 0),
    [selected, largeFiles],
  )

  if (!deviceId) return null

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Free Up Space</h3>
        {largeFiles.length > 0 && (
          <span className="text-xs text-muted-foreground">{largeFiles.length} files over 100 MB</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Scanning...
        </div>
      ) : largeFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <FolderOpen className="size-8" />
          <span className="text-xs">No large files found</span>
        </div>
      ) : (
        <>
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {largeFiles.slice(0, 50).map((f) => (
                <label
                  key={f.handle}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(f.handle)}
                    onChange={() => toggleFile(f.handle)}
                    className="size-3"
                  />
                  <FileIcon mime={f.mime_type} className="size-3 flex-shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="text-muted-foreground">{formatBytes(f.size)}</span>
                </label>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selected.size > 0
                ? `${selected.size} selected, ${formatBytes(totalSelectedSize)} reclaimable`
                : "Select files to delete"}
            </span>
            {selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="size-3 mr-1" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function FileIcon({ mime, className }: { mime: string; className?: string }) {
  const color = mime.startsWith("image/") ? "text-blue-500"
    : mime.startsWith("video/") ? "text-purple-500"
    : "text-muted-foreground"
  return <File className={className} />
}

function File({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
