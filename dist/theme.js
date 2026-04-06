export const darkTheme = {
    background: '#0d1117',
    text: '#e6edf3',
    mutedText: '#9198a1',
    link: { color: '#58a6ff' },
    heading: {
        color: '#ffffff',
        sizes: [32, 24, 20, 18, 16, 14],
        weights: ['700', '600', '600', '600', '600', '600'],
        lineHeights: [44, 36, 30, 28, 26, 24],
    },
    code: {
        background: '#161b22',
        color: '#e6edf3',
        borderColor: '#30363d',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: 13,
        lineHeight: 22,
        borderRadius: 6,
        padding: 16,
    },
    inlineCode: {
        background: '#2d333b',
        color: '#79c0ff',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        borderRadius: 4,
        paddingH: 5,
    },
    blockquote: {
        borderColor: '#3d444d',
        textColor: '#9198a1',
        borderWidth: 4,
        paddingLeft: 16,
    },
    table: {
        headerBackground: '#161b22',
        headerColor: '#ffffff',
        borderColor: '#30363d',
        cellPadding: 12,
        alternateRowBackground: '#0d1117',
    },
    hr: { color: '#30363d' },
    list: { bulletColor: '#9198a1', indentX: 20, bulletGap: 8, itemGap: 4 },
    image: { borderRadius: 6, maxHeight: 400 },
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 28,
    padding: 48,
    blockGap: 20,
};
export const lightTheme = {
    background: '#ffffff',
    text: '#1f2328',
    mutedText: '#636c76',
    link: { color: '#0969da' },
    heading: {
        color: '#1f2328',
        sizes: [32, 24, 20, 18, 16, 14],
        weights: ['700', '600', '600', '600', '600', '600'],
        lineHeights: [44, 36, 30, 28, 26, 24],
    },
    code: {
        background: '#f6f8fa',
        color: '#1f2328',
        borderColor: '#d1d9e0',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: 13,
        lineHeight: 22,
        borderRadius: 6,
        padding: 16,
    },
    inlineCode: {
        background: '#eff1f3',
        color: '#0550ae',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        borderRadius: 4,
        paddingH: 5,
    },
    blockquote: {
        borderColor: '#d1d9e0',
        textColor: '#636c76',
        borderWidth: 4,
        paddingLeft: 16,
    },
    table: {
        headerBackground: '#f6f8fa',
        headerColor: '#1f2328',
        borderColor: '#d1d9e0',
        cellPadding: 12,
        alternateRowBackground: '#ffffff',
    },
    hr: { color: '#d1d9e0' },
    list: { bulletColor: '#636c76', indentX: 20, bulletGap: 8, itemGap: 4 },
    image: { borderRadius: 6, maxHeight: 400 },
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 28,
    padding: 48,
    blockGap: 20,
};
export function headingFont(theme, level) {
    const i = level - 1;
    return `${theme.heading.weights[i]} ${theme.heading.sizes[i]}px ${theme.fontFamily}`;
}
export function bodyFont(theme) {
    return `400 ${theme.fontSize}px ${theme.fontFamily}`;
}
export function boldFont(theme) {
    return `700 ${theme.fontSize}px ${theme.fontFamily}`;
}
export function italicFont(theme) {
    return `italic 400 ${theme.fontSize}px ${theme.fontFamily}`;
}
export function boldItalicFont(theme) {
    return `italic 700 ${theme.fontSize}px ${theme.fontFamily}`;
}
export function inlineCodeFont(theme) {
    return `400 ${theme.fontSize - 1}px ${theme.inlineCode.fontFamily}`;
}
export function codeBlockFont(theme) {
    return `400 ${theme.code.fontSize}px ${theme.code.fontFamily}`;
}
//# sourceMappingURL=theme.js.map