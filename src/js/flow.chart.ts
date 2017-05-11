/// <reference path="flow.objects.ts" />


namespace Flow {
    export class Chart {
        // view scale ViewMultiplier/
        // 2 means zoom will be 0.25, 0.5, 1, 2, 4
        // 3 means zoom will be 0.1, 0.3, 1, 3, 9
        // etc...
        public static ScaleMultiplier = 2;
        // furthest allowed to be zoomed in
        public static MaxZoomLevel = 2;
        // furthest allowed to be zoomed out
        public static MinZoomLevel = 2;

        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;

        // collections of edges and nodes
        // TODO: merge into one dict
        private nodes: Flow.Node[];
        public nodeDict: {[name: string]: Flow.Node};
        private edges: Flow.Edge[];

        private physicsHandler: Flow.PhysicsHandler;
        private graphicsHandler: Flow.GraphicsHandler;
        private controlsHandler: Flow.ControlHandler;

        public constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;

            // needed for some conversion to actual canvas location in mouse events
            let canvasRect = this.canvas.getBoundingClientRect();

            // TODO: update canvas size and width when window is resized
            this.canvas.width = canvas.parentElement.clientWidth;
            this.canvas.height = canvas.parentElement.clientHeight;

            // TODO: merge into one dict
            this.nodes = [];
            this.nodeDict = {};
            this.edges = [];

            this.physicsHandler = new PhysicsHandler();
            this.graphicsHandler = new GraphicsHandler(canvas);
            this.controlsHandler = new ControlHandler(this, this.physicsHandler, this.graphicsHandler)

            window.requestAnimationFrame(this.refresh);
        }

        refresh = () => {
            let objects = {
                nodes: this.nodes,
                edges: this.edges
            }
            this.physicsHandler.beforeDraw(objects);
            this.graphicsHandler.drawGraphView(objects);
            window.requestAnimationFrame(this.refresh);
        }

        public addNode(name: string, type: NodeType, x: number, y: number): Node {
            let newNode: Node = new Node(name, type);
            newNode.setPos(x, y);
            this.nodes.push(newNode);
            this.nodeDict[newNode.name] = newNode;
            return newNode;
        }

        public addNodeFromJson(name: string, node: INodeJson) {
            let nodePos: Flow.IPoint = node.pos ? node.pos : {x:0, y:0}; // default to 0,0 if pos is not set
            let newNode: Flow.Node = this.addNode(name, node.type, nodePos.x, nodePos.y);
            newNode.setDescription(node.description);
        }

        public addEdge(from: Node, to: Node): Edge {
            let newEdge: Edge = new Edge(from, to);
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

        public onNodeDetails = (node: Flow.Node) => {
            console.log(`onNodeDetails called for ${node.name}`);
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

        public static loadChart(canvas: HTMLCanvasElement, chartJson: Flow.IChartJson): Flow.Chart {
            let newChart: Flow.Chart = new Chart(canvas);
            let nodeNames: string[] = Object.keys(chartJson.nodes);
            for (var i = 0; i < nodeNames.length; i++) {
                newChart.addNodeFromJson(nodeNames[i], chartJson.nodes[nodeNames[i]]);
            }
            for (var i = 0; i < chartJson.edges.length; i++) {
                if (chartJson.edges[i].fromNode in newChart.nodeDict && chartJson.edges[i].toNode in newChart.nodeDict) {
                    newChart.addEdge(newChart.nodeDict[chartJson.edges[i].fromNode], newChart.nodeDict[chartJson.edges[i].toNode]);
                }
            }
            return newChart;
        }

        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }
    }
}