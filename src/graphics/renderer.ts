import { Chart } from '../chart/chart';
import { Point } from '../common/point';
import { ChartText} from './text';

export const MAX_ZOOM_LEVEL = 4;
export const MIN_ZOOM_LEVEL = 1;

export class Renderer {
    private animationFrameHandle: number;

    private cameraPosText: ChartText;

    constructor(
        private chart: Chart,
        private context: CanvasRenderingContext2D,
        private zoomLevel = 1,
        private cameraPos = new Point(0,0)
    ) {
        this.cameraPosText = new ChartText('Test');
    }

    private renderFrame = ()  => {
        this.context.save();
        this.context.clearRect(-this.cameraPos.x,  -this.cameraPos.y, this.context.canvas.clientWidth, this.context.canvas.clientHeight);
        for (const object of this.chart.getObjects()) {
            object.draw(this.context, this.zoomLevel);
        }
        this.cameraPosText.setText('x: ' + this.cameraPos.x + ' y: ' + this.cameraPos.y + ' z: ' + this.zoomLevel);
        this.cameraPosText.draw(new Point(10 - this.cameraPos.x, 600 - this.cameraPos.y), this.context, 1);
        this.context.restore();
        this.animationFrameHandle = requestAnimationFrame(this.renderFrame);
    }

    public start() {
        requestAnimationFrame(this.renderFrame);
    }

    public stop() {
        cancelAnimationFrame(this.animationFrameHandle);
    }

    private transformChanged() {
        this.context.setTransform(1, 0, 0, 1, this.cameraPos.x, this.cameraPos.y);
    }

    public setCameraPos(pos: Point) {
        this.cameraPos = pos;
        this.transformChanged();
    }

    public moveCamera(x: number, y: number) {
        this.cameraPos.x -= x;
        this.cameraPos.y -= y;
        this.transformChanged();
    }

    public setZoomLevel(zoomLevel: number) {
        if (zoomLevel > MAX_ZOOM_LEVEL) {
            this.zoomLevel = MAX_ZOOM_LEVEL;
        } else if (zoomLevel < MIN_ZOOM_LEVEL) {
            this.zoomLevel = MIN_ZOOM_LEVEL;
        } else {
            this.zoomLevel = zoomLevel;
        }
    }

    public getZoomLevel(): number {
        return this.zoomLevel;
    }

    public getViewCenter(): Point {
        return new Point(0,0);
    }

    public getViewOffset(): Point {
        return new Point(this.cameraPos.x, this.cameraPos.y);
    }
}
