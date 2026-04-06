import type { RenderToken, InlineSpan } from './tokens.js';
import type { Theme } from './theme.js';
export type RenderedSpanFragment = {
    text: string;
    font: string;
    style?: import('./tokens.js').SpanStyle | undefined;
    x: number;
    width: number;
};
export type LaidOutRichLine = {
    fragments: RenderedSpanFragment[];
    totalWidth: number;
};
export type LaidOutBlock = {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    richLines: LaidOutRichLine[];
    height: number;
    y: number;
} | {
    type: 'paragraph';
    richLines: LaidOutRichLine[];
    height: number;
    y: number;
} | {
    type: 'code_block';
    lang: string;
    codeLines: string[];
    lineHeight: number;
    height: number;
    y: number;
} | {
    type: 'blockquote';
    richLines: LaidOutRichLine[];
    height: number;
    y: number;
} | {
    type: 'list';
    ordered: boolean;
    start: number;
    items: LaidOutListItem[];
    height: number;
    y: number;
} | {
    type: 'table';
    laidOut: LaidOutTable;
    height: number;
    y: number;
} | {
    type: 'image';
    src: string;
    alt: string;
    width: number;
    height: number;
    y: number;
} | {
    type: 'hr';
    height: number;
    y: number;
} | {
    type: 'space';
    height: number;
    y: number;
};
export type LaidOutListItem = {
    richLines: LaidOutRichLine[];
    children?: LaidOutListBlock | undefined;
    height: number;
    checked?: boolean | undefined;
};
export type LaidOutListBlock = {
    ordered: boolean;
    start: number;
    items: LaidOutListItem[];
    height: number;
};
export type LaidOutTable = {
    headers: LaidOutRichLine[][];
    rows: LaidOutRichLine[][][];
    colWidths: number[];
    rowHeights: number[];
    headerHeight: number;
    align: Array<'left' | 'center' | 'right' | null>;
};
export type DocumentLayout = {
    blocks: LaidOutBlock[];
    totalHeight: number;
    canvasWidth: number;
};
export declare function layoutRichSpans(spans: InlineSpan[], maxWidth: number, lineHeight: number): {
    richLines: LaidOutRichLine[];
    height: number;
};
export declare function computeLayout(tokens: RenderToken[], canvasWidth: number, theme: Theme): DocumentLayout;
//# sourceMappingURL=layout.d.ts.map