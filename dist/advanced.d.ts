import type { DocumentLayout } from './layout.js';
import type { RenderOptions } from './index.js';
export type ShrinkwrapOptions = {
    minWidth?: number;
    maxWidth?: number;
    padding?: number;
    theme?: RenderOptions['theme'];
};
export type ShrinkwrapResult = {
    width: number;
    height: number;
};
export declare function shrinkwrap(markdown: string, options?: ShrinkwrapOptions): ShrinkwrapResult;
export type FitTextOptions = {
    container: {
        width: number;
        height: number;
    };
    fontSizeMin?: number;
    fontSizeMax?: number;
    theme?: RenderOptions['theme'];
};
export type FitTextResult = {
    fontSize: number;
    lineHeight: number;
    height: number;
};
export declare function fitText(markdown: string, options: FitTextOptions): FitTextResult;
export type HighlightStyle = {
    background?: string | undefined;
    color?: string | undefined;
    opacity?: number | undefined;
};
export type HighlightHandle = {
    highlight(query: string, style: HighlightStyle): void;
    clear(): void;
    destroy(): void;
};
export declare function createOverlay(canvas: HTMLCanvasElement, layout: DocumentLayout, theme?: RenderOptions['theme']): HighlightHandle;
export type PathTextOptions = {
    font?: string;
    color?: string;
    theme?: RenderOptions['theme'];
    offset?: number;
};
export declare function renderTextOnPath(ctx: CanvasRenderingContext2D, text: string, svgPath: string, options?: PathTextOptions): void;
export type AnimationEffect = 'wave' | 'fadeIn' | 'typewriter' | 'bounce' | 'explode';
export type AnimationOptions = {
    effect: AnimationEffect;
    stagger?: number;
    duration?: number;
    loop?: boolean;
    onComplete?: () => void;
};
export type AnimationHandle = {
    start(): void;
    stop(): void;
    reset(): void;
};
export declare function animateText(canvas: HTMLCanvasElement, markdown: string, animOptions: AnimationOptions, renderOptions?: RenderOptions): AnimationHandle;
export type DiffRenderOptions = RenderOptions & {
    canvas: HTMLCanvasElement;
};
export declare function updateRender(prevMarkdown: string, nextMarkdown: string, canvas: HTMLCanvasElement, options?: RenderOptions): void;
//# sourceMappingURL=advanced.d.ts.map