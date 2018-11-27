import { Graphic } from './graphic';
import { Color, Colors } from '../graphics/color';
import { Point } from '../common/point';



export class ChartText extends Graphic {
    public constructor (
        private text = '',
        private color: Color = new Color(Colors.white)
    ) {
        super();
    }

    public setText(text: string) {
        this.text = text;
    }

    public draw(pos: Point, context: CanvasRenderingContext2D, zoomLevel: number, textAlign: CanvasTextAlign = 'left') {
        context.fillStyle = this.color.valueOf();
        context.textAlign = textAlign;
        context.fillText(this.text, pos.x, pos.y);
    }
}
