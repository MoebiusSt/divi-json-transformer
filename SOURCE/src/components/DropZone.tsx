import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Upload } from 'lucide-react'
import type { Language } from '../lib/types'
import { useTranslation } from '../lib/translations'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  language: Language
}

export function DropZone({ onFilesSelected, language }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const t = useTranslation(language)
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false)
    }
  }, [])
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }, [onFilesSelected])
  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        onFilesSelected(Array.from(target.files))
      }
    }
    input.click()
  }, [onFilesSelected])
  return (
    <Card className={`cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
      <CardContent className="p-12" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
        <div className="flex flex-col items-center justify-center text-center space-y-4 pointer-events-none">
          <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-700">{t.dropZoneText}</p>
            <p className="text-sm text-gray-500 mt-1">{t.dropZoneSubtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
