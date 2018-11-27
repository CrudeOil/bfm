import { Point } from '../../common/point';
import { UnimplementedError } from '../../common/errors';

export class ChartObject {
    public constructor(
        private guid: string,
        public pos: Point
    ) {
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        throw new UnimplementedError();
    }

    public setPos(pos: Point) {
        this.pos = pos;
    }

    public getGuid(): string {
        return this.guid;
    }
}
