import { marked } from 'marked';
import { bodyFont, boldFont, italicFont, boldItalicFont, inlineCodeFont, headingFont } from './theme.js';
function unescapeHtml(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}
function walkInlineTokens(tokens, theme, spans) {
    for (const token of tokens) {
        switch (token.type) {
            case 'text': {
                const t = token;
                if (t.tokens && t.tokens.length > 0) {
                    walkInlineTokens(t.tokens, theme, spans);
                }
                else if (t.text) {
                    spans.push({ text: unescapeHtml(t.text), font: bodyFont(theme) });
                }
                break;
            }
            case 'strong': {
                const t = token;
                const children = [];
                if (t.tokens)
                    walkInlineTokens(t.tokens, theme, children);
                for (const child of children) {
                    const isItalic = child.font.includes('italic');
                    spans.push({ text: child.text, font: isItalic ? boldItalicFont(theme) : boldFont(theme), ...(child.style !== undefined ? { style: child.style } : {}) });
                }
                break;
            }
            case 'em': {
                const t = token;
                const children = [];
                if (t.tokens)
                    walkInlineTokens(t.tokens, theme, children);
                for (const child of children) {
                    const isBold = child.font.includes('700');
                    spans.push({
                        text: child.text,
                        font: isBold ? boldItalicFont(theme) : italicFont(theme),
                        style: child.style,
                    });
                }
                break;
            }
            case 'codespan': {
                const t = token;
                spans.push({
                    text: t.text,
                    font: inlineCodeFont(theme),
                    style: {
                        color: theme.inlineCode.color,
                        background: theme.inlineCode.background,
                        backgroundRadius: theme.inlineCode.borderRadius,
                    },
                });
                break;
            }
            case 'link': {
                const t = token;
                const children = [];
                if (t.tokens)
                    walkInlineTokens(t.tokens, theme, children);
                else
                    children.push({ text: t.text, font: bodyFont(theme) });
                for (const child of children) {
                    spans.push({
                        text: child.text,
                        font: child.font,
                        style: { ...child.style, color: theme.link.color, underline: true, href: t.href },
                    });
                }
                break;
            }
            case 'del': {
                const t = token;
                const children = [];
                if (t.tokens)
                    walkInlineTokens(t.tokens, theme, children);
                else
                    children.push({ text: t.text, font: bodyFont(theme) });
                for (const child of children) {
                    spans.push({ text: child.text, font: child.font, style: { ...child.style, strikethrough: true } });
                }
                break;
            }
            case 'image': {
                const t = token;
                if (t.href)
                    spans.push({ text: t.text || t.href, font: italicFont(theme), style: { color: theme.mutedText } });
                break;
            }
            case 'html': {
                break;
            }
            case 'escape': {
                const t = token;
                spans.push({ text: t.text, font: bodyFont(theme) });
                break;
            }
        }
    }
}
function parseInlineSpans(rawText, theme) {
    const spans = [];
    const tokens = marked.lexer(rawText, { gfm: true });
    for (const token of tokens) {
        if (token.type === 'paragraph') {
            const p = token;
            if (p.tokens)
                walkInlineTokens(p.tokens, theme, spans);
        }
        else {
            const single = [];
            walkInlineTokens([token], theme, single);
            spans.push(...single);
        }
    }
    return spans.length > 0 ? spans : [{ text: rawText, font: bodyFont(theme) }];
}
function plainText(spans) {
    return spans.map((s) => s.text).join('');
}
function parseListItemToken(item, theme) {
    const raw = item.text ?? '';
    let checked;
    let textRaw = raw;
    const taskMatch = /^\[([xX ])\]\s+/.exec(raw);
    if (taskMatch) {
        checked = taskMatch[1].toLowerCase() === 'x';
        textRaw = raw.slice(taskMatch[0].length);
    }
    const spans = parseInlineSpans(textRaw, theme);
    const children = [];
    if (item.tokens) {
        for (const tok of item.tokens) {
            if (tok.type === 'list') {
                children.push(parseList(tok, theme));
            }
        }
    }
    return { spans, plainText: plainText(spans), checked, children: children.length ? children : undefined };
}
function parseList(token, theme) {
    return {
        type: 'list',
        ordered: token.ordered,
        start: typeof token.start === 'number' ? token.start : 1,
        items: token.items.map((item) => parseListItemToken(item, theme)),
    };
}
function parseTableCell(tokens, rawText, theme) {
    if (tokens && tokens.length > 0) {
        const spans = [];
        walkInlineTokens(tokens, theme, spans);
        return spans.length > 0 ? spans : [{ text: rawText, font: bodyFont(theme) }];
    }
    return parseInlineSpans(rawText, theme);
}
function parseTableToken(token, theme) {
    const align = token.align.map((a) => {
        if (a === 'left' || a === 'center' || a === 'right')
            return a;
        return null;
    });
    const headers = token.header.map((cell) => parseTableCell(cell.tokens, cell.text, theme));
    const rows = token.rows.map((row) => row.map((cell) => parseTableCell(cell.tokens, cell.text, theme)));
    return { type: 'table', headers, rows, align };
}
export function parseMarkdown(markdown, theme) {
    const tokens = marked.lexer(markdown, { gfm: true });
    const result = [];
    for (const token of tokens) {
        switch (token.type) {
            case 'heading': {
                const t = token;
                const level = Math.max(1, Math.min(t.depth, 6));
                const spans = parseInlineSpans(t.text, theme);
                for (let i = 0; i < spans.length; i++) {
                    const sp = spans[i];
                    if (!sp.font.includes('italic') && !sp.font.includes('700')) {
                        spans[i] = { ...sp, font: headingFont(theme, level) };
                    }
                }
                result.push({ type: 'heading', level, spans, plainText: plainText(spans) });
                break;
            }
            case 'paragraph': {
                const t = token;
                if (t.tokens) {
                    if (t.tokens.length === 1 && t.tokens[0]?.type === 'image') {
                        const img = t.tokens[0];
                        result.push({ type: 'image', src: img.href, alt: img.text, title: img.title ?? undefined });
                    }
                    else {
                        const spans = [];
                        walkInlineTokens(t.tokens, theme, spans);
                        if (spans.length > 0)
                            result.push({ type: 'paragraph', spans, plainText: plainText(spans) });
                    }
                }
                else {
                    const spans = parseInlineSpans(t.text, theme);
                    result.push({ type: 'paragraph', spans, plainText: plainText(spans) });
                }
                break;
            }
            case 'code': {
                const t = token;
                result.push({ type: 'code_block', lang: t.lang ?? '', code: t.text });
                break;
            }
            case 'blockquote': {
                const t = token;
                const inner = t.text.replace(/^>\s?/gm, '').trim();
                const spans = parseInlineSpans(inner, theme);
                result.push({ type: 'blockquote', spans, plainText: plainText(spans) });
                break;
            }
            case 'list': {
                const t = token;
                result.push(parseList(t, theme));
                break;
            }
            case 'table': {
                const t = token;
                result.push(parseTableToken(t, theme));
                break;
            }
            case 'image': {
                const t = token;
                result.push({ type: 'image', src: t.href, alt: t.text, title: t.title ?? undefined });
                break;
            }
            case 'hr': {
                result.push({ type: 'hr' });
                break;
            }
            case 'space': {
                result.push({ type: 'space' });
                break;
            }
        }
    }
    return result;
}
//# sourceMappingURL=parser.js.map