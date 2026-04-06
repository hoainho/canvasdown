export type CanvasLike = {
  width: number
  height: number
  getContext(contextId: '2d'): CanvasRenderingContext2D | null
  toDataURL(type?: string, quality?: number): string
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void
}

export type CanvasFactory = (width: number, height: number) => CanvasLike

export function browserCanvasFactory(width: number, height: number): CanvasLike {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function getDefaultFactory(): CanvasFactory {
  if (typeof document !== 'undefined') return browserCanvasFactory
  throw new Error(
    'canvasdown: no canvas factory available. ' +
    'In Node.js, pass canvasFactory via options: ' +
    'import { createCanvas } from "@napi-rs/canvas"; ' +
    '{ canvasFactory: (w,h) => createCanvas(w,h) }'
  )
}
