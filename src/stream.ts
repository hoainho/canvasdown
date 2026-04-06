import { parseMarkdown } from './parser.js'
import { computeLayout } from './layout.js'
import { renderToCanvas } from './renderer.js'
import { darkTheme, lightTheme, type Theme } from './theme.js'
import type { DocumentLayout } from './layout.js'
import type { RenderOptions } from './index.js'

export type StreamHandle = {
  append(chunk: string): void
  flush(): void
  getLayout(): DocumentLayout | null
  destroy(): void
}

export function createStream(
  canvas: HTMLCanvasElement,
  options: RenderOptions = {},
): StreamHandle {
  const theme = resolveStreamTheme(options.theme)
  const dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
  const width = options.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800)

  let buffer = ''
  let rafId: number | null = null
  let lastLayout: DocumentLayout | null = null
  let destroyed = false

  function scheduleRender(): void {
    if (destroyed) return
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(doRender)
  }

  function doRender(): void {
    if (destroyed) return
    rafId = null

    const tokens = parseMarkdown(buffer, theme)
    const docLayout = computeLayout(tokens, width, theme)
    lastLayout = docLayout

    canvas.width = width * dpr
    canvas.height = docLayout.totalHeight * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${docLayout.totalHeight}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    renderToCanvas(ctx, docLayout, theme)
  }

  return {
    append(chunk: string): void {
      if (destroyed) return
      buffer += chunk
      scheduleRender()
    },

    flush(): void {
      if (destroyed) return
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      doRender()
    },

    getLayout(): DocumentLayout | null {
      return lastLayout
    },

    destroy(): void {
      destroyed = true
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },
  }
}

function resolveStreamTheme(opt: RenderOptions['theme']): Theme {
  if (!opt || opt === 'dark') return darkTheme
  if (opt === 'light') return lightTheme
  return opt as Theme
}
