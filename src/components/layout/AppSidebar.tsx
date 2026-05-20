import { Smartphone, HardDrive, Loader2, PlugIcon, RefreshCw, X } from "lucide-react"
import { useDevices, useConnectDevice } from "@/hooks/use-devices"
import { useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

interface AppSidebarProps {
  selectedDevice: string | null
  onSelectDevice: (id: string | null) => void
  onSelectStorage: (id: number | null) => void
}

export function AppSidebar({ selectedDevice, onSelectDevice, onSelectStorage }: AppSidebarProps) {
  const queryClient = useQueryClient()
  const { data: devices, isLoading, isFetching, isError } = useDevices()
  const { data: deviceInfo, isFetching: isConnecting, isError: isConnectError, error: connectErr } = useConnectDevice(selectedDevice)

  const rescan = () => {
    queryClient.invalidateQueries({ queryKey: ["devices"] })
  }

  const handleDeviceClick = async (id: string) => {
    if (id === selectedDevice) {
      try { await invoke("disconnect_device", { deviceId: id }) } catch {}
      onSelectDevice(null)
      onSelectStorage(null)
    } else {
      onSelectDevice(id)
      onSelectStorage(null)
    }
  }

  const handleStorageClick = (id: number) => {
    onSelectStorage(id)
  }

  return (
    <div className="w-64 flex-shrink-0 border-r bg-sidebar flex flex-col">
      {/* 侧边栏头部 - 与侧边栏背景色一致，为 macOS 红绿灯按钮留出空间 */}
      <div className="relative flex items-center justify-end pl-[92px] pr-2 h-[48px] border-b bg-sidebar">
        {/* 拖拽区域 - 覆盖整个头部但不包括按钮 */}
        <div className="absolute inset-0 sidebar-drag-region" data-tauri-drag-region />
        <div className="relative flex items-center gap-1 z-10">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-4">
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Devices</span>
            <button className="text-muted-foreground hover:text-foreground" onClick={rescan} title="Rescan USB devices">
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {isError && (
              <div className="px-2 py-2 text-xs text-destructive">
                USB scan failed. Make sure your device is connected and USB permission is granted.
                <button className="block mt-1 underline" onClick={rescan}>Retry</button>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Scanning...
              </div>
            )}
            {devices?.length === 0 && !isLoading && !isError && (
              <div className="flex flex-col items-center gap-1 px-2 py-4 text-sm text-muted-foreground">
                <PlugIcon className="size-6" />
                <span>No device connected</span>
                <span className="text-[10px] text-muted-foreground/60">Try clicking the refresh button or replug your device</span>
              </div>
            )}
            {devices?.map((device) => (
              <button
                key={device.id}
                className={`group flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors ${
                  selectedDevice === device.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                }`}
                onClick={() => handleDeviceClick(device.id)}
              >
                {isConnecting && selectedDevice === device.id ? (
                  <Loader2 className="size-4 animate-spin flex-shrink-0" />
                ) : (
                  <Smartphone className="size-4 flex-shrink-0" />
                )}
                <span className="truncate flex-1 text-left">{device.name}</span>
                {selectedDevice === device.id && (
                  <span title="Disconnect" className="flex-shrink-0">
                    <X
                      className="size-4 text-muted-foreground/50 group-hover:text-destructive transition-colors cursor-pointer"
                      onClick={async (e) => {
                        e.stopPropagation()
                        try { await invoke("disconnect_device", { deviceId: device.id }) } catch {}
                        onSelectDevice(null)
                        onSelectStorage(null)
                      }}
                    />
                  </span>
                )}
              </button>
            ))}
            {isConnectError && (
              <div className="px-2 py-2 text-xs text-destructive">
                {typeof connectErr === 'string' ? connectErr : connectErr instanceof Error ? connectErr.message : 'Connection failed'}
                <button className="block mt-1 underline" onClick={() => queryClient.invalidateQueries({ queryKey: ["connected-device", selectedDevice] })}>Retry</button>
              </div>
            )}
          </div>
        </div>
        {deviceInfo && (
          <div>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Storage</div>
            <div className="space-y-0.5 mt-1">
              {deviceInfo.storage.map((s) => {
                const pct = s.max_capacity > 0 ? ((s.max_capacity - s.free_space) / s.max_capacity) * 100 : 0
                return (
                  <button
                    key={s.storage_id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors"
                    onClick={() => handleStorageClick(s.storage_id)}
                  >
                    <HardDrive className="size-4 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="truncate text-xs">{s.description}</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-1 rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span>{formatBytes(s.free_space)} free</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="border-t px-3 py-2 text-[10px] text-muted-foreground/50 flex items-center justify-between">
        <span>DFile v0.1.0</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.open("https://dfile.app/privacy", "_blank")
          }}
          className="hover:text-foreground/70 transition-colors"
        >
          Privacy
        </a>
      </div>
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
