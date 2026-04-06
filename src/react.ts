import { parseMarkdown } from './parser.js'
import { computeLayout } from './layout.js'
import { renderToCanvas } from './renderer.js'
import { darkTheme, lightTheme, type Theme } from './theme.js'
import type { RenderOptions } from './index.js'

export type CanvasdownProps = {
  markdown: string
  width?: number
  theme?: Theme | 'dark' | 'light'
  devicePixelRatio?: number
  className?: string
  style?: Record<string, string | number>
  onHeightChange?: (height: number) => void
  onRender?: (layout: ReturnType<typeof computeLayout>) => void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      canvas: {
        ref?: unknown
        width?: number
        height?: number
        style?: Record<string, string | number>
        className?: string
      }
    }
  }
}

export function createCanvasdownComponent(React: {
  useRef: <T>(init: T | null) => { current: T | null }
  useEffect: (fn: () => (() => void) | void, deps: unknown[]) => void
  createElement: (...args: unknown[]) => unknown
}) {
  function resolveTheme(opt: RenderOptions['theme']): Theme {
    if (!opt || opt === 'dark') return darkTheme
    if (opt === 'light') return lightTheme
    return opt as Theme
  }

  return function Canvasdown(props: CanvasdownProps) {
    const {
      markdown,
      width = 800,
      theme: themeProp,
      devicePixelRatio,
      className,
      style,
      onHeightChange,
      onRender,
    } = props

    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    React.useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const theme = resolveTheme(themeProp)
      const dpr = devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)

      const tokens = parseMarkdown(markdown, theme)
      const docLayout = computeLayout(tokens, width, theme)

      canvas.width = width * dpr
      canvas.height = docLayout.totalHeight * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${docLayout.totalHeight}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(dpr, dpr)
      renderToCanvas(ctx, docLayout, theme)

      onHeightChange?.(docLayout.totalHeight)
      onRender?.(docLayout)
    }, [markdown, width, themeProp, devicePixelRatio])

    return React.createElement('canvas', {
      ref: canvasRef,
      className,
      style,
    })
  }
}
