namespace Flow {
    export class Edge {
        public static SpringFriction = 1;
        public static SpringStrength = 0.5;
        public static SpringLength = 250;

        nodes: Node[];
        color: string|CanvasGradient|CanvasPattern;

        public constructor(n0: Node, n1: Node, color: string = "#FFFFFF") {
            this.nodes = [];
            this.nodes[0] = n0;
            this.nodes[1] = n1;
            this.color = color;
        }

        public getNodes(): Node[] {
            return [this.nodes[0], this.nodes[1]];
        }

        public static CalculateSpring(n1: Node, n2: Node, zoomScale = 1, repelOnly = false): number[] {
            let dx = n1.getPosX() - n2.getPosX();
            let dy = n1.getPosY() - n2.getPosY();
            let d = Math.sqrt(dx**2 + dy**2);

            if (d === 0) {
                d = 1;
                dx = 1;
                dy = 0;
            }

            d = Math.abs(d);

            let f = 0;
            let fx = 0;
            let fy = 0;

            if (d > 10 && !(repelOnly && Edge.SpringLength - d < 0)) {
                f = (Edge.SpringLength - d) * Edge.SpringStrength;
                fx = ((dx / d) * f) / 2;
                fy = ((dy / d) * f) / 2;
            }


            return [f, fx, fy];
        }
    }

    export enum NodeType {
        data,
        application,
        other
    }

    export enum NodeState {
        active,
        disabled,
        dragging,
        selected
    }

    export class Node {
        public static Width = 100;
        public static Height = 60;

        name: string;
        type: NodeType;
        pos: number[];
        state: NodeState;

        public constructor(name: string, type: NodeType) {
            this.name = name;
            this.type = type;
            this.pos = [0,0,0];
            this.state = NodeState.active;
        }

        public getPosX(): number {
            return this.pos[0];
        }

        public getPosY(): number {
            return this.pos[1];
        }

        public getZ(): number {
            return this.pos[2];
        }

        public setState(state: NodeState) {
            this.state = state;
        }

        public getState(): NodeState {
            return this.state;
        }

        public getColor(): string|CanvasGradient|CanvasPattern {
            switch(this.state) {
                case NodeState.active:
                    return "#0000FF";
                case NodeState.disabled:
                    return "#A5A5A5";
                case NodeState.dragging:
                    return "#0000A5";
                case NodeState.selected:
                    return "#A5A5FF";
                default:
                    return "#FF0000";
            }
        }

        public setPos(x: number, y: number, z?: number): void {
            this.pos[0] = x;
            this.pos[1] = y;
            this.pos[2] = z? z : this.pos[2];
        }

        public move(dx: number, dy: number, ignoreState = false): void {
            if (ignoreState || (this.state !== NodeState.dragging)) {
                this.pos[0] += dx;
                this.pos[1] += dy;
            }
        }

        public static GetNodeAt(x: number, y: number, nodes: Node[], dragOffset: {x:number, y:number}, zoomScale: number): Node {
            let x1, x2, y1, y2: number;

            for (var i = 0; i < nodes.length; i++) {
                x1 = nodes[i].getPosX() * zoomScale + dragOffset.x - Node.Width / 2 * zoomScale;
                x2 = x1 + Node.Width*zoomScale;
                y1 = nodes[i].getPosY() * zoomScale + dragOffset.y - Node.Height / 2 * zoomScale;
                y2 = y1 + Node.Height*zoomScale;
                if (x > x1 && x < x2 && y > y1 && y < y2) {
                    return nodes[i];
                }
            }
            return undefined;
        }

        public toString() {
            return `name: ${this.name}, x: ${this.getPosX()}, y: ${this.getPosY()}`;
        }
    }
}