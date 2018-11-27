import { Graphic } from './graphic';
import { Point } from '../common/point';
import { Color, Colors } from './color';

export class Arrow extends Graphic {
    public constructor(
        private lineColor: Color = new Color(Colors.black),
        private lineWidth: number = 1,
        private arrowHeadLength: number = 10,
        private arrowHeadWidth: number = 20,
        private dash: Array<number> = [],
    ) {
        super();
    }

    public draw(p: Point, context: CanvasRenderingContext2D, zoomLevel: number, to: Point = new Point(0,0)) {
        const scale = 1 / zoomLevel;
        // arrow start
        const px = p.x * scale;
        const py = p.y * scale;

        // arrow end
        const tox = to.x * scale;
        const toy = to.y * scale;

        // calculate fractions for arrow lines
        const dx = tox - px;
        const dy = toy - py;
        const dist = Math.sqrt(dx**2+dy**2);
        const fx = dx / dist;
        const fy = dy / dist;

        context.strokeStyle = this.lineColor.valueOf();
        context.lineWidth = this.lineWidth;
        context.setLineDash(this.dash);

        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(tox, toy);
        context.lineTo(tox - this.arrowHeadLength * fx * scale + this.arrowHeadWidth / 2 * fy * scale, toy - this.arrowHeadWidth / 2 * fx * scale - this.arrowHeadLength * fy * scale);
        context.lineTo(tox - this.arrowHeadLength * fx * scale - this.arrowHeadWidth / 2 * fy * scale, toy + this.arrowHeadWidth / 2 * fx * scale - this.arrowHeadLength * fy * scale);
        context.lineTo(tox, toy);
        context.stroke();
        context.closePath();
    }
}
