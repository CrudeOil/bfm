/// <reference path="flow.chart.util.ts" />


namespace Flow {
    export interface IObjects {
        nodes: {[name: string]: Flow.ChartNode},
        edges: Array<ChartEdge>
    }
    
    export abstract class ChartObject {
        protected name: string;
        protected description: string;
        protected pos: Flow.Point;

        public constructor(name: string) {
            this.name = name;
            this.pos = {x:0,y:0};
        }

        public getName(): string {
            return this.name;
        }

        public getDescription(): string {
            return this.description;
        }

        public getPos(): Point {
            return this.pos;
        }

        public setName(name: string): void {
            this.name = name;
        }

        public setDescription(description: string): void {
            this.description = description;
        }

        public setPos(x: number, y: number): void {
            this.pos.x = x;
            this.pos.y = y;
        }

        public move(dx: number, dy: number): void {
            this.pos.x += dx;
            this.pos.y += dy;
        }

        public abstract getCollisionBox(): Flow.Rect;

        public abstract onMouseEnter(): void;

        public abstract onMouseLeave(): void;

        public abstract onClick(): void;
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

    export class ChartNode extends Flow.ChartObject {
        public static GRAPHWIDTH = 100;
        public static GRAPHHEIGHT = 60;
        public static VIEWWIDTH = 500;
        public static VIEWHEIGHT = 200;

        type: NodeType;
        color: string|CanvasGradient|CanvasPattern;
        state: NodeState;

        public constructor(name: string, type: NodeType, color = "#0000FF") {
            super(name);
            this.description = "This object does not have a description.";
            this.type = type;
            this.state = NodeState.active;
            this.color = color;
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
                        x: Flow.ChartNode.VIEWWIDTH,
                        y: Flow.ChartNode.VIEWHEIGHT
                    }
                default:
                    return {
                        x: Flow.ChartNode.GRAPHWIDTH,
                        y: Flow.ChartNode.GRAPHHEIGHT
                    }
            }
        }

        public static getRect(p: Flow.Point, scale: number): Flow.Rect {
            return new Flow.Rect(
                p.x - ChartNode.GRAPHWIDTH / 2 * scale,
                p.y - ChartNode.GRAPHHEIGHT / 2 * scale,
                p.x + ChartNode.GRAPHWIDTH / 2 * scale,
                p.y + ChartNode.GRAPHHEIGHT / 2 * scale
            );
        }

        
        public move(dx: number, dy: number, ignoreState = false) {
            if (ignoreState || (this.state !== NodeState.dragging)) {
                super.move(dx, dy);
            }
        }

        public getJson(): Flow.INodeJson {
            return {
                description: this.description,
                type: this.type,
                pos: this.pos
            }
        }

        public getCollisionBox(): Flow.Rect {
            return new Flow.Rect(0,0,0,0);
        }

        public onMouseEnter(): void {

        }

        public onMouseLeave(): void {

        }

        public onClick(): void {
            
        }
    }

    export class ChartEdge extends Flow.ChartObject {
        public static ARROWHEADLENGTH = 20;
        public static ARROWHEADWIDTH = 10;

        fromNode: ChartNode;
        toNode: ChartNode;
        color: string|CanvasGradient|CanvasPattern;

        public constructor(fromNode: ChartNode, toNode: ChartNode, name: string, color: string = "#FFFFFF") {
            super(name);
            this.fromNode = fromNode;
            this.toNode = toNode;
            this.color = color;
        }

        public getNodes(): Array<ChartNode> {
            return [this.fromNode, this.toNode];
        }

        // TODO: make proper
        public getJson(): Flow.IEdgeJson {
            return {
                name: this.name,
                description: this.description,
                fromNode: this.fromNode.getName(),
                toNode: this.toNode.getName()
            }
        }

        public getCollisionBox(): Flow.Rect {
            return new Flow.Rect(0,0,0,0);
        }

        public onMouseEnter(): void {

        }

        public onMouseLeave(): void {

        }

        public onClick(): void {
            
        }
    }
}
