import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowUp, Search, List, Grid3X3, Loader2, FolderOpen, RefreshCw, X } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { save } from "@tauri-apps/plugin-dialog"
import { BreadcrumbNav } from "./BreadcrumbNav"
import { FileTable } from "./FileTable"
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp"
import { useKeyboard } from "@/hooks/use-keyboard"
import { useInfiniteDirectory, useDevices } from "@/hooks/use-devices"
import { useQueryClient } from "@tanstack/react-query"

interface FileBrowserProps {
  deviceId: string | null
  storageId: number | null
}

export function FileBrowser({ deviceId, storageId }: FileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [pathStack, setPathStack] = useState<{ handle: number; name: string }[]>([
    { handle: 0, name: "Root" },
  ])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: devices } = useDevices()
  const prevDeviceCount = useRef(devices?.length ?? 0)

  // Detect if Tauri backend is available
  const hasBackend = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window

  useEffect(() => {
    const current = devices?.length ?? 0
    if (current > prevDeviceCount.current && deviceId) {
      queryClient.invalidateQueries({ queryKey: ["directory", deviceId] })
    }
    prevDeviceCount.current = current
  }, [devices?.length, deviceId, queryClient])

  const currentHandle = pathStack[pathStack.length - 1]?.handle ?? 0xFFFFFFFF
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteDirectory(deviceId, storageId, currentHandle, 200)

  const navigateTo = useCallback((handle: number, name: string) => {
    setPathStack((prev) => [...prev, { handle, name }])
    setSelected(new Set())
  }, [])

  const goBack = useCallback(() => {
    setPathStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
    setSelected(new Set())
  }, [])

  const handleSearch = useCallback((value: string) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => setSearchQuery(value), 300)
  }, [])

  const totalItems = data?.pages[0]?.total ?? 0

  const entries = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.entries) ?? []
    if (!searchQuery) return all
    const q = searchQuery.toLowerCase()
    return all.filter((e) => e.name.toLowerCase().includes(q))
  }, [data, searchQuery])

  const handleDownload = useCallback(async (handles: number[]) => {
    if (!deviceId) return
    for (const h of handles) {
      const entry = entries.find((e) => e.handle === h)
      if (!entry) continue

      const filePath = await save({
        defaultPath: entry.name,
      })
      if (!filePath) continue

      try {
        await invoke("download_file", {
          deviceId,
          objectHandle: h,
          destPath: filePath,
        })
      } catch (err) {
        const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Download failed"
        setErrorMessage(msg)
        setTimeout(() => setErrorMessage(null), 5000)
      }
    }
    setSelected(new Set())
  }, [deviceId, entries])

  const handleDelete = useCallback(async (handles: number[]) => {
    if (!deviceId || !window.confirm(`Delete ${handles.length} item(s)?`)) return
    await invoke("delete_objects", { deviceId, handles })
    setSelected(new Set())
  }, [deviceId])

  useKeyboard({
    "Backspace": (e) => {
      if (document.activeElement === searchInputRef.current) return
      e.preventDefault()
      goBack()
    },
    "Cmd+a": (e) => {
      if (document.activeElement === searchInputRef.current) return
      e.preventDefault()
      setSelected(new Set(entries.map((e2) => e2.handle)))
    },
    "Cmd+f": (e) => {
      e.preventDefault()
      searchInputRef.current?.focus()
    },
    "Cmd+/": (e) => {
      e.preventDefault()
      setShowShortcuts(true)
    },
    "Escape": () => {
      if (document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur()
      }
      setSelected(new Set())
    },
  })

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {!hasBackend && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
          Running in preview mode. Use <code className="font-mono bg-amber-100 px-1 rounded">bun run tauri dev</code> to launch the full app.
        </div>
      )}
      {/* 右侧标题栏 - 与主内容区背景色一致 */}
      <div className="relative flex items-center gap-2 border-b px-4 h-[48px] bg-background" data-tauri-drag-region>
        {/* 返回上一级目录 */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 hover:bg-accent/80 active:scale-95 transition-all duration-150"
          onClick={goBack}
          disabled={pathStack.length <= 1}
          title="返回上一级 (Backspace)"
        >
          <ArrowLeft className={cn("size-4", pathStack.length <= 1 && "opacity-30")} />
        </Button>
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search files... (⌘F)"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              const v = e.target.value
              handleSearch(v)
              if (!v && searchInputRef.current) {
                searchInputRef.current.value = ""
              }
            }}
            className="pl-8 pr-7 h-8"
          />
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded"
            onClick={() => {
              handleSearch("")
              if (searchInputRef.current) {
                searchInputRef.current.value = ""
                searchInputRef.current.focus()
              }
            }}
          >
            <X className="size-4" />
          </button>
        </div>
        {/* 列表视图切换 */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 hover:bg-accent/80 active:scale-95 transition-all duration-150",
            viewMode === "list" && "bg-accent text-accent-foreground"
          )}
          onClick={() => setViewMode("list")}
          title="列表视图"
        >
          <List className="size-4" />
        </Button>
        {/* 网格视图切换 */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 hover:bg-accent/80 active:scale-95 transition-all duration-150",
            viewMode === "grid" && "bg-accent text-accent-foreground"
          )}
          onClick={() => setViewMode("grid")}
          title="网格视图"
        >
          <Grid3X3 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => queryClient.invalidateQueries({ queryKey: ["directory"] })}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* 面包屑导航栏 - 与主内容区背景色一致 */}
      <div className="border-b px-4 py-1.5 bg-background">
        <BreadcrumbNav path={pathStack} onNavigate={(i) => setPathStack((prev) => prev.slice(0, i + 1))} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive gap-2 p-4">
            <span className="text-sm font-medium">Error loading directory</span>
            <span className="text-xs text-muted-foreground text-center max-w-md">
              {error instanceof Error ? error.message : String(error)}
            </span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : entries.length === 0 && !deviceId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <FolderOpen className="size-12" />
            <span className="text-sm">Select a device to browse</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <FolderOpen className="size-12" />
            <span className="text-sm">Empty directory</span>
          </div>
        ) : (
          <div className="h-full">
            <FileTable
              entries={entries}
              totalItems={totalItems}
              viewMode={viewMode}
              selected={selected}
              onSelectionChange={setSelected}
              onNavigate={navigateTo}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage ?? false}
              isLoadingMore={isFetchingNextPage}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-1.5 text-xs text-muted-foreground">
        <span>{searchQuery ? `${entries.length} items` : entries.length < totalItems ? `${entries.length} of ${totalItems} items` : `${totalItems} items`}</span>
        <span className="text-muted-foreground/50">⌘/ for shortcuts</span>
      </div>
      {errorMessage && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/30 text-destructive text-xs px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
      <KeyboardShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}
