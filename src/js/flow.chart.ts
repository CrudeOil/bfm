/// <reference path="flow.objects.ts" />


namespace Flow {
    export class Chart {
        // furthest allowed to be zoomed in
        public static MaxZoomLevel = 2;
        // furthest allowed to be zoomed out
        public static MinZoomLevel = 4;

        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;

        // collections of edges and nodes
        private nodes: Flow.Node[];
        private edges: Flow.Edge[];

        private physicsHandler: Flow.PhysicsHandler;
        private graphicsHandler: Flow.GraphicsHandler;
        private controlsHandler: Flow.ControlHandler;

        public constructor(canvasParent: HTMLDivElement, canvas: HTMLCanvasElement) {
            this.canvasParent = canvasParent;
            this.canvas = canvas;

            // needed for some conversion to actual canvas location in mouse events
            let canvasRect = this.canvas.getBoundingClientRect();

            // set dimensions. TODO: update these when window is resized
            canvas.height = canvasParent.clientHeight;
            canvas.width = canvasParent.clientWidth;

            this.nodes = [];
            this.edges = [];

            this.physicsHandler = new PhysicsHandler();
            this.graphicsHandler = new GraphicsHandler(canvas);
            this.controlsHandler = new ControlHandler(this, this.physicsHandler, this.graphicsHandler)

            window.requestAnimationFrame(this.refresh);
        }

        refresh = () => {
            switch (this.controlsHandler.getState()) {
                case Flow.ControlState.viewingNode:
                    this.graphicsHandler.drawNodeView(this.controlsHandler.getViewingNode());
                    break;
                default:
                    let objects = {
                        nodes: this.nodes,
                        edges: this.edges
                    }
                    this.physicsHandler.beforeDraw(objects);
                    this.graphicsHandler.drawGraphView(objects);
                    break;
            }
            window.requestAnimationFrame(this.refresh);
        }

        public addNode(name: string, type: NodeType, x: number, y: number): Node {
            let newNode: Node = new Node(name, type);
            newNode.setPos(x, y);
            this.nodes.push(newNode);
            return newNode;
        }

        public addEdge(n1: Node, n2: Node): Edge {
            let newEdge: Edge = new Edge(n1, n2);
            this.edges.push(newEdge);
            return newEdge;
        }

        public getNodeAt(x: number, y: number): Node {
            let x1, x2, y1, y2: number;
            let canvasPoint: Flow.IPoint;
            let nodeRect: Flow.IRect;

            for (var i = 0; i < this.nodes.length; i++) {
                canvasPoint = this.graphicsHandler.translateToCanvas(this.nodes[i].getPos());
                nodeRect = Node.getRect(canvasPoint, this.graphicsHandler.getScale())
                if (x > nodeRect.x1 && x < nodeRect.x2 && y > nodeRect.y1 && y < nodeRect.y2) {
                    return this.nodes[i];
                }
            }
            return undefined;
        }

        // does not check for existing connection
        public connectSelected(): void {
            let selectedNodes: Flow.Node[] = this.controlsHandler.getSelected()
            for (var i = 0; i < selectedNodes.length; i++) {
                for (var j = i + 1; j < selectedNodes.length; j++) {
                    this.addEdge(selectedNodes[i], selectedNodes[j]);
                }
            }
        }

        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }
    }
}