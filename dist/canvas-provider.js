export function browserCanvasFactory(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
export function getDefaultFactory() {
    if (typeof document !== 'undefined')
        return browserCanvasFactory;
    throw new Error('canvasdown: no canvas factory available. ' +
        'In Node.js, pass canvasFactory via options: ' +
        'import { createCanvas } from "@napi-rs/canvas"; ' +
        '{ canvasFactory: (w,h) => createCanvas(w,h) }');
}
//# sourceMappingURL=canvas-provider.js.map