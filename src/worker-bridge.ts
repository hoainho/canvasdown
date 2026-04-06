import { parseMarkdown } from './parser.js'
import { computeLayout } from './layout.js'
import { renderToCanvas } from './renderer.js'
import { darkTheme, lightTheme, type Theme } from './theme.js'
import type { RenderOptions } from './index.js'

export type WorkerMessage =
  | { type: 'render'; markdown: string; width: number; theme: 'dark' | 'light'; dpr: number }
  | { type: 'measure'; markdown: string; width: number; theme: 'dark' | 'light' }

export type WorkerResponse =
  | { type: 'rendered'; height: number; totalHeight: number }
  | { type: 'measured'; totalHeight: number; blockCount: number }
  | { type: 'error'; message: string }

export function handleWorkerMessage(
  msg: WorkerMessage,
  offscreen: OffscreenCanvas,
): WorkerResponse {
  try {
    const theme: Theme = msg.theme === 'light' ? lightTheme : darkTheme

    if (msg.type === 'render') {
      const tokens = parseMarkdown(msg.markdown, theme)
      const docLayout = computeLayout(tokens, msg.width, theme)

      offscreen.width = msg.width * msg.dpr
      offscreen.height = docLayout.totalHeight * msg.dpr

      const ctx = offscreen.getContext('2d') as unknown as CanvasRenderingContext2D
      if (!ctx) return { type: 'error', message: 'No 2D context' }

      ctx.scale(msg.dpr, msg.dpr)
      renderToCanvas(ctx, docLayout, theme)

      return { type: 'rendered', height: docLayout.totalHeight, totalHeight: docLayout.totalHeight }
    }

    if (msg.type === 'measure') {
      const tokens = parseMarkdown(msg.markdown, theme)
      const docLayout = computeLayout(tokens, msg.width, theme)
      return { type: 'measured', totalHeight: docLayout.totalHeight, blockCount: docLayout.blocks.length }
    }

    return { type: 'error', message: 'Unknown message type' }
  } catch (e) {
    return { type: 'error', message: e instanceof Error ? e.message : String(e) }
  }
}
