import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { ScrollArea } from '../components/ui/scroll-area'

const readmeContent = `# DIVI JSON Transformer v2.0.6

Transform DIVI JSON exports. Split long DIVI text modules which contain HTML text with headings or lists into several text modules or rows.

## Processing Modes

### Normal Mode
Basic splitting at headlines - creates separate text modules for each section.

### Advanced Mode
All features of Normal Mode, plus:
- **Max Modules per Row**: Create new DIVI rows after X modules
- **Max Paragraphs per Module**: Split modules after X paragraphs

### Dev Mode (Beta)
All features of Advanced Mode, plus:
- **Footnote Transformation**: Converts footnotes to linked lists
- **Interview Mode**: Converts lists (ol, ul) to blockquotes

## Features

- **Split Content**: Automatically split at H1, H2, H3, H4, H5, H6, Blockquote, OL, UL
- **HTML Cleanup**: Merges fragmented tags (em, span)
- **Multi-Language**: Available in 8 languages
- **100% Local**: Everything runs in your browser
- **No Installation**: Just open the HTML file

## How to Use

1. Open the App in your browser
2. Select your language (top-right corner)
3. Choose processing mode and configure settings
4. Drag JSON files onto the drop zone
5. Download transformed files automatically

## Workflow Example

1. Export a page layout from DIVI as JSON
2. Open the transformer app
3. Drag the JSON file into the drop zone
4. Import the *_output.json back into DIVI

## Technical Details

- Coded by Claude Sonnet 4.5, Nov.2025
- Built with React 18 + TypeScript
- Styled with Tailwind CSS + shadcn/ui
- Bundled with Parcel

---
**Version**: 2.0.5  
**License**: Free for personal and commercial use`

function formatMarkdown(text: string): React.ReactElement {
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let key = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-3xl font-bold mt-6 mb-4">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-2xl font-bold mt-5 mb-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-xl font-bold mt-4 mb-2">{line.slice(4)}</h3>)
    } else if (line.startsWith('- ')) {
      const content = line.slice(2)
      const boldMatch = content.match(/^\*\*(.*?)\*\*:(.*)/)
      if (boldMatch) {
        elements.push(<li key={key++} className="ml-6 mb-1"><strong>{boldMatch[1]}</strong>:{boldMatch[2]}</li>)
      } else {
        elements.push(<li key={key++} className="ml-6 mb-1">{content}</li>)
      }
    } else if (line.trim().startsWith('`') && line.trim().endsWith('`')) {
      const code = line.trim().slice(1, -1)
      elements.push(<code key={key++} className="bg-gray-100 px-2 py-1 rounded text-sm">{code}</code>)
    } else if (line.trim() === '---') {
      elements.push(<hr key={key++} className="my-6 border-gray-300" />)
    } else if (line.trim() === '') {
      elements.push(<br key={key++} />)
    } else if (line.trim()) {
      const parts = line.split(/(`[^`]+`)/)
      const spans = parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="bg-gray-100 px-1 rounded text-sm">{part.slice(1, -1)}</code>
        }
        const boldParts = part.split(/(\*\*[^*]+\*\*)/)
        return boldParts.map((bp, bpIdx) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return <strong key={`${idx}-${bpIdx}`}>{bp.slice(2, -2)}</strong>
          }
          return <span key={`${idx}-${bpIdx}`}>{bp}</span>
        })
      })
      elements.push(<p key={key++} className="mb-2">{spans}</p>)
    }
  }
  return <>{elements}</>
}

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader><DialogTitle>DIVI JSON Transformer - Documentation</DialogTitle></DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="text-sm text-gray-700 space-y-2">{formatMarkdown(readmeContent)}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
