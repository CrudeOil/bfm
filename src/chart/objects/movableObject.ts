import { Point } from '../../common/point';
import { UnimplementedError } from '../../common/errors';
import { ChartObject } from './object';

export class MovableChartObject extends ChartObject {
    public constructor(
        guid: string,
        public pos: Point
    ) {
        super(guid);
    }

    public setPos(pos: Point) {
        this.pos = pos;
    }
}
