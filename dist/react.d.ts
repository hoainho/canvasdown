import { computeLayout } from './layout.js';
import { type Theme } from './theme.js';
export type CanvasdownProps = {
    markdown: string;
    width?: number;
    theme?: Theme | 'dark' | 'light';
    devicePixelRatio?: number;
    className?: string;
    style?: Record<string, string | number>;
    onHeightChange?: (height: number) => void;
    onRender?: (layout: ReturnType<typeof computeLayout>) => void;
};
declare global {
    namespace JSX {
        interface IntrinsicElements {
            canvas: {
                ref?: unknown;
                width?: number;
                height?: number;
                style?: Record<string, string | number>;
                className?: string;
            };
        }
    }
}
export declare function createCanvasdownComponent(React: {
    useRef: <T>(init: T | null) => {
        current: T | null;
    };
    useEffect: (fn: () => (() => void) | void, deps: unknown[]) => void;
    createElement: (...args: unknown[]) => unknown;
}): (props: CanvasdownProps) => unknown;
//# sourceMappingURL=react.d.ts.map