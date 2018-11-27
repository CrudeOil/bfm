import { MovableChartObject } from './movableObject';
import { Point } from '../../common/point';
import { Rect } from '../../graphics/rect';
import { ChartText } from '../../graphics/text';
import { Color, Colors } from '../../graphics/color';

export const PROCESS_NODE_WIDTH = 160;
export const PROCESS_NODE_HEIGHT = 50;

export class ProcessNode extends MovableChartObject {
    private rect: Rect;
    private text: ChartText;

    public constructor(
        guid: string,
        pos: Point,
        private shortDesc: string,
        private longDesc: string,
    ) {
        super(guid, pos);

        this.rect = new Rect(PROCESS_NODE_WIDTH, PROCESS_NODE_HEIGHT);
        this.text = new ChartText(this.shortDesc, new Color(Colors.red));
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        this.rect.draw(this.pos, context, zoomLevel, true);
        this.text.draw(this.pos, context, 1, 'center');
    }
}
