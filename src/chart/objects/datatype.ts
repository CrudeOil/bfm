import { ChartObject } from './object';
import { Point } from '../../common/point';
import { Rect } from '../../graphics/rect';

export class DataType extends ChartObject{
    private rect: Rect;

    public constructor(
        guid: string,
        pos: Point,
        name: string
    ) {
        super(guid, pos);

        this.rect = new Rect(160, 50);
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        this.rect.draw(this.pos, context, zoomLevel, true);
    }
}
