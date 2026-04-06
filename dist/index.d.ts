import { type Theme } from './theme.js';
import { type CanvasFactory } from './canvas-provider.js';
import type { DocumentLayout } from './layout.js';
export type { Theme } from './theme.js';
export type { RenderToken, InlineSpan, SpanStyle } from './tokens.js';
export type { DocumentLayout, LaidOutBlock } from './layout.js';
export type { CanvasFactory, CanvasLike } from './canvas-provider.js';
export { darkTheme, lightTheme } from './theme.js';
export { browserCanvasFactory } from './canvas-provider.js';
export type RenderOptions = {
    width?: number;
    theme?: Theme | 'dark' | 'light';
    devicePixelRatio?: number;
    canvasFactory?: CanvasFactory;
};
export declare function measure(markdown: string, options?: RenderOptions): DocumentLayout;
export declare function render(markdown: string, canvas: HTMLCanvasElement, options?: RenderOptions): void;
export declare function exportPNG(markdown: string, options?: RenderOptions): Promise<string>;
export declare function exportBlob(markdown: string, options?: RenderOptions): Promise<Blob>;
export { createStream } from './stream.js';
export type { StreamHandle } from './stream.js';
export { shrinkwrap, fitText, createOverlay, renderTextOnPath, animateText, updateRender } from './advanced.js';
export type { ShrinkwrapOptions, ShrinkwrapResult, FitTextOptions, FitTextResult, HighlightStyle, HighlightHandle, PathTextOptions, AnimationEffect, AnimationOptions, AnimationHandle } from './advanced.js';
export { createCanvasdownComponent } from './react.js';
export type { CanvasdownProps } from './react.js';
export { handleWorkerMessage } from './worker-bridge.js';
export type { WorkerMessage, WorkerResponse } from './worker-bridge.js';
//# sourceMappingURL=index.d.ts.map