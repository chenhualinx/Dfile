import { useState, useEffect, useRef } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { FileBrowser } from "@/components/files/FileBrowser"
import { TransferQueuePanel } from "@/components/transfer/TransferQueuePanel"
import "./App.css"

function App() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const restored = useRef(false)

  useEffect(() => {
    invoke<string[]>("list_connected_devices").then(ids => {
      if (ids.length > 0) {
        setSelectedDevice(ids[0])
        restored.current = true
      }
    }).catch(() => {}).finally(() => setInitialLoading(false))
  }, [])

  if (initialLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Connecting...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppSidebar
        selectedDevice={selectedDevice}
        onSelectDevice={setSelectedDevice}
        onSelectStorage={setSelectedStorage}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <FileBrowser deviceId={selectedDevice} storageId={selectedStorage} />
        <TransferQueuePanel />
      </div>
    </div>
  )
}

export default App
