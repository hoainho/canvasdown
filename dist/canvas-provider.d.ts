export type CanvasLike = {
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasRenderingContext2D | null;
    toDataURL(type?: string, quality?: number): string;
    toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
};
export type CanvasFactory = (width: number, height: number) => CanvasLike;
export declare function browserCanvasFactory(width: number, height: number): CanvasLike;
export declare function getDefaultFactory(): CanvasFactory;
//# sourceMappingURL=canvas-provider.d.ts.map