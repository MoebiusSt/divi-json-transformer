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
  
  if (settings.mode === 'advanced') {
    return processMarkupAdvancedMode(markupString, settings, log)
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

function processMarkupAdvancedMode(markupString: string, settings: TransformSettings, log: LogFunction): string {
  // Use replace with callback to process modules in-place while having access to offset
  return markupString.replace(/\[et_pb_text[^\]]*\](?:(?!\[\/et_pb_text\]).)*\[\/et_pb_text\]/gs, (match, offset, string) => {
    const { content } = extractContentFromModule(match)
    if (!content) return match

    const tagMatch = match.match(/\[et_pb_text[^\]]*\]/)
    if (!tagMatch) return match
    const fullTag = tagMatch[0].slice(1, -1)

    const processedModules = processHTML(content, false, settings, log) as Array<{ html: string; paragraphCount: number }>

    if (processedModules.length === 0) return match

    // Convert to array of full module strings
    const chunks: string[] = []
    for (const moduleInfo of processedModules) {
        const moduleHTML = moduleInfo.html
        const adminLabel = createAdminLabel(moduleHTML)
        const cleanTag = fullTag.replace(/admin_label="[^"]*"/g, '')
        const moduleTag = cleanTag.trim() + ` admin_label="${adminLabel}"`
        chunks.push(`[${moduleTag}]${moduleHTML}[/et_pb_text]`)
    }

    // Check if Row Splitting is needed
    if (settings.maxModulesPerRow > 0 && chunks.length > settings.maxModulesPerRow) {
        // Search backwards from 'offset' for [et_pb_row ...] and [et_pb_column ...]
        const precedingText = string.substring(0, offset)
        
        // Find last Row (closest to the module)
        // We use a regex that matches the tag and ensures no other [et_pb_row starts after it
        const rowMatch = precedingText.match(/\[et_pb_row([^\]]*)\](?:(?!\[et_pb_row).)*$/s)
        let rowAttrs = rowMatch ? rowMatch[1] : ''
        
        // Find last Column
        const colMatch = precedingText.match(/\[et_pb_column([^\]]*)\](?:(?!\[et_pb_column).)*$/s)
        let colAttrs = colMatch ? colMatch[1] : ''

        // Clean attributes for re-use (remove admin_label to avoid duplicates/confusion if we wanted, 
        // but keeping them or modifying them might be better. 
        // Let's add a specialized label for the continuation rows)
        
        // Actually, for the new row, we probably want a generic label or "Fortsetzung"
        // But simply copying attributes is safer for layout preservation.
        // We will append a new admin_label to overwrite the old one if needed, or let the user handle it.
        // To be safe, let's update the admin_label for the new rows to indicate they are continuations.
        if (rowAttrs.includes('admin_label="')) {
           rowAttrs = rowAttrs.replace(/admin_label="([^"]*)"/, 'admin_label="$1 (Fortsetzung)"')
        } else {
           rowAttrs += ' admin_label="Fortsetzung"'
        }

        let result = ''
        
        for (let i = 0; i < chunks.length; i++) {
            // If we filled a row, close it and start a new one
            // BUT: The first chunk(s) stay in the current row/column.
            // So we only insert breaks AFTER the first set of modules.
            
            if (i > 0 && i % settings.maxModulesPerRow === 0) {
                 result += `[/et_pb_column][/et_pb_row][et_pb_row${rowAttrs}][et_pb_column${colAttrs}]`
            }
            result += chunks[i]
        }
        return result
    } else {
        // No row splitting needed, just replace the module with the split modules
        return chunks.join('')
    }
  })
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
    if (settings.mode === 'advanced') return [{ html, paragraphCount: countParagraphs(html) }]
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
      if (settings.mode === 'advanced') {
        newModules.push({ html: moduleHTML, paragraphCount })
      } else {
        newModules.push(moduleHTML)
      }
      currentModule = [element.outerHTML]
      paragraphCount = element.tagName.toLowerCase() === 'p' ? 1 : 0
    } else {
      currentModule.push(element.outerHTML)
      if (element.tagName.toLowerCase() === 'p') paragraphCount++
      if (settings.mode === 'advanced' && element.tagName.toLowerCase() === 'p' && settings.maxParagraphsPerModule > 0 && paragraphCount >= settings.maxParagraphsPerModule && currentModule.length > 0) {
        const moduleHTML = currentModule.join('')
        newModules.push({ html: moduleHTML, paragraphCount })
        currentModule = []
        paragraphCount = 0
      }
    }
  }
  if (currentModule.length > 0) {
    const moduleHTML = currentModule.join('')
    if (settings.mode === 'advanced') {
      newModules.push({ html: moduleHTML, paragraphCount })
    } else {
      newModules.push(moduleHTML)
    }
  }
  if (newModules.length === 0) {
    if (settings.mode === 'advanced') return [{ html, paragraphCount: 0 }]
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
