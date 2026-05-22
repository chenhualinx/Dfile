import { Folder, FileImage, FileVideo, FileAudio, FileText, File } from "lucide-react"

interface FileIconProps {
  mime: string
  className?: string
}

const iconMap: Record<string, typeof Folder> = {
  folder: Folder,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  text: FileText,
  pdf: FileText,
  archive: File,
}

const colorMap: Record<string, string> = {
  folder: "text-muted-foreground",
  image: "text-blue-500",
  video: "text-purple-500",
  audio: "text-green-500",
  text: "text-orange-500",
  pdf: "text-red-500",
  archive: "text-yellow-500",
}

export function FileIcon({ mime, className = "size-4" }: FileIconProps) {
  const category = mime.startsWith("image/") ? "image"
    : mime.startsWith("video/") ? "video"
    : mime.startsWith("audio/") ? "audio"
    : mime.startsWith("text/") ? "text"
    : mime === "folder" ? "folder"
    : mime === "application/pdf" ? "pdf"
    : mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("gz") ? "archive"
    : "text"

  const Icon = iconMap[category] ?? File
  const color = colorMap[category] ?? "text-muted-foreground"

  return <Icon className={`${className} ${color}`} />
}
