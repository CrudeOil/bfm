/// <reference path="flow.util.ts" />


namespace Flow {
    export interface Objects {
        nodes: Node[],
        edges: Edge[]
    }

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
        pos: IPoint;
        state: NodeState;

        public constructor(name: string, type: NodeType) {
            this.name = name;
            this.type = type;
            this.pos = {x:0,y:0};
            this.state = NodeState.active;
        }

        public getPos(): IPoint {
            return this.pos;
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

        public setPos(x: number, y: number): void {
            this.pos.x = x;
            this.pos.y = y;
        }

        public move(dx: number, dy: number, ignoreState = false): void {
            if (ignoreState || (this.state !== NodeState.dragging)) {
                this.pos.x += dx;
                this.pos.y += dy;
            }
        }

        public static getRect(p: Flow.IPoint, scale: number): Flow.IRect {
            return {
                x1: p.x - Node.Width / 2 * scale,
                y1: p.y - Node.Width / 2 * scale,
                x2: p.x + Node.Width / 2 * scale,
                y2: p.y + Node.Height / 2 * scale
            }
        }
    }
}