import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export interface PermissionStatus {
  usb_permission: boolean
  error: string | null
}

export function useUsbPermission() {
  return useQuery({
    queryKey: ["usb-permission"],
    queryFn: async () => {
      return await invoke<PermissionStatus>("check_usb_permission")
    },
    refetchInterval: 5000,
    retry: 1,
  })
}
