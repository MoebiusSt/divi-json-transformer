import type { TransformSettings, Language } from '../lib/types'
import { useTranslation } from '../lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { HelpCircle, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { Alert, AlertDescription } from '../components/ui/alert'

interface SettingsProps {
  settings: TransformSettings
  onSettingsChange: (settings: TransformSettings) => void
  language: Language
}

export function Settings({ settings, onSettingsChange, language }: SettingsProps) {
  const t = useTranslation(language)
  const updateSettings = (updates: Partial<TransformSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }
  const updateSplits = (key: keyof TransformSettings['splits'], value: boolean) => {
    onSettingsChange({ ...settings, splits: { ...settings.splits, [key]: value } })
  }
  const isAdvanced = settings.mode === 'advanced'
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{t.settings}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
              <TooltipContent><p className="max-w-xs">{t.settingsTooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t.processingMode}</Label>
          <RadioGroup value={settings.mode} onValueChange={(value: 'normal' | 'advanced') => updateSettings({ mode: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="font-normal cursor-pointer">{t.normal}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced" className="font-normal cursor-pointer">{t.advancedMode}</Label>
            </div>
          </RadioGroup>

          <div className="pt-2 border-t mt-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="privateFunctions" checked={settings.showPrivateFunctions} onCheckedChange={(checked) => updateSettings({ showPrivateFunctions: !!checked })} />
                <Label htmlFor="privateFunctions" className="font-normal cursor-pointer">{t.privateFunctions}</Label>
             </div>
             {settings.showPrivateFunctions && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">{t.privateFunctionsDesc}</AlertDescription>
                </Alert>
             )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t.splitAt}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {Object.entries(settings.splits).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox id={key} checked={value} onCheckedChange={(checked) => updateSplits(key as keyof TransformSettings['splits'], !!checked)} />
                <Label htmlFor={key} className="font-normal cursor-pointer uppercase">{key}</Label>
              </div>
            ))}
          </div>
        </div>

        {isAdvanced && (
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">{t.moduleSettings}</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="maxModules" className="w-48">{t.maxModulesPerRow}</Label>
                <Input id="maxModules" type="number" min="0" className="w-20" value={settings.maxModulesPerRow} onChange={(e) => updateSettings({ maxModulesPerRow: parseInt(e.target.value) || 0 })} />
                <span className="text-sm text-gray-500">{t.noRowSplit}</span>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="maxParagraphs" className="w-48">{t.maxParagraphsPerModule}</Label>
                <Input id="maxParagraphs" type="number" min="0" className="w-20" value={settings.maxParagraphsPerModule} onChange={(e) => updateSettings({ maxParagraphsPerModule: parseInt(e.target.value) || 0 })} />
                <span className="text-sm text-gray-500">{t.noModuleSplit}</span>
              </div>
            </div>
          </div>
        )}

        {settings.showPrivateFunctions && (
          <>
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">{t.footnoteSettings}</Label>
              <div className="flex items-start space-x-2">
                <Checkbox id="footnotes" checked={settings.processFootnotes} onCheckedChange={(checked) => updateSettings({ processFootnotes: !!checked })} />
                <div className="space-y-1">
                  <Label htmlFor="footnotes" className="font-normal cursor-pointer">{t.footnoteLabel}</Label>
                  <p className="text-sm text-gray-500">{t.footnoteDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">{t.interviewMode}</Label>
              <div className="flex items-start space-x-2">
                <Checkbox id="interview" checked={settings.processInterviewLists} onCheckedChange={(checked) => updateSettings({ processInterviewLists: !!checked })} />
                <div className="space-y-1">
                  <Label htmlFor="interview" className="font-normal cursor-pointer">{t.interviewLabel}</Label>
                  <p className="text-sm text-gray-500">{t.interviewDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Extra</Label>
              <div className="flex items-start space-x-2">
                <Checkbox id="removeEmptySpans" checked={settings.removeEmptySpans} onCheckedChange={(checked) => updateSettings({ removeEmptySpans: !!checked })} />
                <div className="space-y-1">
                  <Label htmlFor="removeEmptySpans" className="font-normal cursor-pointer">{t.removeEmptySpansLabel}</Label>
                  <p className="text-sm text-gray-500">{t.removeEmptySpansDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="fixLinkIcons" checked={settings.fixLinkIcons} onCheckedChange={(checked) => updateSettings({ fixLinkIcons: !!checked })} />
                <div className="space-y-1">
                  <Label htmlFor="fixLinkIcons" className="font-normal cursor-pointer">{t.fixLinkIconsLabel}</Label>
                  <p className="text-sm text-gray-500">{t.fixLinkIconsDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="boldAuthorTerms" checked={settings.boldAuthorTerms} onCheckedChange={(checked) => updateSettings({ boldAuthorTerms: !!checked })} />
                <div className="space-y-1">
                  <Label htmlFor="boldAuthorTerms" className="font-normal cursor-pointer">{t.boldAuthorTermsLabel}</Label>
                  <p className="text-sm text-gray-500">{t.boldAuthorTermsDesc}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-3 border-t pt-4">
          <Label className="text-base font-semibold">{t.tagMerging}</Label>
          <div className="flex items-start space-x-2">
            <Checkbox id="tagMerging" checked={settings.processTagMerging} onCheckedChange={(checked) => updateSettings({ processTagMerging: !!checked })} />
            <div className="space-y-1">
              <Label htmlFor="tagMerging" className="font-normal cursor-pointer">{t.tagMergingLabel}</Label>
              <p className="text-sm text-gray-500">{t.tagMergingDesc}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
