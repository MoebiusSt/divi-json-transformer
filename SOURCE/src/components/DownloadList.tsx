import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Download } from 'lucide-react'
import type { Language } from '../lib/types'
import { useTranslation } from '../lib/translations'

export interface DownloadEntry {
  name: string
  url: string
}

interface DownloadListProps {
  downloads: DownloadEntry[]
  language: Language
}

export function DownloadList({ downloads, language }: DownloadListProps) {
  const t = useTranslation(language)
  if (downloads.length === 0) return null
  return (
    <Card>
      <CardHeader><CardTitle>{t.downloadsHeading}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-3">{t.downloadsHint}</p>
        <div className="space-y-2">
          {downloads.map((entry, index) => (
            <a
              key={`${entry.name}-${index}`}
              href={entry.url}
              download={entry.name}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Download className="h-4 w-4 shrink-0" />
              {entry.name}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
