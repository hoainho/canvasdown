import { parseMarkdown } from './parser.js';
import { computeLayout } from './layout.js';
import { renderToCanvas } from './renderer.js';
import { darkTheme, lightTheme } from './theme.js';
export function createStream(canvas, options = {}) {
    const theme = resolveStreamTheme(options.theme);
    const dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    const width = options.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800);
    let buffer = '';
    let rafId = null;
    let lastLayout = null;
    let destroyed = false;
    function scheduleRender() {
        if (destroyed)
            return;
        if (rafId !== null)
            cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(doRender);
    }
    function doRender() {
        if (destroyed)
            return;
        rafId = null;
        const tokens = parseMarkdown(buffer, theme);
        const docLayout = computeLayout(tokens, width, theme);
        lastLayout = docLayout;
        canvas.width = width * dpr;
        canvas.height = docLayout.totalHeight * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${docLayout.totalHeight}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.scale(dpr, dpr);
        renderToCanvas(ctx, docLayout, theme);
    }
    return {
        append(chunk) {
            if (destroyed)
                return;
            buffer += chunk;
            scheduleRender();
        },
        flush() {
            if (destroyed)
                return;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            doRender();
        },
        getLayout() {
            return lastLayout;
        },
        destroy() {
            destroyed = true;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },
    };
}
function resolveStreamTheme(opt) {
    if (!opt || opt === 'dark')
        return darkTheme;
    if (opt === 'light')
        return lightTheme;
    return opt;
}
//# sourceMappingURL=stream.js.map