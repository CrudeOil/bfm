import { Chart } from '../chart/chart';
import { Point } from '../common/point';
import { ChartText} from './text';
import { ChartObject } from '../chart/objects/object';

export const MAX_ZOOM_LEVEL = 4;
export const MIN_ZOOM_LEVEL = 1;

interface RenderBoundingBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class Renderer {
    // x, y, w, h
    private renderBoundingBox: RenderBoundingBox;

    private cameraPosText: ChartText;

    constructor(
        private chart: Chart,
        private context: CanvasRenderingContext2D,
        private zoomLevel = 1,
        private cameraPos = new Point(0,0)
    ) {
        this.cameraPosText = new ChartText('Test');
    }

    public repaint() {
        this.context.clearRect(-this.cameraPos.x, -this.cameraPos.y, this.context.canvas.width, this.context.canvas.height);
        for (const object of this.chart.getObjects()) {
            object.draw(this.context, this.zoomLevel);
        }
        this.renderDebugInfo()
    }

    private renderDebugInfo() {
        this.cameraPosText.setText('x: ' + this.cameraPos.x + ' y: ' + this.cameraPos.y 
        + '\nz: ' + this.zoomLevel);
        this.cameraPosText.draw(new Point(10 - this.cameraPos.x, 600 - this.cameraPos.y), this.context, 1);
    }

    private transformChanged() {
        this.context.setTransform(1, 0, 0, 1, this.cameraPos.x, this.cameraPos.y);
        this.repaint();
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
        this.transformChanged();
    }

    public getZoomLevel(): number {
        return this.zoomLevel;
    }

    public getViewCenter(): Point {
        return new Point(this.cameraPos.x + this.context.canvas.width / 2, this.cameraPos.y + this.context.canvas.height / 2);
    }

    public getViewOffset(): Point {
        return new Point(this.cameraPos.x, this.cameraPos.y);
    }
}
