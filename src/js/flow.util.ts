namespace Flow {
    export interface IPoint {
        x: number,
        y: number
    }
    export interface IRect {
        x1: number,
        y1: number,
        x2: number,
        y2: number
    }
    export class Util {
        public static GetDist(p1: IPoint, p2: IPoint): number {
            return Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
        }
    }
}
