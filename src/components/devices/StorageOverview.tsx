import { useStorageInfo } from "@/hooks/use-devices"

interface StorageOverviewProps {
  deviceId: string | null
}

export function StorageOverview({ deviceId }: StorageOverviewProps) {
  const { data: storages, isLoading } = useStorageInfo(deviceId)

  if (!deviceId) return null
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading storage info...</div>
  if (!storages?.length) return null

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium">Storage</h3>
      {storages.map((s) => {
        const used = s.used_space
        const free = s.free_space
        const total = s.max_capacity
        const pct = s.usage_pct
        return (
          <div key={s.storage_id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{s.description}</span>
              <span className="text-muted-foreground">{s.category}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  pct > 90 ? "bg-destructive" : pct > 70 ? "bg-yellow-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatBytes(used)} used</span>
              <span>{formatBytes(total)} total</span>
            </div>
            {free > 0 && (
              <div className="text-[10px] text-muted-foreground">
                {formatBytes(free)} free ({((free / total) * 100).toFixed(0)}%)
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
