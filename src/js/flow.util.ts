namespace Flow {
    export class Point {
        public x: number;
        public y: number;

        public constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        public static Dot(p1: Flow.Point, p2: Flow.Point) {
            return p1.x * p2.x + p1.y * p2.y;
        }
    }

    // TODO: use edges instead and draw using polygon fill instead
    export class Rect {
        public x1: number;
        public y1: number;
        public x2: number;
        public y2: number;

        public constructor(x1: number, y1: number, x2: number, y2: number) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }

        public getEdges(): Flow.Point[] {
            // clockwise from top-left
            return [
                {x: this.x1, y: this.y1},
                {x: this.x2, y: this.y1},
                {x: this.x2, y: this.y2},
                {x: this.x2, y: this.y2}
            ]
        }
    }


    export class Vector extends Flow.Point {
        public m: number; // magnitude

        public constructor(x: number, y: number) {
            super(x, y);
            this.m = Math.sqrt(x**2+y**2);
        }

        public static Project(v1: Flow.Vector, v2: Flow.Vector): number {
            return Vector.Dot(v1, new Flow.Point(v2.x / v2.m, v2.y / v2.m));
        }
    }


    export class Util {
        public static GetDist(p1: Point, p2: Point): number {
            return Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
        }
        
    }


    export interface INodeJson {
        description: string,
        type: Flow.NodeType,
        pos?: Flow.Point
    }


    export interface IEdgeJson {
        name: string,
        content: string,
        fromNode: string,
        toNode: string
    }


    export interface IChartJson {
        name: string,
        nodes: {[name: string]: INodeJson},
        edges: IEdgeJson[]
    }
}
