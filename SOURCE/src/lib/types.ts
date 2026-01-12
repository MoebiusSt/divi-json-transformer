export interface TransformSettings {
  mode: 'normal' | 'advanced' | 'dev'
  splits: {
    h1: boolean
    h2: boolean
    h3: boolean
    h4: boolean
    h5: boolean
    h6: boolean
    blockquote: boolean
    ol: boolean
    ul: boolean
  }
  processFootnotes: boolean
  processInterviewLists: boolean
  processTagMerging: boolean
  maxModulesPerRow: number
  maxParagraphsPerModule: number
}

export const defaultSettings: TransformSettings = {
  mode: 'advanced',
  splits: {
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: false,
    blockquote: true,
    ol: true,
    ul: true
  },
  processFootnotes: false,
  processInterviewLists: false,
  processTagMerging: true,
  maxModulesPerRow: 2,
  maxParagraphsPerModule: 0
}

export type LogFunction = (message: string) => void

export type Language = 'en' | 'de' | 'fr' | 'es' | 'ar' | 'it' | 'ru' | 'nl'
