import { useState, useCallback, useEffect, useRef } from 'react'
import { Settings } from './components/Settings'
import { DropZone } from './components/DropZone'
import { StatusLog } from './components/StatusLog'
import { DownloadList } from './components/DownloadList'
import type { DownloadEntry } from './components/DownloadList'
import { LanguageSelector } from './components/LanguageSelector'
import { HelpDialog } from './components/HelpDialog'
import { transformJSON } from './lib/transformer'
import { defaultSettings } from './lib/types'
import type { TransformSettings, Language } from './lib/types'
import { useTranslation } from './lib/translations'
import './App.css'

const STORAGE_KEY_SETTINGS = 'divi-transformer-settings'
const STORAGE_KEY_LANGUAGE = 'divi-transformer-language'

function loadSettings(): TransformSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS)
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch { /* ignore corrupt data */ }
  return defaultSettings
}

function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE)
    if (saved && ['en', 'de', 'fr', 'es', 'ar', 'it', 'ru', 'nl'].includes(saved)) {
      return saved as Language
    }
  } catch { /* ignore */ }
  return 'en'
}

function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage)
  const [settings, setSettings] = useState<TransformSettings>(loadSettings)
  const [logs, setLogs] = useState<string[]>([])
  const [downloads, setDownloads] = useState<DownloadEntry[]>([])
  const t = useTranslation(language)

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, message])
  }, [])

  useEffect(() => {
    setLogs([t.ready, t.dragFiles])
  }, [language, t.ready, t.dragFiles])

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  }, [settings])

  // Persist language to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language)
  }, [language])

  // Release all generated object URLs when the app itself unmounts (page close/reload).
  const downloadsRef = useRef(downloads)
  downloadsRef.current = downloads
  useEffect(() => {
    return () => { downloadsRef.current.forEach(d => URL.revokeObjectURL(d.url)) }
  }, [])

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setLogs([])
    for (const file of files) {
      if (!file.name.endsWith('.json')) {
        addLog(`⚠️  ${t.skipped} ${file.name} ${t.notJSON}`)
        continue
      }
      addLog(`📂 ${t.processing} ${file.name}`)
      try {
        const content = await file.text()
        const jsonData = JSON.parse(content)
        addLog(`✅ ${t.loaded}`)
        addLog(`🔄 ${t.transforming}`)
        const result = transformJSON(jsonData, settings, addLog)
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const outputName = file.name.replace('.json', '_output.json')
        // Keep the object URL alive (not revoked) so the manual link in the
        // Downloads list below keeps working even if the browser silently
        // blocks the automatic download (observed e.g. in Opera for repeated
        // downloads without a fresh permission grant).
        setDownloads(prev => [{ name: outputName, url }, ...prev])
        const link = document.createElement('a')
        link.href = url
        link.download = outputName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addLog(`✅ ${t.completed}`)
        addLog(`💾 ${t.downloadStarted} ${outputName}`)
      } catch (error) {
        addLog(`❌ ${t.error} ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error(error)
      }
    }
  }, [settings, addLog, t])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <HelpDialog />
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
          </div>
        </header>
        <div className="space-y-6">
          <Settings settings={settings} onSettingsChange={setSettings} language={language} />
          <DropZone onFilesSelected={handleFilesSelected} language={language} />
          <StatusLog logs={logs.length > 0 ? logs : [t.ready, t.dragFiles]} language={language} />
          <DownloadList downloads={downloads} language={language} />
        </div>
      </div>
    </div>
  )
}

export default App
