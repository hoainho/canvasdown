import { parseMarkdown } from './parser.js';
import { computeLayout } from './layout.js';
import { renderToCanvas } from './renderer.js';
import { darkTheme, lightTheme } from './theme.js';
export function createCanvasdownComponent(React) {
    function resolveTheme(opt) {
        if (!opt || opt === 'dark')
            return darkTheme;
        if (opt === 'light')
            return lightTheme;
        return opt;
    }
    return function Canvasdown(props) {
        const { markdown, width = 800, theme: themeProp, devicePixelRatio, className, style, onHeightChange, onRender, } = props;
        const canvasRef = React.useRef(null);
        React.useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const theme = resolveTheme(themeProp);
            const dpr = devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
            const tokens = parseMarkdown(markdown, theme);
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
            onHeightChange?.(docLayout.totalHeight);
            onRender?.(docLayout);
        }, [markdown, width, themeProp, devicePixelRatio]);
        return React.createElement('canvas', {
            ref: canvasRef,
            className,
            style,
        });
    };
}
//# sourceMappingURL=react.js.map