import { Graphic } from './graphic';
import { Point } from '../common/point';
import { Color, Colors } from './color';

export class Line extends Graphic {
    public constructor(
        private lineColor: Color = new Color(Colors.black),
        private lineWidth: number = 1,
        private dash: Array<number> = []
    ) {
        super();
    }

    public draw(p: Point, context: CanvasRenderingContext2D, zoomLevel: number, to: Point = new Point(0,0)) {
        const scale = 1 / zoomLevel;
        const px = p.x * scale;
        const py = p.y * scale;
        const tox = to.x * scale;
        const toy = to.y * scale;

        context.strokeStyle = this.lineColor.valueOf();
        context.lineWidth = this.lineWidth;

        context.beginPath();
        context.setLineDash(this.dash);
        context.moveTo(px, py);
        context.lineTo(tox, toy);
        context.stroke();
        context.closePath();
    }
}
