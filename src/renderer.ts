import type { Theme } from './theme.js'
import { headingFont, bodyFont, codeBlockFont } from './theme.js'
import type { DocumentLayout, LaidOutBlock, LaidOutRichLine, LaidOutListItem, LaidOutListBlock } from './layout.js'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function renderRichLines(
  ctx: CanvasRenderingContext2D,
  richLines: LaidOutRichLine[],
  originX: number,
  originY: number,
  theme: Theme,
  defaultColor: string,
): void {
  for (let i = 0; i < richLines.length; i++) {
    const line = richLines[i]!
    const baselineY = originY + i * theme.lineHeight + theme.lineHeight * 0.78

    for (const frag of line.fragments) {
      if (!frag.text.trim()) continue

      const fragX = originX + frag.x
      ctx.font = frag.font
      const color = frag.style?.color ?? defaultColor

      if (frag.style?.background) {
        const pad = frag.style.backgroundRadius !== undefined ? 5 : 0
        const boxH = theme.fontSize * 1.4
        const boxY = baselineY - theme.fontSize * 0.9
        ctx.fillStyle = frag.style.background
        roundRect(ctx, fragX - pad, boxY, frag.width + pad * 2, boxH, frag.style.backgroundRadius ?? 0)
        ctx.fill()
      }

      ctx.fillStyle = color
      ctx.fillText(frag.text, fragX, baselineY)

      if (frag.style?.underline) {
        const underlineY = baselineY + 2
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(fragX, underlineY)
        ctx.lineTo(fragX + frag.width, underlineY)
        ctx.stroke()
      }

      if (frag.style?.strikethrough) {
        const strikeY = baselineY - theme.fontSize * 0.28
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(fragX, strikeY)
        ctx.lineTo(fragX + frag.width, strikeY)
        ctx.stroke()
      }
    }
  }
}

function renderHeading(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'heading' }>,
  theme: Theme,
): void {
  renderRichLines(ctx, block.richLines, theme.padding, block.y, theme, theme.heading.color)
}

function renderParagraph(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'paragraph' }>,
  theme: Theme,
): void {
  renderRichLines(ctx, block.richLines, theme.padding, block.y, theme, theme.text)
}

function renderCodeBlock(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'code_block' }>,
  theme: Theme,
  canvasWidth: number,
): void {
  const x = theme.padding
  const w = canvasWidth - theme.padding * 2

  ctx.fillStyle = theme.code.background
  roundRect(ctx, x, block.y, w, block.height, theme.code.borderRadius)
  ctx.fill()

  ctx.strokeStyle = theme.code.borderColor
  ctx.lineWidth = 1
  roundRect(ctx, x, block.y, w, block.height, theme.code.borderRadius)
  ctx.stroke()

  ctx.font = codeBlockFont(theme)
  ctx.fillStyle = theme.code.color

  for (let i = 0; i < block.codeLines.length; i++) {
    const codeLine = block.codeLines[i] ?? ''
    const lineY = block.y + theme.code.padding + i * block.lineHeight + block.lineHeight * 0.78
    ctx.fillText(codeLine, x + theme.code.padding, lineY)
  }
}

function renderBlockquote(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'blockquote' }>,
  theme: Theme,
): void {
  const x = theme.padding
  ctx.fillStyle = theme.blockquote.borderColor
  ctx.fillRect(x, block.y, theme.blockquote.borderWidth, block.height)

  const textX = x + theme.blockquote.borderWidth + theme.blockquote.paddingLeft
  renderRichLines(ctx, block.richLines, textX, block.y, theme, theme.blockquote.textColor)
}

function renderListItems(
  ctx: CanvasRenderingContext2D,
  items: LaidOutListItem[],
  ordered: boolean,
  start: number,
  originX: number,
  originY: number,
  theme: Theme,
): void {
  const bulletX = originX + 4
  const textX = originX + theme.list.indentX + theme.list.bulletGap
  let itemY = originY

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!
    const baselineY = itemY + theme.lineHeight * 0.78

    ctx.fillStyle = theme.list.bulletColor
    ctx.font = bodyFont(theme)

    if (item.checked !== undefined) {
      const boxSize = 12
      const boxY = itemY + (theme.lineHeight - boxSize) / 2
      ctx.strokeStyle = theme.list.bulletColor
      ctx.lineWidth = 1.5
      ctx.strokeRect(bulletX, boxY, boxSize, boxSize)
      if (item.checked) {
        ctx.strokeStyle = theme.link.color
        ctx.beginPath()
        ctx.moveTo(bulletX + 2, boxY + boxSize / 2)
        ctx.lineTo(bulletX + boxSize / 2 - 1, boxY + boxSize - 3)
        ctx.lineTo(bulletX + boxSize - 2, boxY + 2)
        ctx.stroke()
      }
    } else if (ordered) {
      ctx.fillText(`${start + i}.`, bulletX, baselineY)
    } else {
      ctx.beginPath()
      ctx.arc(bulletX + 3, itemY + theme.lineHeight * 0.44, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    renderRichLines(ctx, item.richLines, textX, itemY, theme, theme.text)
    itemY += Math.max(item.richLines.length * theme.lineHeight, theme.lineHeight)

    if (item.children) {
      renderListItems(ctx, item.children.items, item.children.ordered, item.children.start, textX, itemY, theme)
      itemY += item.children.height
    }

    if (i < items.length - 1) itemY += theme.list.itemGap
  }
}

function renderList(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'list' }>,
  theme: Theme,
): void {
  renderListItems(ctx, block.items, block.ordered, block.start, theme.padding, block.y, theme)
}

function renderTable(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'table' }>,
  theme: Theme,
): void {
  const { laidOut } = block
  const startX = theme.padding
  let currentY = block.y
  const pad = theme.table.cellPadding
  const totalWidth = laidOut.colWidths.reduce((a, b) => a + b, 0) + (laidOut.colWidths.length + 1)

  ctx.fillStyle = theme.table.headerBackground
  ctx.fillRect(startX, currentY, totalWidth, laidOut.headerHeight)

  let colX = startX + 1
  for (let c = 0; c < laidOut.headers.length; c++) {
    const cellLines = laidOut.headers[c]!
    const colW = laidOut.colWidths[c]!
    renderRichLines(ctx, cellLines, colX + pad, currentY + pad, theme, theme.table.headerColor)
    colX += colW + 1
  }

  ctx.strokeStyle = theme.table.borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(startX, currentY, totalWidth, laidOut.headerHeight)

  currentY += laidOut.headerHeight

  for (let r = 0; r < laidOut.rows.length; r++) {
    const rowH = laidOut.rowHeights[r]!
    const useAlt = r % 2 === 1 && laidOut.rows.length > 1
    if (useAlt && theme.table.alternateRowBackground) {
      ctx.fillStyle = theme.table.alternateRowBackground
      ctx.fillRect(startX, currentY, totalWidth, rowH)
    }

    colX = startX + 1
    for (let c = 0; c < laidOut.rows[r]!.length; c++) {
      const cellLines = laidOut.rows[r]![c]!
      const colW = laidOut.colWidths[c]!
      renderRichLines(ctx, cellLines, colX + pad, currentY + pad, theme, theme.text)
      colX += colW + 1
    }

    ctx.strokeStyle = theme.table.borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(startX, currentY, totalWidth, rowH)
    currentY += rowH
  }
}

function renderImage(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'image' }>,
  theme: Theme,
  imageCache: Map<string, HTMLImageElement>,
): void {
  const img = imageCache.get(block.src)
  if (img && img.complete && img.naturalWidth > 0) {
    const aspectRatio = img.naturalWidth / img.naturalHeight
    const drawHeight = Math.min(block.height, block.width / aspectRatio)
    const drawWidth = drawHeight * aspectRatio

    ctx.save()
    roundRect(ctx, theme.padding, block.y, drawWidth, drawHeight, theme.image.borderRadius)
    ctx.clip()
    ctx.drawImage(img, theme.padding, block.y, drawWidth, drawHeight)
    ctx.restore()
  } else {
    ctx.fillStyle = theme.code.background
    roundRect(ctx, theme.padding, block.y, block.width, block.height, theme.image.borderRadius)
    ctx.fill()
    ctx.font = bodyFont(theme)
    ctx.fillStyle = theme.mutedText
    ctx.fillText(block.alt || 'Image', theme.padding + 12, block.y + block.height / 2)
  }
}

function renderHr(
  ctx: CanvasRenderingContext2D,
  block: Extract<LaidOutBlock, { type: 'hr' }>,
  theme: Theme,
  canvasWidth: number,
): void {
  const midY = block.y + block.height / 2
  ctx.strokeStyle = theme.hr.color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(theme.padding, midY)
  ctx.lineTo(canvasWidth - theme.padding, midY)
  ctx.stroke()
}

export function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  docLayout: DocumentLayout,
  theme: Theme,
  imageCache: Map<string, HTMLImageElement> = new Map(),
): void {
  const { blocks, totalHeight, canvasWidth } = docLayout

  ctx.clearRect(0, 0, canvasWidth, totalHeight)
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, canvasWidth, totalHeight)
  ctx.textBaseline = 'alphabetic'

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':    renderHeading(ctx, block, theme); break
      case 'paragraph':  renderParagraph(ctx, block, theme); break
      case 'code_block': renderCodeBlock(ctx, block, theme, canvasWidth); break
      case 'blockquote': renderBlockquote(ctx, block, theme); break
      case 'list':       renderList(ctx, block, theme); break
      case 'table':      renderTable(ctx, block, theme); break
      case 'image':      renderImage(ctx, block, theme, imageCache); break
      case 'hr':         renderHr(ctx, block, theme, canvasWidth); break
      case 'space':      break
    }
  }
}
