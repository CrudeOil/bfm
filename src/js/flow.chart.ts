/// <reference path="flow.objects.ts" />
/// <reference path="flow.chart.loader.ts" />



namespace Flow {
    export class Chart {
        private chartSettings: Flow.IChartSettings;

        private canvas: HTMLCanvasElement;

        // collections of edges and nodes
        public nodes: {[name: string]: Flow.Node};
        private edges: Flow.Edge[];

        private physicsHandler: Flow.PhysicsHandler;
        private graphicsHandler: Flow.GraphicsHandler;
        private controlsHandler: Flow.ControlHandler;

        public constructor(canvas: HTMLCanvasElement, chartSettings: Flow.IChartSettings) {
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

        public addNodeFromJson(name: string, node: INodeJson) {
            let nodePos: Flow.Point = node.pos ? node.pos : new Flow.Point(0,0); // default to 0,0 if pos is not set
            let newNode: Flow.Node = this.addNode(name, node.type, nodePos.x, nodePos.y);
            newNode.setDescription(node.description);
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
            let selectedNodes: Flow.Node[] = this.controlsHandler.getSelected()
            for (var i = 0; i < selectedNodes.length; i++) {
                for (var j = i + 1; j < selectedNodes.length; j++) {
                    this.addEdge(selectedNodes[i], selectedNodes[j], "");
                }
            }
        }

        public static loadChart(canvas: HTMLCanvasElement, chartJson: Flow.IChartJson): Flow.Chart {
            let newChart: Flow.Chart = new Chart(canvas, chartJson.settings);
            let nodeNames: string[] = Object.keys(chartJson.nodes);
            for (var i = 0; i < nodeNames.length; i++) {
                newChart.addNodeFromJson(nodeNames[i], chartJson.nodes[nodeNames[i]]);
            }
            for (var i = 0; i < chartJson.edges.length; i++) {
                if (chartJson.edges[i].fromNode in newChart.nodes && chartJson.edges[i].toNode in newChart.nodes) {
                    newChart.addEdge(
                        newChart.nodes[chartJson.edges[i].fromNode],
                        newChart.nodes[chartJson.edges[i].toNode],
                        chartJson.edges[i].name
                    );
                }
            }
            return newChart;
        }

        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }

        public getSettings(): Flow.IChartSettings {
            return this.chartSettings;
        }
    }
}