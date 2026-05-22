import { useEffect, useRef } from "react"

type KeyHandler = (e: KeyboardEvent) => void
type KeyMap = Record<string, KeyHandler>

export function useKeyboard(keys: KeyMap) {
  const keysRef = useRef(keys)
  keysRef.current = keys

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.metaKey ? "Cmd" : "",
        e.ctrlKey ? "Ctrl" : "",
        e.shiftKey ? "Shift" : "",
        e.altKey ? "Alt" : "",
        e.key,
      ]
        .filter(Boolean)
        .join("+")

      const action = keysRef.current[key] || keysRef.current[e.key]
      if (action) {
        action(e)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}
