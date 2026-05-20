import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"

interface KeyboardShortcutsHelpProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: "Backspace", desc: "Go to parent directory" },
  { keys: "Enter", desc: "Open selected folder" },
  { keys: "⌘A", desc: "Select all items" },
  { keys: "⌘F", desc: "Focus search" },
  { keys: "⌘/", desc: "Show keyboard shortcuts" },
  { keys: "Escape", desc: "Deselect all / Close dialogs" },
]

export function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Available shortcuts for DFile</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.desc}</span>
              <Kbd>{s.keys}</Kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
