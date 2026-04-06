import { parseMarkdown } from './parser.js';
import { computeLayout } from './layout.js';
import { renderToCanvas } from './renderer.js';
import { darkTheme, lightTheme } from './theme.js';
import { getDefaultFactory } from './canvas-provider.js';
export { darkTheme, lightTheme } from './theme.js';
export { browserCanvasFactory } from './canvas-provider.js';
function resolveTheme(opt) {
    if (!opt || opt === 'dark')
        return darkTheme;
    if (opt === 'light')
        return lightTheme;
    return opt;
}
export function measure(markdown, options = {}) {
    const width = options.width ?? 800;
    const theme = resolveTheme(options.theme);
    const tokens = parseMarkdown(markdown, theme);
    return computeLayout(tokens, width, theme);
}
export function render(markdown, canvas, options = {}) {
    const dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    const width = options.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800);
    const theme = resolveTheme(options.theme);
    const tokens = parseMarkdown(markdown, theme);
    const docLayout = computeLayout(tokens, width, theme);
    canvas.width = width * dpr;
    canvas.height = docLayout.totalHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${docLayout.totalHeight}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('canvasdown: could not get 2D context from canvas');
    ctx.scale(dpr, dpr);
    renderToCanvas(ctx, docLayout, theme);
}
export async function exportPNG(markdown, options = {}) {
    const width = options.width ?? 800;
    const dpr = options.devicePixelRatio ?? 2;
    const theme = resolveTheme(options.theme);
    const factory = options.canvasFactory ?? getDefaultFactory();
    const tokens = parseMarkdown(markdown, theme);
    const docLayout = computeLayout(tokens, width, theme);
    const canvas = factory(width * dpr, docLayout.totalHeight * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('canvasdown: could not get 2D context from canvas');
    ctx.scale(dpr, dpr);
    renderToCanvas(ctx, docLayout, theme);
    return canvas.toDataURL('image/png');
}
export async function exportBlob(markdown, options = {}) {
    const width = options.width ?? 800;
    const dpr = options.devicePixelRatio ?? 2;
    const theme = resolveTheme(options.theme);
    const factory = options.canvasFactory ?? getDefaultFactory();
    const tokens = parseMarkdown(markdown, theme);
    const docLayout = computeLayout(tokens, width, theme);
    const canvas = factory(width * dpr, docLayout.totalHeight * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('canvasdown: could not get 2D context from canvas');
    ctx.scale(dpr, dpr);
    renderToCanvas(ctx, docLayout, theme);
    return new Promise((resolve, reject) => {
        if (typeof canvas.toBlob === 'function') {
            canvas.toBlob((blob) => {
                if (blob)
                    resolve(blob);
                else
                    reject(new Error('canvasdown: toBlob returned null'));
            }, 'image/png');
        }
        else {
            const dataURL = canvas.toDataURL('image/png');
            fetch(dataURL).then((r) => r.blob()).then(resolve).catch(reject);
        }
    });
}
export { createStream } from './stream.js';
export { shrinkwrap, fitText, createOverlay, renderTextOnPath, animateText, updateRender } from './advanced.js';
export { createCanvasdownComponent } from './react.js';
export { handleWorkerMessage } from './worker-bridge.js';
//# sourceMappingURL=index.js.map