import { UnimplementedError } from '../common/errors';
import { Point } from '../common/point';

export class Graphic {
    public draw(pos: Point, context: CanvasRenderingContext2D, zoomLevel: number) {
        throw new UnimplementedError();
    }
}
