export type WorkerMessage = {
    type: 'render';
    markdown: string;
    width: number;
    theme: 'dark' | 'light';
    dpr: number;
} | {
    type: 'measure';
    markdown: string;
    width: number;
    theme: 'dark' | 'light';
};
export type WorkerResponse = {
    type: 'rendered';
    height: number;
    totalHeight: number;
} | {
    type: 'measured';
    totalHeight: number;
    blockCount: number;
} | {
    type: 'error';
    message: string;
};
export declare function handleWorkerMessage(msg: WorkerMessage, offscreen: OffscreenCanvas): WorkerResponse;
//# sourceMappingURL=worker-bridge.d.ts.map