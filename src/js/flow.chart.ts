/// <reference path="flow.chart.objects.ts" />
/// <reference path="flow.chart.loader.ts" />



namespace Flow {
    export class Chart {
        private chartSettings: Flow.IChartSettings;

        private canvas: HTMLCanvasElement;

        // collections of edges and nodes
        public nodes: {[name: string]: Flow.Node};
        private edges: Array<Flow.Edge>;

        private physicsHandler: Flow.PhysicsHandler;
        private graphicsHandler: Flow.GraphicsHandler;
        private controlsHandler: Flow.ControlHandler;

        public constructor(canvas: HTMLCanvasElement, chartSettings: Flow.IChartSettings) {
            this.chartSettings = chartSettings;

            this.canvas = canvas;

            // needed for some conversion to actual canvas location in mouse events
            let canvasRect = this.canvas.getBoundingClientRect();

            // TODO: update canvas size and width when window is resized
            this.canvas.width = canvas.parentElement.clientWidth;
            this.canvas.height = canvas.parentElement.clientHeight;

            this.nodes = {};
            this.edges = [];

            this.physicsHandler = new PhysicsHandler(chartSettings.physicsSettings);
            this.graphicsHandler = new GraphicsHandler(canvas, chartSettings.viewSettings);
            this.controlsHandler = new ControlHandler(this, this.physicsHandler, this.graphicsHandler);

            this.graphicsHandler.moveView(this.chartSettings.viewSettings.startPosition);
            this.graphicsHandler.scale(this.chartSettings.viewSettings.zoomMultiplier**(this.chartSettings.viewSettings.startZoomLevel));

            window.requestAnimationFrame(this.refresh);
        }

        refresh = () => {
            let objects = {
                nodes: this.nodes,
                edges: this.edges
            }
            this.physicsHandler.beforeDraw(objects);
            this.graphicsHandler.draw(objects);
            window.requestAnimationFrame(this.refresh);
        }

        public addNode(name: string, type: NodeType, x: number, y: number): Node {
            let newNode: Node = new Node(name, type);
            newNode.setPos(x, y);
            this.nodes[name] = newNode;
            this.nodes[newNode.name] = newNode;
            return newNode;
        }

        public addEdge(from: Node, to: Node, name: string): Edge {
            let newEdge: Edge = new Edge(from, to, name);
            this.edges.push(newEdge);
            return newEdge;
        }

        public getNodeAt(x: number, y: number): Node {
            let x1, x2, y1, y2: number;
            let canvasPoint: Flow.Point;
            let nodeRect: Flow.Rect;

            for (var key of Object.keys(this.nodes)) {
                canvasPoint = this.graphicsHandler.translateToCanvas(this.nodes[key].getPos());
                nodeRect = Node.getRect(canvasPoint, this.graphicsHandler.getScale())
                if (x > nodeRect.x1 && x < nodeRect.x2 && y > nodeRect.y1 && y < nodeRect.y2) {
                    return this.nodes[key];
                }
            }
            return undefined;
        }

        public onNodeDetails = (node: Flow.Node) => {
            console.log(`onNodeDetails called for ${node.name}`);
        }

        public onEdgeDetails = (edge: Flow.Edge) => {
            console.log(`onEdgeDetails called for ${edge.name}`);
        }

        // does not check for existing connection
        public connectSelected(): void {
            let selectedNodes: Array<Flow.Node> = this.controlsHandler.getSelected()
            for (var i = 0; i < selectedNodes.length; i++) {
                for (var j = i + 1; j < selectedNodes.length; j++) {
                    this.addEdge(selectedNodes[i], selectedNodes[j], "");
                }
            }
        }

        public clear(): void {
            this.nodes = {};
            this.edges = [];
        }

        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }

        public setSettings(settings: Flow.IChartSettings) {
            this.chartSettings = settings;
            this.physicsHandler.setSettings(settings.physicsSettings);
            this.graphicsHandler.setSettings(settings.viewSettings);
        }

        public getSettings(): Flow.IChartSettings {
            return this.chartSettings;
        }

        public getJson(): string {
            let nodes: {[name: string]: Flow.INodeJson} = {};
            for (var node in this.nodes) {
                nodes[node] = this.nodes[node].getJson();
            }

            let edges: Array<Flow.IEdgeJson> = [];
            for (var i in this.edges) {
                edges.push({
                    name: this.edges[i].name,
                    description: this.edges[i].description,
                    fromNode: this.edges[i].fromNode.name,
                    toNode: this.edges[i].toNode.name
                })
            }

            let chartJson: Flow.IChartJson = {
                settings: this.chartSettings,
                nodes: nodes,
                edges: edges
            }
            return JSON.stringify(chartJson, undefined, '    ');
        }
    }
}
