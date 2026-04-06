import type { DocumentLayout } from './layout.js';
import type { RenderOptions } from './index.js';
export type StreamHandle = {
    append(chunk: string): void;
    flush(): void;
    getLayout(): DocumentLayout | null;
    destroy(): void;
};
export declare function createStream(canvas: HTMLCanvasElement, options?: RenderOptions): StreamHandle;
//# sourceMappingURL=stream.d.ts.map