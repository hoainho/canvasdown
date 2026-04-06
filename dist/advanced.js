import { parseMarkdown } from './parser.js';
import { computeLayout } from './layout.js';
import { renderToCanvas } from './renderer.js';
import { darkTheme, lightTheme, bodyFont } from './theme.js';
function resolveTheme(opt) {
    if (!opt || opt === 'dark')
        return darkTheme;
    if (opt === 'light')
        return lightTheme;
    return opt;
}
export function shrinkwrap(markdown, options = {}) {
    const theme = resolveTheme(options.theme);
    const minW = options.minWidth ?? 100;
    const maxW = options.maxWidth ?? 1200;
    const padding = options.padding ?? theme.padding;
    let lo = minW;
    let hi = maxW;
    let bestWidth = maxW;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const tokens = parseMarkdown(markdown, theme);
        const layout = computeLayout(tokens, mid, { ...theme, padding });
        const lineCount = layout.blocks.reduce((acc, b) => {
            if (b.type === 'paragraph' || b.type === 'heading') {
                return acc + ('richLines' in b ? b.richLines.length : 0);
            }
            return acc;
        }, 0);
        if (lineCount > 0) {
            bestWidth = mid;
            hi = mid - 1;
        }
        else {
            lo = mid + 1;
        }
    }
    const tokens = parseMarkdown(markdown, theme);
    const layout = computeLayout(tokens, bestWidth, { ...theme, padding });
    return { width: bestWidth, height: layout.totalHeight };
}
export function fitText(markdown, options) {
    const baseTheme = resolveTheme(options.theme);
    const minSize = options.fontSizeMin ?? 8;
    const maxSize = options.fontSizeMax ?? 72;
    const { width, height: maxHeight } = options.container;
    let lo = minSize;
    let hi = maxSize;
    let bestSize = minSize;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const scaledTheme = {
            ...baseTheme,
            fontSize: mid,
            lineHeight: Math.round(mid * 1.6),
        };
        const tokens = parseMarkdown(markdown, scaledTheme);
        const layout = computeLayout(tokens, width, scaledTheme);
        if (layout.totalHeight <= maxHeight) {
            bestSize = mid;
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    const scaledTheme = {
        ...baseTheme,
        fontSize: bestSize,
        lineHeight: Math.round(bestSize * 1.6),
    };
    const tokens = parseMarkdown(markdown, scaledTheme);
    const layout = computeLayout(tokens, width, scaledTheme);
    return { fontSize: bestSize, lineHeight: Math.round(bestSize * 1.6), height: layout.totalHeight };
}
export function createOverlay(canvas, layout, theme) {
    const resolvedTheme = resolveTheme(theme);
    let overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.top = canvas.style.top || '0';
    overlayCanvas.style.left = canvas.style.left || '0';
    overlayCanvas.style.width = canvas.style.width;
    overlayCanvas.style.height = canvas.style.height;
    overlayCanvas.style.pointerEvents = 'none';
    canvas.parentElement?.insertBefore(overlayCanvas, canvas.nextSibling);
    const highlights = [];
    function repaint() {
        if (!overlayCanvas)
            return;
        const ctx = overlayCanvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        const dpr = window.devicePixelRatio ?? 1;
        for (const { query, style } of highlights) {
            if (!query)
                continue;
            const lowerQuery = query.toLowerCase();
            for (const block of layout.blocks) {
                if (block.type !== 'paragraph' && block.type !== 'heading' && block.type !== 'blockquote')
                    continue;
                const richLines = 'richLines' in block ? block.richLines : [];
                for (let li = 0; li < richLines.length; li++) {
                    const line = richLines[li];
                    const lineY = block.y + li * resolvedTheme.lineHeight;
                    let accumulated = '';
                    for (const frag of line.fragments) {
                        const lower = frag.text.toLowerCase();
                        const idx = lower.indexOf(lowerQuery);
                        if (idx >= 0) {
                            const fragX = resolvedTheme.padding + frag.x;
                            const highlightH = resolvedTheme.lineHeight * 0.85;
                            const highlightY = lineY + resolvedTheme.lineHeight * 0.1;
                            ctx.save();
                            ctx.globalAlpha = style.opacity ?? 0.35;
                            ctx.fillStyle = style.background ?? '#ffff00';
                            ctx.fillRect(fragX * dpr, highlightY * dpr, frag.width * dpr, highlightH * dpr);
                            ctx.restore();
                        }
                        accumulated += frag.text;
                    }
                }
            }
        }
    }
    return {
        highlight(query, style) {
            highlights.push({ query, style });
            repaint();
        },
        clear() {
            highlights.length = 0;
            repaint();
        },
        destroy() {
            overlayCanvas?.parentElement?.removeChild(overlayCanvas);
            overlayCanvas = null;
        },
    };
}
export function renderTextOnPath(ctx, text, svgPath, options = {}) {
    const theme = resolveTheme(options.theme);
    const font = options.font ?? bodyFont(theme);
    const color = options.color ?? theme.text;
    const offset = options.offset ?? 0;
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    const points = parseSvgPath(svgPath);
    const totalLength = pathLength(points);
    let dist = offset;
    for (const char of text) {
        const charWidth = ctx.measureText(char).width;
        if (dist > totalLength)
            break;
        const pos = pointAtDistance(points, dist + charWidth / 2);
        if (!pos)
            break;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);
        ctx.fillText(char, -charWidth / 2, 0);
        ctx.restore();
        dist += charWidth;
    }
    ctx.restore();
}
function parseSvgPath(d) {
    const points = [];
    const parts = d.trim().split(/\s+|,/);
    let i = 0;
    let cx = 0;
    let cy = 0;
    const STEPS = 20;
    while (i < parts.length) {
        const cmd = parts[i++];
        if (!cmd)
            continue;
        switch (cmd.toUpperCase()) {
            case 'M': {
                cx = parseFloat(parts[i++] ?? '0');
                cy = parseFloat(parts[i++] ?? '0');
                points.push({ x: cx, y: cy });
                break;
            }
            case 'L': {
                const x = parseFloat(parts[i++] ?? '0');
                const y = parseFloat(parts[i++] ?? '0');
                points.push({ x, y });
                cx = x;
                cy = y;
                break;
            }
            case 'Q': {
                const cpx = parseFloat(parts[i++] ?? '0');
                const cpy = parseFloat(parts[i++] ?? '0');
                const ex = parseFloat(parts[i++] ?? '0');
                const ey = parseFloat(parts[i++] ?? '0');
                for (let t = 1; t <= STEPS; t++) {
                    const tt = t / STEPS;
                    const mt = 1 - tt;
                    points.push({
                        x: mt * mt * cx + 2 * mt * tt * cpx + tt * tt * ex,
                        y: mt * mt * cy + 2 * mt * tt * cpy + tt * tt * ey,
                    });
                }
                cx = ex;
                cy = ey;
                break;
            }
            case 'C': {
                const cp1x = parseFloat(parts[i++] ?? '0');
                const cp1y = parseFloat(parts[i++] ?? '0');
                const cp2x = parseFloat(parts[i++] ?? '0');
                const cp2y = parseFloat(parts[i++] ?? '0');
                const ex = parseFloat(parts[i++] ?? '0');
                const ey = parseFloat(parts[i++] ?? '0');
                for (let t = 1; t <= STEPS; t++) {
                    const tt = t / STEPS;
                    const mt = 1 - tt;
                    points.push({
                        x: mt ** 3 * cx + 3 * mt ** 2 * tt * cp1x + 3 * mt * tt ** 2 * cp2x + tt ** 3 * ex,
                        y: mt ** 3 * cy + 3 * mt ** 2 * tt * cp1y + 3 * mt * tt ** 2 * cp2y + tt ** 3 * ey,
                    });
                }
                cx = ex;
                cy = ey;
                break;
            }
        }
    }
    return points;
}
function pathLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = (points[i].x) - (points[i - 1].x);
        const dy = (points[i].y) - (points[i - 1].y);
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
}
function pointAtDistance(points, d) {
    let accumulated = 0;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        if (accumulated + segLen >= d) {
            const t = (d - accumulated) / segLen;
            return {
                x: prev.x + dx * t,
                y: prev.y + dy * t,
                angle: Math.atan2(dy, dx),
            };
        }
        accumulated += segLen;
    }
    return null;
}
export function animateText(canvas, markdown, animOptions, renderOptions = {}) {
    const theme = resolveTheme(renderOptions.theme);
    const dpr = renderOptions.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    const width = renderOptions.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800);
    const stagger = animOptions.stagger ?? 30;
    const duration = animOptions.duration ?? 600;
    const effect = animOptions.effect;
    const tokens = parseMarkdown(markdown, theme);
    const docLayout = computeLayout(tokens, width, theme);
    let rafId = null;
    let startTime = null;
    let running = false;
    function collectChars() {
        const chars = [];
        let globalIndex = 0;
        for (const block of docLayout.blocks) {
            if (block.type !== 'paragraph' && block.type !== 'heading')
                continue;
            const richLines = 'richLines' in block ? block.richLines : [];
            for (let li = 0; li < richLines.length; li++) {
                const line = richLines[li];
                const lineY = block.y + li * theme.lineHeight + theme.lineHeight * 0.78;
                for (const frag of line.fragments) {
                    for (const char of frag.text) {
                        chars.push({
                            x: theme.padding + frag.x,
                            y: lineY,
                            char,
                            font: frag.font,
                            color: frag.style?.color ?? theme.text,
                            index: globalIndex++,
                        });
                    }
                }
            }
        }
        return chars;
    }
    const chars = collectChars();
    function drawFrame(elapsed) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = width * dpr;
        canvas.height = docLayout.totalHeight * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${docLayout.totalHeight}px`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
        ctx.textBaseline = 'alphabetic';
        for (const ch of chars) {
            const charStart = ch.index * stagger;
            const charElapsed = Math.max(0, elapsed - charStart);
            const t = Math.min(1, charElapsed / duration);
            ctx.save();
            ctx.font = ch.font;
            switch (effect) {
                case 'wave': {
                    const wave = Math.sin((elapsed / 200) + ch.index * 0.3) * 4 * (1 - Math.max(0, 1 - t * 2));
                    ctx.globalAlpha = t;
                    ctx.fillStyle = ch.color;
                    ctx.fillText(ch.char, ch.x, ch.y + wave);
                    break;
                }
                case 'fadeIn': {
                    ctx.globalAlpha = t;
                    ctx.fillStyle = ch.color;
                    ctx.fillText(ch.char, ch.x, ch.y);
                    break;
                }
                case 'typewriter': {
                    if (t > 0) {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = ch.color;
                        ctx.fillText(ch.char, ch.x, ch.y);
                    }
                    break;
                }
                case 'bounce': {
                    const bounce = Math.max(0, Math.sin(t * Math.PI) * -12);
                    ctx.globalAlpha = Math.min(1, t * 3);
                    ctx.fillStyle = ch.color;
                    ctx.fillText(ch.char, ch.x, ch.y + bounce);
                    break;
                }
                case 'explode': {
                    if (t < 1) {
                        const spread = (1 - t) * 20;
                        const angle = ch.index * 2.4;
                        ctx.globalAlpha = t;
                        ctx.fillStyle = ch.color;
                        ctx.fillText(ch.char, ch.x + Math.cos(angle) * spread, ch.y + Math.sin(angle) * spread);
                    }
                    else {
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = ch.color;
                        ctx.fillText(ch.char, ch.x, ch.y);
                    }
                    break;
                }
            }
            ctx.restore();
        }
    }
    const totalDuration = (chars.length - 1) * stagger + duration;
    function tick(now) {
        if (!running)
            return;
        if (startTime === null)
            startTime = now;
        const elapsed = now - startTime;
        drawFrame(elapsed);
        if (elapsed >= totalDuration) {
            if (animOptions.loop) {
                startTime = now;
            }
            else {
                running = false;
                animOptions.onComplete?.();
                return;
            }
        }
        rafId = requestAnimationFrame(tick);
    }
    return {
        start() {
            if (running)
                return;
            running = true;
            startTime = null;
            rafId = requestAnimationFrame(tick);
        },
        stop() {
            running = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },
        reset() {
            running = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            startTime = null;
        },
    };
}
export function updateRender(prevMarkdown, nextMarkdown, canvas, options = {}) {
    const theme = resolveTheme(options.theme);
    const dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
    const width = options.width ?? (canvas.offsetWidth > 0 ? canvas.offsetWidth : 800);
    const prevLines = prevMarkdown.split('\n');
    const nextLines = nextMarkdown.split('\n');
    let firstChanged = 0;
    while (firstChanged < Math.min(prevLines.length, nextLines.length) &&
        prevLines[firstChanged] === nextLines[firstChanged]) {
        firstChanged++;
    }
    if (firstChanged === nextLines.length && prevMarkdown === nextMarkdown)
        return;
    const tokens = parseMarkdown(nextMarkdown, theme);
    const docLayout = computeLayout(tokens, width, theme);
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
//# sourceMappingURL=advanced.js.map