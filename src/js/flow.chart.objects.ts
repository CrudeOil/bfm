/// <reference path="flow.util.ts" />


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
            let dx = n1.getPos().x - n2.getPos().x;
            let dy = n1.getPos().y - n2.getPos().y;
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
    }
}