import { useCallback, useEffect, useMemo, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileIcon } from "./FileIcon"
import type { FileEntry } from "@/hooks/use-devices"

interface FileTableProps {
  entries: FileEntry[]
  totalItems?: number
  viewMode: "list" | "grid"
  selected: Set<number>
  onSelectionChange: (handles: Set<number>) => void
  onNavigate: (handle: number, name: string) => void
  onDownload: (handles: number[]) => void
  onDelete: (handles: number[]) => void
  onLoadMore?: () => void
  hasNextPage?: boolean
  isLoadingMore?: boolean
}

const ROW_HEIGHT = 44

export function FileTable({ entries, totalItems, viewMode, selected, onSelectionChange, onNavigate, onDownload, onDelete, onLoadMore, hasNextPage, isLoadingMore }: FileTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !onLoadMore || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: "400px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore, hasNextPage])

  const flatEntries = useMemo(() => {
    const allLoaded = totalItems != null && entries.length >= totalItems
    if (allLoaded) {
      return entries
        .filter((e) => e.is_directory)
        .sort((a, b) => a.name.localeCompare(b.name))
        .concat(
          entries
            .filter((e) => !e.is_directory)
            .sort((a, b) => a.name.localeCompare(b.name)),
        )
    }
    return entries
      .filter((e) => e.is_directory)
      .concat(entries.filter((e) => !e.is_directory))
  }, [entries, totalItems])

  const rowVirtualizer = useVirtualizer({
    count: viewMode === "list" ? flatEntries.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const allSelected = entries.length > 0 && selected.size === entries.length

  const toggleAll = useCallback(() => {
    onSelectionChange(allSelected ? new Set() : new Set(entries.map((e) => e.handle)))
  }, [allSelected, entries, onSelectionChange])

  const toggleOne = useCallback((handle: number, metaKey = false) => {
    const next = new Set(metaKey ? selected : [])
    next.has(handle) ? next.delete(handle) : next.add(handle)
    onSelectionChange(next)
  }, [selected, onSelectionChange])

  const handleRowClick = useCallback((entry: FileEntry, event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey) {
      toggleOne(entry.handle, true)
    } else if (selected.size > 0 && !selected.has(entry.handle)) {
      toggleOne(entry.handle, false)
    } else if (entry.is_directory) {
      onNavigate(entry.handle, entry.name)
    } else {
      toggleOne(entry.handle, false)
    }
  }, [selected, toggleOne, onNavigate])

  return (
    <div className="flex flex-col h-full">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 border-b bg-muted/50 text-xs">
          <span className="font-medium">{selected.size} selected</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onDownload([...selected])}>
            Download
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => onDelete([...selected])}>
            Delete
          </Button>
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex items-center h-8 px-4 border-b text-xs text-muted-foreground gap-4">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="mr-2" />
          <span className="flex-1">Name</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-36">Date Modified</span>
        </div>
      )}

      <div ref={parentRef} className="flex-1 overflow-auto">
        {viewMode === "list" ? (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const entry = flatEntries[virtualRow.index]
              const isSelected = selected.has(entry.handle)
              return (
                <div
                  key={entry.handle}
                  className={`flex items-center h-11 px-4 text-sm border-b border-border/50 cursor-pointer gap-4 ${
                    isSelected ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start}px)` }}
                  onClick={(e) => handleRowClick(entry, e)}
                  onDoubleClick={() => entry.is_directory && onNavigate(entry.handle, entry.name)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOne(entry.handle)}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2"
                  />
                  <FileIcon mime={entry.mime_type} />
                  <span className="flex-1 truncate font-medium">{entry.name}</span>
                  <span className="w-20 text-right text-muted-foreground">
                    {entry.is_directory ? "--" : formatSize(entry.size)}
                  </span>
                  <span className="w-36 text-xs text-muted-foreground">{entry.date_modified}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-4">
            {flatEntries.map((entry) => (
              <button
                key={entry.handle}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-xs transition-colors ${
                  selected.has(entry.handle) ? "bg-accent border-primary" : "hover:bg-accent"
                }`}
                onClick={(e) => handleRowClick(entry, e)}
                onDoubleClick={() => entry.is_directory && onNavigate(entry.handle, entry.name)}
              >
                <FileIcon mime={entry.mime_type} className="size-8" />
                <span className="truncate w-full">{entry.name}</span>
                <span className="text-muted-foreground">{entry.is_directory ? "Folder" : formatSize(entry.size)}</span>
              </button>
            ))}
          </div>
        )}
        {hasNextPage && totalItems != null && entries.length < totalItems && (
          <div ref={sentinelRef} className="flex items-center justify-center py-3 text-xs text-muted-foreground">
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full border border-current border-t-transparent animate-spin" />
                Loading more…
              </span>
            ) : (
              <span>Scroll for more</span>
            )}
          </div>
        )}
      </div>
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
