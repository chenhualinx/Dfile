import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export interface DeviceInfo {
  id: string
  name: string
  manufacturer: string
  model: string
  serial: string
  vendor_id: number
  product_id: number
}

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const result = await invoke<DeviceInfo[]>("list_devices")
      return result
    },
    refetchInterval: 2000,
    retry: 3,
    retryDelay: 1000,
  })
}

export interface StorageEntry {
  storage_id: number
  description: string
  max_capacity: number
  free_space: number
  filesystem_type: number
}

export interface ConnectedDeviceInfo {
  device_id: string
  manufacturer: string
  model: string
  serial: string
  storage: StorageEntry[]
}

export function useConnectDevice(deviceId: string | null) {
  return useQuery({
    queryKey: ["connected-device", deviceId],
    queryFn: async () => {
      if (!deviceId) return null
      return await invoke<ConnectedDeviceInfo>("connect_device", { deviceId })
    },
    enabled: !!deviceId,
    staleTime: Infinity,
  })
}

export interface FileEntry {
  handle: number
  name: string
  size: number
  is_directory: boolean
  date_modified: string
  mime_type: string
}

export interface PaginatedResult {
  entries: FileEntry[]
  total: number
  offset: number
  count: number
}

export function useDirectory(
  deviceId: string | null,
  storageId: number | null,
  parentHandle: number,
  offset: number,
  count: number,
) {
  return useQuery({
    queryKey: ["directory", deviceId, storageId, parentHandle, offset, count],
    queryFn: async () => {
      if (!deviceId || storageId === null) throw new Error("No device or storage selected")
      return await invoke<PaginatedResult>("list_objects", {
        deviceId,
        storageId,
        parentHandle,
        offset,
        count,
      })
    },
    enabled: !!deviceId && storageId !== null,
    staleTime: 2000,
  })
}

export interface StorageUsage {
  storage_id: number
  description: string
  max_capacity: number
  free_space: number
  used_space: number
  usage_pct: number
  category: string
}

export function useStorageInfo(deviceId: string | null) {
  return useQuery({
    queryKey: ["storage-info", deviceId],
    queryFn: async () => {
      if (!deviceId) throw new Error("No device")
      return await invoke<StorageUsage[]>("get_storage_info", { deviceId })
    },
    enabled: !!deviceId,
    staleTime: 5000,
  })
}

export function useSearch(
  deviceId: string | null,
  storageId: number | null,
  parentHandle: number,
  query: string,
) {
  return useQuery({
    queryKey: ["search", deviceId, storageId, parentHandle, query],
    queryFn: async () => {
      return await invoke<FileEntry[]>("search_files", {
        deviceId,
        storageId,
        parentHandle,
        query,
      })
    },
    enabled: !!deviceId && query.length > 0,
  })
}
