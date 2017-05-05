/// <reference path="flow.util.ts" />


namespace Flow {
    export interface Objects {
        nodes: Node[],
        edges: Edge[]
    }

    export class Edge {
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
        selected,
        viewing
    }

    export class Node {
        public static GraphWidth = 100;
        public static GraphHeight = 60;
        public static ViewWidth = 500;
        public static ViewHeight = 200;

        name: string;
        type: NodeType;
        pos: IPoint;
        color: string|CanvasGradient|CanvasPattern;
        state: NodeState;

        public constructor(name: string, type: NodeType, color = "#0000FF") {
            this.name = name;
            this.type = type;
            this.pos = {x:0,y:0};
            this.state = NodeState.active;
            this.color = color;
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
                    return this.color;
                case NodeState.disabled:
                    return "#A5A5A5";
                case NodeState.dragging:
                    return "#0000A5";
                case NodeState.selected:
                    return "#A5A5FF";
                case NodeState.viewing:
                    return this.color;
                default:
                    return "#FF0000";
            }
        }

        public getSize(): Flow.IPoint {
            switch (this.state) {
                case Flow.NodeState.viewing:
                    return {
                        x: Flow.Node.ViewWidth,
                        y: Flow.Node.ViewHeight
                    }
                default:
                    return {
                        x: Flow.Node.GraphWidth,
                        y: Flow.Node.GraphHeight
                    }
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
                x1: p.x - Node.GraphWidth / 2 * scale,
                y1: p.y - Node.GraphHeight / 2 * scale,
                x2: p.x + Node.GraphWidth / 2 * scale,
                y2: p.y + Node.GraphHeight / 2 * scale
            }
        }
    }
}