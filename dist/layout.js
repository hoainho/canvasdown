import { prepareWithSegments, layoutWithLines, } from '@chenglou/pretext';
import { codeBlockFont } from './theme.js';
function measureSpanWidth(text, font, lineHeight) {
    if (!text.trim())
        return 0;
    const prepared = prepareWithSegments(text, font);
    const { lines } = layoutWithLines(prepared, 999999, lineHeight);
    return lines[0]?.width ?? 0;
}
export function layoutRichSpans(spans, maxWidth, lineHeight) {
    if (spans.length === 0)
        return { richLines: [], height: 0 };
    const fullText = spans.map((s) => s.text).join('');
    if (!fullText.trim())
        return { richLines: [{ fragments: [], totalWidth: 0 }], height: lineHeight };
    const primaryFont = spans[0].font;
    const prepared = prepareWithSegments(fullText, primaryFont);
    const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);
    const richLines = [];
    let charOffset = 0;
    for (const line of lines) {
        const lineText = line.text;
        const fragments = [];
        let fragX = 0;
        let lineCharPos = 0;
        let spanIdx = 0;
        let spanCharPos = charOffset;
        while (lineCharPos < lineText.length && spanIdx < spans.length) {
            const span = spans[spanIdx];
            const spanRemaining = span.text.length - (spanCharPos - charOffset - spans.slice(0, spanIdx).reduce((a, s) => a + s.text.length, 0));
            if (spanRemaining <= 0) {
                spanIdx++;
                continue;
            }
            const canTake = Math.min(spanRemaining, lineText.length - lineCharPos);
            const fragText = lineText.slice(lineCharPos, lineCharPos + canTake);
            if (fragText.length > 0) {
                const fragWidth = measureSpanWidth(fragText, span.font, lineHeight);
                fragments.push({ text: fragText, font: span.font, ...(span.style !== undefined ? { style: span.style } : {}), x: fragX, width: fragWidth });
                fragX += fragWidth;
                lineCharPos += canTake;
            }
            if (canTake >= spanRemaining) {
                spanIdx++;
            }
        }
        richLines.push({ fragments, totalWidth: fragX });
        charOffset += lineText.length;
    }
    return { richLines, height: richLines.length * lineHeight };
}
function layoutCodeBlock(code, maxWidth, theme) {
    const font = codeBlockFont(theme);
    const innerWidth = maxWidth - theme.code.padding * 2;
    const lh = theme.code.lineHeight;
    const rawLines = code.split('\n');
    const codeLines = [];
    for (const raw of rawLines) {
        if (raw === '') {
            codeLines.push('');
            continue;
        }
        const prepared = prepareWithSegments(raw, font);
        const { lines } = layoutWithLines(prepared, innerWidth, lh);
        for (const l of lines)
            codeLines.push(l.text);
    }
    return { codeLines, lineHeight: lh, height: codeLines.length * lh + theme.code.padding * 2 };
}
function layoutListItem(item, maxWidth, theme, depth) {
    const bulletWidth = theme.list.indentX + theme.list.bulletGap;
    const textWidth = maxWidth - bulletWidth;
    const { richLines, height } = layoutRichSpans(item.spans, textWidth, theme.lineHeight);
    let childBlock;
    let childHeight = 0;
    if (item.children && item.children.length > 0) {
        const child = item.children[0];
        childBlock = layoutListBlock(child, maxWidth - theme.list.indentX, theme, depth + 1);
        childHeight = childBlock.height;
    }
    return {
        richLines,
        ...(childBlock !== undefined ? { children: childBlock } : {}),
        height: Math.max(height, theme.lineHeight) + childHeight,
        ...(item.checked !== undefined ? { checked: item.checked } : {}),
    };
}
function layoutListBlock(token, maxWidth, theme, depth) {
    const items = token.items.map((item) => layoutListItem(item, maxWidth, theme, depth));
    const totalHeight = items.reduce((sum, item) => sum + item.height, 0)
        + Math.max(0, items.length - 1) * theme.list.itemGap;
    return { ordered: token.ordered, start: token.start, items, height: totalHeight };
}
function layoutTable(token, maxWidth, theme) {
    const colCount = token.headers.length;
    const colWidth = Math.floor((maxWidth - (colCount + 1) * 1) / colCount);
    const cellWidth = colWidth - theme.table.cellPadding * 2;
    const headers = token.headers.map((cellSpans) => {
        const { richLines } = layoutRichSpans(cellSpans, cellWidth, theme.lineHeight);
        return richLines;
    });
    const rows = token.rows.map((row) => row.map((cellSpans) => {
        const { richLines } = layoutRichSpans(cellSpans, cellWidth, theme.lineHeight);
        return richLines;
    }));
    const headerHeight = Math.max(...headers.map((rl) => rl.length * theme.lineHeight), theme.lineHeight) + theme.table.cellPadding * 2;
    const rowHeights = rows.map((row) => Math.max(...row.map((rl) => rl.length * theme.lineHeight), theme.lineHeight)
        + theme.table.cellPadding * 2);
    const colWidths = Array(colCount).fill(colWidth);
    return { headers, rows, colWidths, rowHeights, headerHeight, align: token.align };
}
export function computeLayout(tokens, canvasWidth, theme) {
    const contentWidth = canvasWidth - theme.padding * 2;
    const blocks = [];
    let y = theme.padding;
    for (const token of tokens) {
        switch (token.type) {
            case 'heading': {
                const { richLines, height } = layoutRichSpans(token.spans, contentWidth, theme.heading.lineHeights[token.level - 1] ?? theme.lineHeight);
                const h = Math.max(height, theme.heading.lineHeights[token.level - 1] ?? theme.lineHeight);
                blocks.push({ type: 'heading', level: token.level, richLines, height: h, y });
                y += h + theme.blockGap;
                break;
            }
            case 'paragraph': {
                const { richLines, height } = layoutRichSpans(token.spans, contentWidth, theme.lineHeight);
                const h = Math.max(height, theme.lineHeight);
                blocks.push({ type: 'paragraph', richLines, height: h, y });
                y += h + theme.blockGap;
                break;
            }
            case 'code_block': {
                const { codeLines, lineHeight, height } = layoutCodeBlock(token.code, contentWidth, theme);
                blocks.push({ type: 'code_block', lang: token.lang, codeLines, lineHeight, height, y });
                y += height + theme.blockGap;
                break;
            }
            case 'blockquote': {
                const bqWidth = contentWidth - theme.blockquote.borderWidth - theme.blockquote.paddingLeft;
                const { richLines, height } = layoutRichSpans(token.spans, bqWidth, theme.lineHeight);
                const h = Math.max(height, theme.lineHeight);
                blocks.push({ type: 'blockquote', richLines, height: h, y });
                y += h + theme.blockGap;
                break;
            }
            case 'list': {
                const listBlock = layoutListBlock(token, contentWidth, theme, 0);
                blocks.push({ type: 'list', ordered: token.ordered, start: token.start, items: listBlock.items, height: listBlock.height, y });
                y += listBlock.height + theme.blockGap;
                break;
            }
            case 'table': {
                const laidOut = layoutTable(token, contentWidth, theme);
                const height = laidOut.headerHeight + laidOut.rowHeights.reduce((a, b) => a + b, 0) + (laidOut.rows.length + 1);
                blocks.push({ type: 'table', laidOut, height, y });
                y += height + theme.blockGap;
                break;
            }
            case 'image': {
                const imageHeight = Math.min(200, theme.image.maxHeight);
                blocks.push({ type: 'image', src: token.src, alt: token.alt, width: contentWidth, height: imageHeight, y });
                y += imageHeight + theme.blockGap;
                break;
            }
            case 'hr': {
                blocks.push({ type: 'hr', height: 24, y });
                y += 24 + theme.blockGap;
                break;
            }
            case 'space': {
                blocks.push({ type: 'space', height: theme.lineHeight, y });
                y += theme.lineHeight;
                break;
            }
        }
    }
    return { blocks, totalHeight: y + theme.padding, canvasWidth };
}
//# sourceMappingURL=layout.js.map