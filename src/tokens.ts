export type SpanStyle = {
  color?: string | undefined
  background?: string | undefined
  backgroundRadius?: number | undefined
  underline?: boolean | undefined
  strikethrough?: boolean | undefined
  href?: string | undefined
}

export type InlineSpan = {
  text: string
  font: string
  style?: SpanStyle | undefined
}

export type HeadingToken = {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  spans: InlineSpan[]
  plainText: string
}

export type ParagraphToken = {
  type: 'paragraph'
  spans: InlineSpan[]
  plainText: string
}

export type CodeBlockToken = {
  type: 'code_block'
  lang: string
  code: string
}

export type BlockquoteToken = {
  type: 'blockquote'
  spans: InlineSpan[]
  plainText: string
}

export type ListToken = {
  type: 'list'
  ordered: boolean
  start: number
  items: ListItemToken[]
}

export type ListItemToken = {
  spans: InlineSpan[]
  plainText: string
  checked?: boolean | undefined
  children?: ListToken[] | undefined
}

export type TableToken = {
  type: 'table'
  headers: InlineSpan[][]
  rows: InlineSpan[][][]
  align: Array<'left' | 'center' | 'right' | null>
}

export type ImageToken = {
  type: 'image'
  src: string
  alt: string
  title?: string | undefined
}

export type HrToken = {
  type: 'hr'
}

export type SpaceToken = {
  type: 'space'
}

export type RenderToken =
  | HeadingToken
  | ParagraphToken
  | CodeBlockToken
  | BlockquoteToken
  | ListToken
  | TableToken
  | ImageToken
  | HrToken
  | SpaceToken
