import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ConflictDialogProps {
  open: boolean
  fileName: string
  onResolve: (action: "skip" | "overwrite" | "rename") => void
  onApplyToAll: boolean
  onApplyToAllChange: (v: boolean) => void
}

const actions = [
  { value: "skip" as const, label: "Skip", desc: "Keep the existing file" },
  { value: "overwrite" as const, label: "Overwrite", desc: "Replace the existing file" },
  { value: "rename" as const, label: "Rename", desc: "Save with a new name" },
]

export function ConflictDialog({ open, fileName, onResolve, onApplyToAll, onApplyToAllChange }: ConflictDialogProps) {
  const [selected, setSelected] = useState<"skip" | "overwrite" | "rename">("skip")

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Conflict</DialogTitle>
          <DialogDescription>A file named "{fileName}" already exists.</DialogDescription>
        </DialogHeader>
        <RadioGroup value={selected} onValueChange={(v) => setSelected(v as typeof selected)}>
          {actions.map((a) => (
            <div key={a.value} className="flex items-center gap-2">
              <RadioGroupItem value={a.value} id={a.value} />
              <Label htmlFor={a.value} className="cursor-pointer">
                <span className="font-medium">{a.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{a.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="apply-all" checked={onApplyToAll} onChange={(e) => onApplyToAllChange(e.target.checked)} />
          <label htmlFor="apply-all" className="text-xs text-muted-foreground cursor-pointer">
            Apply to all conflicts
          </label>
        </div>
        <DialogFooter>
          <Button onClick={() => onResolve(selected)}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
