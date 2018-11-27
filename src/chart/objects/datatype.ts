import { MovableChartObject } from './movableObject';
import { Point } from '../../common/point';
import { Rect } from '../../graphics/rect';
import { ChartText } from '../../graphics/text';
import { Color, Colors } from '../../graphics/color';

export class DataType extends MovableChartObject{
    private rect: Rect;
    private text: ChartText;

    public constructor(
        guid: string,
        pos: Point,
        name: string
    ) {
        super(guid, pos);

        this.rect = new Rect(160, 50);
        this.text = new ChartText(name, new Color(Colors.red));
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        this.rect.draw(this.pos, context, zoomLevel, true);
        this.text.draw(this.pos, context, 1, 'center');
    }
}
