import { parseMarkdown } from './parser.js'
import { computeLayout } from './layout.js'
import { renderToCanvas } from './renderer.js'
import { darkTheme, lightTheme, type Theme } from './theme.js'
import { browserCanvasFactory, getDefaultFactory, type CanvasFactory, type CanvasLike } from './canvas-provider.js'
import type { DocumentLayout } from './layout.js'

export type { Theme } from './theme.js'
export type { RenderToken, InlineSpan, SpanStyle } from './tokens.js'
export type { DocumentLayout, LaidOutBlock } from './layout.js'
export type { CanvasFactory, CanvasLike } from './canvas-provider.js'
export { darkTheme, lightTheme } from './theme.js'
export { browserCanvasFactory } from './canvas-provider.js'

export type RenderOptions = {
  width?: number
  theme?: Theme | 'dark' | 'light'
  devicePixelRatio?: number
  canvasFactory?: CanvasFactory
}

function resolveTheme(opt: RenderOptions['theme']): Theme {
  if (!opt || opt === 'dark') return darkTheme
  if (opt === 'light') return lightTheme
  return opt
}

export function measure(markdown: string, options: RenderOptions = {}): DocumentLayout {
  const width = options.width ?? 800
  const theme = resolveTheme(options.theme)
  const tokens = parseMarkdown(markdown, theme)
  return computeLayout(tokens, width, theme)
}

export function render(
  markdown: string,
  canvas: HTMLCanvasElement,
  options: RenderOptions = {},
): void {
  const dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
  const width = options.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800)
  const theme = resolveTheme(options.theme)

  const tokens = parseMarkdown(markdown, theme)
  const docLayout = computeLayout(tokens, width, theme)

  canvas.width = width * dpr
  canvas.height = docLayout.totalHeight * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${docLayout.totalHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvasdown: could not get 2D context from canvas')

  ctx.scale(dpr, dpr)
  renderToCanvas(ctx, docLayout, theme)
}

export async function exportPNG(
  markdown: string,
  options: RenderOptions = {},
): Promise<string> {
  const width = options.width ?? 800
  const dpr = options.devicePixelRatio ?? 2
  const theme = resolveTheme(options.theme)
  const factory = options.canvasFactory ?? getDefaultFactory()

  const tokens = parseMarkdown(markdown, theme)
  const docLayout = computeLayout(tokens, width, theme)

  const canvas = factory(width * dpr, docLayout.totalHeight * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvasdown: could not get 2D context from canvas')

  ctx.scale(dpr, dpr)
  renderToCanvas(ctx, docLayout, theme)

  return canvas.toDataURL('image/png')
}

export async function exportBlob(
  markdown: string,
  options: RenderOptions = {},
): Promise<Blob> {
  const width = options.width ?? 800
  const dpr = options.devicePixelRatio ?? 2
  const theme = resolveTheme(options.theme)
  const factory = options.canvasFactory ?? getDefaultFactory()

  const tokens = parseMarkdown(markdown, theme)
  const docLayout = computeLayout(tokens, width, theme)

  const canvas = factory(width * dpr, docLayout.totalHeight * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvasdown: could not get 2D context from canvas')

  ctx.scale(dpr, dpr)
  renderToCanvas(ctx, docLayout, theme)

  return new Promise<Blob>((resolve, reject) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('canvasdown: toBlob returned null'))
      }, 'image/png')
    } else {
      const dataURL = canvas.toDataURL('image/png')
      fetch(dataURL).then((r) => r.blob()).then(resolve).catch(reject)
    }
  })
}

export { createStream } from './stream.js'
export type { StreamHandle } from './stream.js'

export { shrinkwrap, fitText, createOverlay, renderTextOnPath, animateText, updateRender } from './advanced.js'
export type { ShrinkwrapOptions, ShrinkwrapResult, FitTextOptions, FitTextResult, HighlightStyle, HighlightHandle, PathTextOptions, AnimationEffect, AnimationOptions, AnimationHandle } from './advanced.js'

export { createCanvasdownComponent } from './react.js'
export type { CanvasdownProps } from './react.js'

export { handleWorkerMessage } from './worker-bridge.js'
export type { WorkerMessage, WorkerResponse } from './worker-bridge.js'
