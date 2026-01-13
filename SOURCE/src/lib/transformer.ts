import type { TransformSettings, LogFunction } from './types'

export function transformJSON(data: any, settings: TransformSettings, log: LogFunction): any {
  try {
    const result = { ...data }
    for (const key in result.data) {
      const markupString = result.data[key]
      try {
        const newMarkup = processMarkup(markupString, settings, log)
        result.data[key] = newMarkup
      } catch (error) {
        log(`Fehler beim Verarbeiten: ${error}`)
        throw error
      }
    }
    result.presets = {}
    result.global_colors = {}
    result.images = []
    result.thumbnails = []
    return result
  } catch (error) {
    log(`Fehler: ${error}`)
    throw error
  }
}

function processMarkup(markupString: string, settings: TransformSettings, log: LogFunction): string {
  const textModules = findTextModules(markupString)
  if (textModules.length === 0) return markupString
  
  if (settings.mode === 'advanced' || settings.mode === 'dev') {
    const rowMatch = markupString.match(/\[et_pb_row(.*?)\]/)
    const originalRowAttributes = rowMatch ? rowMatch[1] : ''
    const columnAttributes = extractColumnAttributes(markupString)
    return processMarkupAdvancedMode(markupString, textModules, originalRowAttributes, columnAttributes, settings, log)
  } else {
    return processMarkupNormalMode(markupString, textModules, settings, log)
  }
}

function processMarkupNormalMode(originalMarkup: string, textModules: string[], settings: TransformSettings, log: LogFunction): string {
  let newMarkup = originalMarkup
  for (const module of textModules) {
    const { content } = extractContentFromModule(module)
    if (!content) continue
    const newHtmls = processHTML(content, false, settings, log) as string[]
    const tagMatch = module.match(/\[et_pb_text[^\]]*\]/)
    if (!tagMatch) continue
    let fullTag = tagMatch[0].slice(1, -1)
    if (newHtmls.length === 1) {
      const adminLabel = createAdminLabel(newHtmls[0])
      fullTag = fullTag.replace(/admin_label="[^"]*"/g, '')
      fullTag = fullTag.trim() + ` admin_label="${adminLabel}"`
      const newModule = `[${fullTag}]${newHtmls[0]}[/et_pb_text]`
      newMarkup = newMarkup.replace(module, newModule)
    } else {
      let newModules = ''
      for (const htmlContent of newHtmls) {
        const adminLabel = createAdminLabel(htmlContent)
        const cleanTag = fullTag.replace(/admin_label="[^"]*"/g, '')
        const moduleTag = cleanTag.trim() + ` admin_label="${adminLabel}"`
        newModules += `[${moduleTag}]${htmlContent}[/et_pb_text]`
      }
      newMarkup = newMarkup.replace(module, newModules)
    }
  }
  return newMarkup
}

function processMarkupAdvancedMode(markupString: string, textModules: string[], originalRowAttributes: string, columnAttributes: string, settings: TransformSettings, log: LogFunction): string {
  const allProcessedModules: Array<{ html: string; paragraphCount: number }> = []
  for (const module of textModules) {
    const { content } = extractContentFromModule(module)
    if (!content) continue
    const tagMatch = module.match(/\[et_pb_text[^\]]*\]/)
    if (!tagMatch) continue
    let fullTag = tagMatch[0].slice(1, -1)
    const processedModules = processHTML(content, false, settings, log)
    for (const moduleInfo of processedModules) {
      const moduleHTML = typeof moduleInfo === 'string' ? moduleInfo : moduleInfo.html
      const paragraphCount = typeof moduleInfo === 'string' ? 0 : moduleInfo.paragraphCount
      const adminLabel = createAdminLabel(moduleHTML)
      const cleanTag = fullTag.replace(/admin_label="[^"]*"/g, '')
      const moduleTag = cleanTag.trim() + ` admin_label="${adminLabel}"`
      allProcessedModules.push({ html: `[${moduleTag}]${moduleHTML}[/et_pb_text]`, paragraphCount })
    }
  }
  const rows: string[] = []
  let currentRow: string[] = []
  let moduleCountInRow = 0
  let rowCount = 1
  for (const module of allProcessedModules) {
    currentRow.push(module.html)
    moduleCountInRow++
    if (settings.maxModulesPerRow > 0 && moduleCountInRow >= settings.maxModulesPerRow) {
      rows.push(wrapInRow(currentRow, rowCount, originalRowAttributes, columnAttributes))
      currentRow = []
      moduleCountInRow = 0
      rowCount++
    }
  }
  if (currentRow.length > 0) {
    rows.push(wrapInRow(currentRow, rowCount, originalRowAttributes, columnAttributes))
  }
  const rowPattern = /\[et_pb_row.*?\[\/et_pb_row\]/s
  const rowMatch = markupString.match(rowPattern)
  if (rowMatch) {
    let result = markupString.replace(rowMatch[0], rows.join(''))
    for (const module of textModules) {
      result = result.replace(module, '')
    }
    return result
  } else {
    return markupString + rows.join('')
  }
}

function processHTML(html: string, specialTransform: boolean, settings: TransformSettings, log: LogFunction): Array<string | { html: string; paragraphCount: number }> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body
  if (settings.processFootnotes) processFootnotes(body, log)
  if (settings.processInterviewLists || specialTransform) transformListsToBlockquotes(body, log)
  if (settings.fixLinkIcons) fixLinkIcons(body, log)
  if (settings.removeEmptySpans) removeEmptySpans(body, log)
  if (settings.processTagMerging) mergeFragmentedTags(body, log)
  let processedHTML = body.innerHTML
  const splitResults = splitTextAtSplits(processedHTML, settings, log)
  return splitResults
}

function splitTextAtSplits(html: string, settings: TransformSettings, _log: LogFunction): Array<string | { html: string; paragraphCount: number }> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body
  const splitTags: string[] = []
  if (settings.splits.h1) splitTags.push('h1')
  if (settings.splits.h2) splitTags.push('h2')
  if (settings.splits.h3) splitTags.push('h3')
  if (settings.splits.h4) splitTags.push('h4')
  if (settings.splits.h5) splitTags.push('h5')
  if (settings.splits.h6) splitTags.push('h6')
  if (settings.splits.blockquote) splitTags.push('blockquote')
  if (settings.splits.ol) splitTags.push('ol')
  if (settings.splits.ul) splitTags.push('ul')
  if (splitTags.length === 0) {
    if (settings.mode === 'advanced' || settings.mode === 'dev') return [{ html, paragraphCount: countParagraphs(html) }]
    return [html]
  }
  const allElements = Array.from(body.children)
  const splitPoints: Element[] = []
  for (const element of allElements) {
    if (splitTags.includes(element.tagName.toLowerCase())) splitPoints.push(element)
  }
  const newModules: Array<string | { html: string; paragraphCount: number }> = []
  let currentModule: string[] = []
  let paragraphCount = 0
  for (const element of allElements) {
    const shouldSplit = splitPoints.includes(element)
    if (shouldSplit && currentModule.length > 0) {
      const moduleHTML = currentModule.join('')
      if (settings.mode === 'advanced' || settings.mode === 'dev') {
        newModules.push({ html: moduleHTML, paragraphCount })
      } else {
        newModules.push(moduleHTML)
      }
      currentModule = [element.outerHTML]
      paragraphCount = element.tagName.toLowerCase() === 'p' ? 1 : 0
    } else {
      currentModule.push(element.outerHTML)
      if (element.tagName.toLowerCase() === 'p') paragraphCount++
      if ((settings.mode === 'advanced' || settings.mode === 'dev') && element.tagName.toLowerCase() === 'p' && settings.maxParagraphsPerModule > 0 && paragraphCount >= settings.maxParagraphsPerModule && currentModule.length > 0) {
        const moduleHTML = currentModule.join('')
        newModules.push({ html: moduleHTML, paragraphCount })
        currentModule = []
        paragraphCount = 0
      }
    }
  }
  if (currentModule.length > 0) {
    const moduleHTML = currentModule.join('')
    if (settings.mode === 'advanced' || settings.mode === 'dev') {
      newModules.push({ html: moduleHTML, paragraphCount })
    } else {
      newModules.push(moduleHTML)
    }
  }
  if (newModules.length === 0) {
    if (settings.mode === 'advanced' || settings.mode === 'dev') return [{ html, paragraphCount: 0 }]
    return [html]
  }
  return newModules
}

function processFootnotes(body: HTMLElement, _log: LogFunction): void {
  const footnoteLinks = Array.from(body.querySelectorAll('a.footnote, a.footnote-num'))
  let hasUnnumberedFootnotes = false
  const footnoteParagraphs = Array.from(body.querySelectorAll('p.footnote'))
  for (const p of footnoteParagraphs) {
    const spans = p.querySelectorAll('.footnotelist-num')
    if (spans.length > 0) {
      const firstSpanText = spans[0].textContent?.trim() || ''
      if (['•', '·', '○', '◦', '▪', '▫', '►'].includes(firstSpanText) || !/\d/.test(firstSpanText)) {
        hasUnnumberedFootnotes = true
        break
      }
    }
  }
  if (footnoteLinks.length > 0) {
    for (const link of footnoteLinks) {
      const text = link.textContent?.trim() || ''
      const digitString = text.replace(/\D/g, '')
      if (digitString && /^\d+$/.test(digitString)) {
        link.setAttribute('href', `#footnote-${digitString}`)
        link.setAttribute('id', `footnum-${digitString}`)
        link.innerHTML = ''
        const sup = document.createElement('sup')
        sup.className = 'footnote'
        sup.textContent = digitString
        link.appendChild(sup)
      }
    }
  }
  if (footnoteParagraphs.length > 1) {
    const listTag = document.createElement(hasUnnumberedFootnotes ? 'ul' : 'ol')
    listTag.className = 'footnotes'
    let footnoteIndex = 1
    for (const p of footnoteParagraphs) {
      if (hasUnnumberedFootnotes) {
        const numTags = Array.from(p.querySelectorAll('.footnotelist-num'))
        for (const tag of numTags) tag.remove()
        const li = document.createElement('li')
        li.id = `footnote-${footnoteIndex}`
        li.innerHTML = p.innerHTML
        listTag.appendChild(li)
        footnoteIndex++
      } else {
        let number: string | null = null
        const text = p.textContent?.trim() || ''
        const match = text.match(/^(\d+)[\).]?\s*/)
        if (match) number = match[1]
        if (number) {
          const li = document.createElement('li')
          li.id = `footnote-${number}`
          const a = document.createElement('a')
          a.href = `#footnum-${number}`
          let firstTextProcessed = false
          for (const node of Array.from(p.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE && !firstTextProcessed) {
              const textContent = node.textContent || ''
              const cleaned = textContent.replace(/^\d+[\).]?\s*/, '')
              if (cleaned.trim()) a.appendChild(document.createTextNode(cleaned))
              firstTextProcessed = true
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const elem = node as Element
              if (!elem.classList.contains('footnotelist-num') && !elem.classList.contains('Subformate_Fu-notenzahl')) {
                a.appendChild(elem.cloneNode(true))
              }
            } else {
              a.appendChild(node.cloneNode(true))
            }
          }
          li.appendChild(a)
          listTag.appendChild(li)
        }
      }
    }
    if (footnoteParagraphs[0].parentNode) {
      footnoteParagraphs[0].parentNode.replaceChild(listTag, footnoteParagraphs[0])
      for (let i = 1; i < footnoteParagraphs.length; i++) footnoteParagraphs[i].remove()
    }
  }
}

function transformListsToBlockquotes(body: HTMLElement, _log: LogFunction): void {
  const uls = Array.from(body.querySelectorAll('ul'))
  for (const ul of uls) {
    const lis = Array.from(ul.querySelectorAll('li'))
    for (const li of lis) {
      const blockquote = document.createElement('blockquote')
      const p = document.createElement('p')
      p.innerHTML = li.innerHTML
      blockquote.appendChild(p)
      if (li.parentNode) li.parentNode.replaceChild(blockquote, li)
    }
    if (ul.parentNode) {
      while (ul.firstChild) ul.parentNode.insertBefore(ul.firstChild, ul)
      ul.remove()
    }
  }
}

function removeEmptySpans(body: HTMLElement, _log: LogFunction): void {
  const spans = Array.from(body.querySelectorAll('span'))
  for (const span of spans) {
    if (span.attributes.length === 0) {
      // Replace with its children
      while (span.firstChild) {
        span.parentNode?.insertBefore(span.firstChild, span)
      }
      span.remove()
    }
  }
}

function fixLinkIcons(body: HTMLElement, _log: LogFunction): void {
  const links = Array.from(body.querySelectorAll('a'))
  for (const link of links) {
    const prev = link.previousSibling
    if (prev && prev.nodeType === Node.ELEMENT_NODE && (prev as Element).tagName.toLowerCase() === 'span') {
      const span = prev as HTMLElement
      const text = span.textContent || ''
      // Check for specific arrow icon \uf0da () or other common arrows, plus optional spaces/nbsp
      if (/^[\s\u00a0]*[\uf0da\uf105\u203a][\s\u00a0]*$/.test(text)) {
        link.classList.add('link-icon')
        span.remove()
      }
    }
  }
}

function mergeFragmentedTags(body: HTMLElement, _log: LogFunction): void {
  const tagNames = ['em', 'span']
  // Find all potential containers by looking at parents of target tags
  const tags = Array.from(body.querySelectorAll(tagNames.join(', ')))
  const containers = new Set<Element>()
  tags.forEach(tag => {
    if (tag.parentElement) containers.add(tag.parentElement)
  })

  for (const container of containers) {
    for (const tagName of tagNames) {
      const tags = Array.from(container.querySelectorAll(`:scope > ${tagName}`))
      if (tags.length === 0) continue
      const groups: Element[][] = []
      let currentGroup: Element[] = []
      for (const tag of tags) {
        if (currentGroup.length === 0) {
          currentGroup.push(tag)
        } else {
          const lastTag = currentGroup[currentGroup.length - 1]
          const lastClass = lastTag.className
          const currentClass = tag.className
          
          // Check adjacency
          const isAdjacent = lastTag.nextSibling === tag
          const isSeparatedByEmptyText = lastTag.nextSibling?.nodeType === Node.TEXT_NODE && 
                                       (lastTag.nextSibling.textContent || '').trim() === '' && 
                                       lastTag.nextSibling.nextSibling === tag
          
          if (lastClass === currentClass && (isAdjacent || isSeparatedByEmptyText)) {
            currentGroup.push(tag)
          } else {
            if (currentGroup.length > 1) groups.push([...currentGroup])
            currentGroup = [tag]
          }
        }
      }
      if (currentGroup.length > 1) groups.push(currentGroup)
      for (const group of groups) {
        if (group.length <= 1) continue
        const first = group[0]
        let mergedContent = ''
        for (let i = 0; i < group.length; i++) {
          const tag = group[i]
          mergedContent += tag.innerHTML
          // Add whitespace if it existed between tags
          if (i < group.length - 1 && tag.nextSibling?.nodeType === Node.TEXT_NODE) {
            const whitespace = tag.nextSibling.textContent || ''
            if (whitespace.trim() === '') mergedContent += whitespace
          }
        }
        first.innerHTML = mergedContent
        for (let i = 1; i < group.length; i++) {
          const tag = group[i]
          // Remove empty text nodes between merged tags
          if (tag.previousSibling?.nodeType === Node.TEXT_NODE) {
            const text = tag.previousSibling.textContent || ''
            if (text.trim() === '') tag.previousSibling.remove()
          }
          tag.remove()
        }
      }
    }
  }
}

function findTextModules(markupString: string): string[] {
  const pattern = /\[et_pb_text[^\]]*\](?:(?!\[\/et_pb_text\]).)*\[\/et_pb_text\]/gs
  const matches = markupString.match(pattern)
  return matches || []
}

function extractContentFromModule(module: string): { content: string; attributes: string } {
  const startTagEnd = module.indexOf(']')
  const endTagStart = module.lastIndexOf('[/et_pb_text]')
  if (startTagEnd === -1 || endTagStart === -1 || startTagEnd >= endTagStart) {
    return { content: '', attributes: '' }
  }
  const content = module.substring(startTagEnd + 1, endTagStart)
  const attributesMatch = module.match(/\[et_pb_text(.*?)content_desktop/s)
  const attributes = attributesMatch ? attributesMatch[1] : ' '
  return { content, attributes }
}

function extractColumnAttributes(markupString: string): string {
  const match = markupString.match(/\[et_pb_column(.*?)\]/)
  return match ? match[1] : ''
}

function wrapInRow(modules: string[], rowNumber: number, originalRowAttributes: string, columnAttributes: string): string {
  let attributes = ` admin_label="Zeile ${rowNumber}"`
  if (originalRowAttributes && originalRowAttributes.trim()) {
    let cleaned = originalRowAttributes.replace(/admin_label="[^"]*"/g, '').trim()
    cleaned = sanitizeAttributes(cleaned)
    if (cleaned) attributes += ` ${cleaned}`
  }
  let row = `[et_pb_row${attributes}]`
  if (columnAttributes && columnAttributes.trim()) {
    const sanitized = sanitizeAttributes(columnAttributes)
    row += `[et_pb_column${sanitized}]`
  } else {
    row += '[et_pb_column type="4_4" parallax="off" parallax_method="on"]'
  }
  row += modules.join('')
  row += '[/et_pb_column][/et_pb_row]'
  return row
}

function sanitizeAttributes(attributes: string): string {
  let sanitized = attributes.replace(/="([^"]*)\[(.*?)\]([^"]*)"/g, '="$1($2)$3"')
  sanitized = sanitized.replace(/="([^"]*)\"([^"]*)"/g, "=\"$1'$2\"")
  return sanitized
}

function countParagraphs(html: string): number {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.querySelectorAll('p').length
}

function createAdminLabel(htmlContent: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const body = doc.body
    const firstElement = body.firstElementChild
    if (!firstElement) return 'Text-Modul'
    const tagName = firstElement.tagName.toLowerCase()
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)
    const isBlockquote = tagName === 'blockquote'
    const isList = ['ol', 'ul'].includes(tagName)
    let text = firstElement.textContent?.trim() || ''
    text = sanitizeTextForDivi(text)
    if (text.length > 40) text = text.substring(0, 37) + '...'
    if (isHeading) return `HEAD - ${text}`
    else if (isBlockquote) return `ZITAT - ${text}`
    else if (isList) return `LISTE - ${text}`
    else return text
  } catch (error) {
    return 'Text-Modul'
  }
}

function sanitizeTextForDivi(text: string): string {
  text = text.replace(/\[/g, '(').replace(/\]/g, ')')
  text = text.replace(/"/g, "'")
  return text
}
