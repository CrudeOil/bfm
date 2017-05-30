/// <reference path="flow.util.ts" />


namespace Flow {
    export interface Objects {
        nodes: {[name: string]: Flow.Node},
        edges: Edge[]
    }
    
    export class Node {
        public static GraphWidth = 100;
        public static GraphHeight = 60;
        public static ViewWidth = 500;
        public static ViewHeight = 200;

        name: string;
        description: string;
        type: NodeType;
        pos: Point;
        color: string|CanvasGradient|CanvasPattern;
        state: NodeState;

        public constructor(name: string, type: NodeType, color = "#0000FF") {
            this.name = name;
            this.description = "This object does not have a description.";
            this.type = type;
            this.pos = {x:0,y:0};
            this.state = NodeState.active;
            this.color = color;
        }

        public getPos(): Point {
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

        public getSize(): Flow.Point {
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

        public static getRect(p: Flow.Point, scale: number): Flow.Rect {
            return new Flow.Rect(
                p.x - Node.GraphWidth / 2 * scale,
                p.y - Node.GraphHeight / 2 * scale,
                p.x + Node.GraphWidth / 2 * scale,
                p.y + Node.GraphHeight / 2 * scale
            );
        }

        public setDescription(description: string) {
            this.description = description;
        }

        public getDetails(): string {
            return `# ${this.name}\n${this.description}`;
        }

        // TODO: make proper
        public getJson(): Flow.INodeJson {
            return {
                description: this.description,
                type: this.type,
                pos: this.pos
            }
        }
    }

    export class Edge {
        public static ArrowHeadLength = 20;
        public static ArrowHeadWidth = 10;

        name: string;
        description: string;
        fromNode: Node;
        toNode: Node;
        color: string|CanvasGradient|CanvasPattern;

        public constructor(fromNode: Node, toNode: Node, name: string, color: string = "#FFFFFF") {
            this.name = name;
            this.description = "This object does not have a description.";
            this.fromNode = fromNode;
            this.toNode = toNode;
            this.color = color;
        }

        public getNodes(): Node[] {
            return [this.fromNode, this.toNode];
        }

        // TODO: make proper
        public getJson(): Flow.IEdgeJson {
            return {
                name: this.name,
                description: this.description,
                fromNode: this.fromNode.name,
                toNode: this.toNode.name
            }
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
}