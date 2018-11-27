import { Graphic } from './graphic';
import { Point } from '../common/point';
import { Color, Colors } from './color';

export enum RectDrawMode {
    stroke,
    fill
}

export class Rect extends Graphic {
    public constructor(
        private w: number,
        private h: number,
        private drawMode: RectDrawMode = RectDrawMode.fill,
        private lineColor: Color = new Color(Colors.black),
        private fillColor: Color = new Color()
    ) {
        super();
    }

    public draw(p: Point, context: CanvasRenderingContext2D, zoomLevel: number, centered = false) {
        const scale = 1 / zoomLevel;
        const x = p.x * scale - +centered * this.w * scale / 2;
        const y = p.y * scale - +centered * this.h * scale / 2;
        switch(this.drawMode) {
            case RectDrawMode.fill:
                context.strokeStyle = this.lineColor.valueOf();
                context.fillStyle = this.fillColor.valueOf();
                context.fillRect(
                    x,
                    y,
                    this.w * scale,
                    this.h * scale
                )
                break;
            case RectDrawMode.stroke:
                context.strokeStyle = this.lineColor.valueOf();
                context.strokeRect(
                    x,
                    y,
                    this.w * scale,
                    this.h * scale
                )
                break;
        }
    }

    public static fromPoints(p1: Point, p2: Point, p3: Point, p4: Point): Rect {
        let w = p1.x;
        let h = p1.y;
        for (var i = 1; i < 4; i++) {
            if (w < arguments[i].x) {
                w = arguments[i].x;
            }
            if (h < arguments[i].y) {
                h = arguments[i].y;
            }
        }
        return new Rect(w, h);
    }
}
