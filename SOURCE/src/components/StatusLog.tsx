import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import type { Language } from '../lib/types'
import { useTranslation } from '../lib/translations'

interface StatusLogProps {
  logs: string[]
  language: Language
}

export function StatusLog({ logs, language }: StatusLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const t = useTranslation(language)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])
  return (
    <Card>
      <CardHeader><CardTitle>{t.status}</CardTitle></CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-400">{t.ready}</p>
            ) : (
              logs.map((log, index) => (<div key={index} className="text-gray-700">{log}</div>))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
