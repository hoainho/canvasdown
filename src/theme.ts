export type ThemeLink = {
  color: string
  hoverColor?: string
}

export type ThemeTable = {
  headerBackground: string
  headerColor: string
  borderColor: string
  cellPadding: number
  alternateRowBackground?: string
}

export type Theme = {
  background: string
  text: string
  mutedText: string
  link: ThemeLink
  heading: {
    color: string
    sizes: [number, number, number, number, number, number]
    weights: [string, string, string, string, string, string]
    lineHeights: [number, number, number, number, number, number]
  }
  code: {
    background: string
    color: string
    borderColor: string
    fontFamily: string
    fontSize: number
    lineHeight: number
    borderRadius: number
    padding: number
  }
  inlineCode: {
    background: string
    color: string
    fontFamily: string
    borderRadius: number
    paddingH: number
  }
  blockquote: {
    borderColor: string
    textColor: string
    borderWidth: number
    paddingLeft: number
  }
  table: ThemeTable
  hr: { color: string }
  list: {
    bulletColor: string
    indentX: number
    bulletGap: number
    itemGap: number
  }
  image: {
    borderRadius: number
    maxHeight: number
  }
  fontFamily: string
  fontSize: number
  lineHeight: number
  padding: number
  blockGap: number
}

export const darkTheme: Theme = {
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
}

export const lightTheme: Theme = {
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
}

export function headingFont(theme: Theme, level: 1|2|3|4|5|6): string {
  const i = level - 1
  return `${theme.heading.weights[i]} ${theme.heading.sizes[i]}px ${theme.fontFamily}`
}

export function bodyFont(theme: Theme): string {
  return `400 ${theme.fontSize}px ${theme.fontFamily}`
}

export function boldFont(theme: Theme): string {
  return `700 ${theme.fontSize}px ${theme.fontFamily}`
}

export function italicFont(theme: Theme): string {
  return `italic 400 ${theme.fontSize}px ${theme.fontFamily}`
}

export function boldItalicFont(theme: Theme): string {
  return `italic 700 ${theme.fontSize}px ${theme.fontFamily}`
}

export function inlineCodeFont(theme: Theme): string {
  return `400 ${theme.fontSize - 1}px ${theme.inlineCode.fontFamily}`
}

export function codeBlockFont(theme: Theme): string {
  return `400 ${theme.code.fontSize}px ${theme.code.fontFamily}`
}
