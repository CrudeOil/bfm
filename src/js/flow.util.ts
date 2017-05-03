namespace Flow {
    export interface IPoint {
        x: number,
        y: number
    }
    export class Util {
        public static GetDist(p1: IPoint, p2: IPoint): number {
            return Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
        }
    }
}