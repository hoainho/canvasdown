# canvasdown

> Markdown renderer for Canvas. No DOM. No reflow. Runs anywhere.

[![npm version](https://img.shields.io/npm/v/canvasdown?color=f97316&style=flat-square)](https://www.npmjs.com/package/canvasdown)
[![license](https://img.shields.io/npm/l/canvasdown?color=f97316&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![built on Pretext](https://img.shields.io/badge/built%20on-Pretext-orange?style=flat-square)](https://github.com/chenglou/pretext)

canvasdown renders Markdown directly to HTML Canvas — no DOM, no layout reflow, no browser rendering pipeline. Powered by [Pretext](https://github.com/chenglou/pretext), which measures text ~300,000x faster than `getBoundingClientRect`.

Works in **browser**, **Node.js**, **Web Workers**, and **WebGL** contexts.

---

## Why canvasdown?

| | react-markdown | Satori (Vercel) | **canvasdown** |
|---|---|---|---|
| Input | Markdown | JSX | **Markdown** |
| Output | DOM (HTML) | SVG | **Canvas / PNG** |
| DOM reflow | Every render | N/A | **Never** |
| Streaming (AI chat) | Slow | No | **Yes** |
| Node.js | SSR only | Yes | **Yes** |
| Web Worker | No | No | **Yes** |
| Per-char animation | No | No | **Yes** |
| Text along path | No | No | **Yes** |
| Virtual list heights | Estimate | No | **Exact** |
| OG image generation | html2canvas | Yes | **Yes** |

---

## Install

```bash
npm install canvasdown
```

---

## Quick Start

```typescript
import { render, darkTheme } from 'canvasdown'

const markdown = `
# Hello canvasdown

Render **Markdown** to Canvas with *no DOM reflow*.

- Zero DOM reads
- Runs in Node.js
- Streams token-by-token
`

const canvas = document.getElementById('output') as HTMLCanvasElement
render(markdown, canvas, { width: 800, theme: darkTheme })
```

---

## API Reference

### Core

#### `render(markdown, canvas, options?)`

Render markdown to a canvas element. Automatically sets canvas width/height and handles HiDPI.

```typescript
import { render } from 'canvasdown'

render(markdown, canvas, {
  width: 800,           // canvas width in px (default: 800)
  theme: 'dark',        // 'dark' | 'light' | Theme object
  devicePixelRatio: 2,  // HiDPI (default: window.devicePixelRatio)
})
```

#### `measure(markdown, options?)`

Measure layout **without rendering** — get exact height before touching the canvas. Essential for virtual lists.

```typescript
import { measure } from 'canvasdown'

const { totalHeight, blocks } = measure(markdown, { width: 680, theme: 'dark' })
console.log(`This markdown will be ${totalHeight}px tall`)
```

#### `exportPNG(markdown, options?)`

Export as PNG dataURL. Works in browser and Node.js (with `canvasFactory`).

```typescript
import { exportPNG } from 'canvasdown'

const dataURL = await exportPNG(markdown, {
  width: 1200,
  devicePixelRatio: 2,  // @2x = 2400px wide PNG
  theme: 'dark',
})
```

#### `exportBlob(markdown, options?)`

Export as `Blob` for upload or download.

```typescript
import { exportBlob } from 'canvasdown'

const blob = await exportBlob(markdown, { width: 1200 })
const formData = new FormData()
formData.append('image', blob, 'og-image.png')
```

---

### Streaming (for AI Chat)

Stream markdown token-by-token with zero reflow. Built for LLM streaming responses.

```typescript
import { createStream } from 'canvasdown/stream'

const canvas = document.getElementById('chat-canvas') as HTMLCanvasElement
const stream = createStream(canvas, { width: 680, theme: 'dark' })

// Connect to your LLM stream (OpenAI, Anthropic, etc.)
const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ prompt }) })
const reader = response.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  stream.append(decoder.decode(value))  // only re-paints changed lines
}

stream.flush()    // finalize
stream.destroy()  // cleanup on unmount
```

**Stream API:**

```typescript
type StreamHandle = {
  append(chunk: string): void        // add text, schedules rAF render
  flush(): void                      // immediate render, skip rAF
  getLayout(): DocumentLayout | null // current layout state
  destroy(): void                    // cancel pending rAF, cleanup
}
```

---

### Advanced Features

Import from `canvasdown/advanced`:

```typescript
import { shrinkwrap, fitText, createOverlay, renderTextOnPath, animateText, updateRender } from 'canvasdown/advanced'
```

#### `shrinkwrap(markdown, options?)` — Auto-fit container

Find the **tightest width** that fits the text without overflow (binary search).

```typescript
const { width, height } = shrinkwrap('Hello **world**', {
  minWidth: 100,
  maxWidth: 800,
  theme: 'dark',
})
// width = smallest px where text doesn't overflow
```

#### `fitText(markdown, options?)` — Shrink font to fit box

Find the **largest font size** where text fits within a container.

```typescript
const { fontSize, lineHeight, height } = fitText(markdown, {
  container: { width: 400, height: 200 },
  fontSizeMin: 10,
  fontSizeMax: 48,
  theme: 'dark',
})
// fontSize = largest size that still fits
```

#### `createOverlay(canvas, layout)` — Semantic highlight

Add highlight overlay **without re-rendering** the base canvas.

```typescript
const layout = measure(markdown, { width: 680, theme: 'dark' })
render(markdown, canvas, { width: 680, theme: 'dark' })

const overlay = createOverlay(canvas, layout)
overlay.highlight('pretext', { background: '#ffff00', opacity: 0.4 })
overlay.highlight('canvas', { background: '#00ffff', opacity: 0.3 })
overlay.clear()    // remove all highlights
overlay.destroy()  // remove overlay element
```

#### `renderTextOnPath(ctx, text, svgPath, options?)` — Text along curves

Render text following any SVG path — **not possible with DOM or SVG text**.

```typescript
renderTextOnPath(ctx, 'canvasdown ✦ canvas text along any curve', 'M 0 100 Q 200 0 400 100', {
  font: '700 20px Inter',
  color: '#f97316',
  offset: 10,  // start offset in px
})
```

Supports SVG path commands: `M`, `L`, `Q` (quadratic), `C` (cubic bezier).

#### `animateText(canvas, markdown, animOptions, renderOptions?)` — Per-character animation

Animate individual characters with independent transforms.

```typescript
const anim = animateText(canvas, markdown, {
  effect: 'wave',    // 'wave' | 'fadeIn' | 'typewriter' | 'bounce' | 'explode'
  stagger: 30,       // ms delay between characters
  duration: 600,     // ms per character animation
  loop: false,
  onComplete: () => console.log('done'),
})

anim.start()
anim.stop()
anim.reset()
```

#### `updateRender(prev, next, canvas, options?)` — Diff-aware re-render

Re-render only what changed. Efficient for live preview / collaborative editors.

```typescript
updateRender(oldMarkdown, newMarkdown, canvas, { width: 680, theme: 'dark' })
```

---

### Node.js Support

Inject a canvas factory to use canvasdown server-side:

```typescript
import { exportPNG } from 'canvasdown'
import { createCanvas } from '@napi-rs/canvas'

const png = await exportPNG(markdown, {
  width: 1200,
  devicePixelRatio: 2,
  theme: 'dark',
  canvasFactory: (w, h) => createCanvas(w, h),
})

// Save to file
import { writeFileSync } from 'fs'
const base64 = png.split(',')[1]!
writeFileSync('og-image.png', Buffer.from(base64, 'base64'))
```

```bash
npm install @napi-rs/canvas  # Rust-based, pre-built ARM64 binaries
```

---

### React Component

```typescript
import { createCanvasdownComponent } from 'canvasdown/react'
import React, { useState } from 'react'

const Canvasdown = createCanvasdownComponent(React)

function App() {
  const [height, setHeight] = useState(0)

  return (
    <div style={{ position: 'relative' }}>
      <Canvasdown
        markdown={content}
        width={680}
        theme="dark"
        className="chat-canvas"
        onHeightChange={setHeight}
        onRender={(layout) => console.log('blocks:', layout.blocks.length)}
      />
    </div>
  )
}
```

---

### Web Worker + OffscreenCanvas

Render off the main thread — keep UI at 60fps during heavy markdown rendering.

```typescript
// main.ts
const worker = new Worker(new URL('./canvasdown.worker.js', import.meta.url))
const offscreen = canvas.transferControlToOffscreen()

worker.postMessage({ type: 'render', markdown, width: 800, theme: 'dark', dpr: 2 }, [offscreen])
worker.onmessage = (e) => console.log('rendered:', e.data.height, 'px')
```

```typescript
// canvasdown.worker.js
import { handleWorkerMessage } from 'canvasdown/worker'

let offscreen: OffscreenCanvas

self.onmessage = (e) => {
  if (e.data.type === 'render') {
    if (!offscreen) offscreen = e.ports[0] ?? e.data.canvas
    const result = handleWorkerMessage(e.data, offscreen)
    self.postMessage(result)
  }
}
```

---

## Markdown Support

| Element | Syntax | Status |
|---|---|---|
| Heading H1–H6 | `# H1` … `###### H6` | ✅ |
| Paragraph | plain text | ✅ |
| Bold | `**text**` | ✅ |
| Italic | `*text*` | ✅ |
| Bold italic | `***text***` | ✅ |
| Inline code | `` `code` `` | ✅ |
| Link | `[text](url)` | ✅ underline + color |
| Strikethrough | `~~text~~` | ✅ |
| Code block | ` ```lang ` | ✅ |
| Blockquote | `> text` | ✅ |
| Unordered list | `- item` | ✅ |
| Ordered list | `1. item` | ✅ |
| Nested list | indented items | ✅ |
| Task list | `- [x] done` | ✅ checkbox rendering |
| Table | `\| col \|` | ✅ |
| Image | `![alt](url)` | ✅ placeholder on load |
| Horizontal rule | `---` | ✅ |
| CJK (Chinese/Japanese/Korean) | 春天到了 | ✅ via Pretext |
| Emoji | 🎉🚀 | ✅ |
| Arabic / RTL | بدأت الرحلة | 🔜 planned |
| Syntax highlight | ` ```ts ` | 🔜 planned |

---

## Themes

### Built-in themes

```typescript
import { darkTheme, lightTheme } from 'canvasdown'

render(markdown, canvas, { theme: 'dark' })   // #0d1117 background
render(markdown, canvas, { theme: 'light' })  // #ffffff background
```

### Custom theme

```typescript
import type { Theme } from 'canvasdown'

const myTheme: Theme = {
  background: '#1a1b26',
  text: '#c0caf5',
  mutedText: '#565f89',
  link: { color: '#7aa2f7' },
  heading: {
    color: '#c0caf5',
    sizes: [36, 28, 22, 18, 16, 14],
    weights: ['700', '600', '600', '600', '500', '500'],
    lineHeights: [48, 38, 32, 28, 26, 24],
  },
  code: {
    background: '#16161e',
    color: '#c0caf5',
    borderColor: '#292e42',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    lineHeight: 22,
    borderRadius: 6,
    padding: 16,
  },
  inlineCode: {
    background: '#1f2335',
    color: '#7aa2f7',
    fontFamily: '"JetBrains Mono", monospace',
    borderRadius: 4,
    paddingH: 5,
  },
  blockquote: { borderColor: '#292e42', textColor: '#565f89', borderWidth: 4, paddingLeft: 16 },
  table: {
    headerBackground: '#16161e',
    headerColor: '#c0caf5',
    borderColor: '#292e42',
    cellPadding: 12,
  },
  hr: { color: '#292e42' },
  list: { bulletColor: '#565f89', indentX: 20, bulletGap: 8, itemGap: 4 },
  image: { borderRadius: 6, maxHeight: 400 },
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 16,
  lineHeight: 28,
  padding: 48,
  blockGap: 20,
}

render(markdown, canvas, { theme: myTheme })
```

---

## Use Cases

### 1. AI Chat with Streaming

```typescript
// Stream LLM response to canvas — no DOM reflow on every token
import { createStream } from 'canvasdown/stream'

const stream = createStream(canvas, { width: 680, theme: 'dark' })
for await (const chunk of llmStream) {
  stream.append(chunk)
}
stream.flush()
```

### 2. OG Image Generator (Next.js API Route)

```typescript
// app/api/og/route.ts
import { exportPNG } from 'canvasdown'
import { createCanvas } from '@napi-rs/canvas'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Hello'

  const png = await exportPNG(`# ${title}\n\nGenerated with canvasdown`, {
    width: 1200,
    devicePixelRatio: 2,
    theme: 'dark',
    canvasFactory: (w, h) => createCanvas(w, h),
  })

  const buffer = Buffer.from(png.split(',')[1]!, 'base64')
  return new Response(buffer, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  })
}
```

### 3. Virtual List with Exact Heights

```typescript
import { measure } from 'canvasdown'

// Pre-compute exact heights for ALL messages (no DOM, ~0.001ms each)
const heights = messages.map(msg =>
  measure(msg.content, { width: 680, theme: 'dark' }).totalHeight
)

// Pass to virtual list — no estimates, no scroll jumps
<VirtualList itemCount={messages.length} itemHeight={i => heights[i]} ... />
```

### 4. Text Animation for Hero Sections

```typescript
import { animateText } from 'canvasdown/advanced'

const anim = animateText(canvas, '# Welcome to the future', {
  effect: 'wave',
  stagger: 40,
  duration: 800,
  loop: true,
}, { width: 800, theme: 'dark' })

anim.start()
```

---

## Development

```bash
git clone https://github.com/nhoxtvt/canvasdown
cd canvasdown
npm install
npm run build    # compile TypeScript → dist/
npm run typecheck  # type checking only
node serve.cjs   # serve demo at http://localhost:3847/demo/index.html
```

### Project Structure

```
src/
├── index.ts          # public API: render, measure, exportPNG, exportBlob
├── parser.ts         # markdown → RenderToken[] (via marked.js)
├── layout.ts         # Pretext measurement → DocumentLayout
├── renderer.ts       # DocumentLayout → Canvas 2D
├── theme.ts          # Theme type + darkTheme + lightTheme
├── tokens.ts         # TypeScript types for tokens
├── canvas-provider.ts # CanvasFactory abstraction (browser/Node/Worker)
├── stream.ts         # streaming render API
├── advanced.ts       # shrinkwrap, fitText, overlay, path text, animation
├── react.ts          # React component factory
└── worker-bridge.ts  # OffscreenCanvas + Web Worker bridge
demo/
└── index.html        # live playground
```

---

## Credits

canvasdown is built on top of [Pretext](https://github.com/chenglou/pretext) by Cheng Lou — a pure JS/TS library for multiline text measurement that avoids DOM reflow.

The original architecture concept comes from [text-layout](https://github.com/Automattic/text-layout) by Sebastian Markbage.

---

## License

MIT © 2026 canvasdown contributors
