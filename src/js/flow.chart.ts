/// <reference path="flow.chart.objects.ts" />


namespace Flow {
    export class Chart {

        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        // collections of edges and nodes
        private nodes: Flow.Node[];
        private edges: Flow.Edge[];

        // vars for drawing stuff on canvas relative to view
        private dragOffset: {x:number,y:number};
        private zoomScale: number;

        // movement of canvas and nodes
        private canvasDrag: boolean = false;
        private canvasDragStart: {x:number, y:number};
        private nodeDrag: boolean = false;
        private nodeDragStart: {x:number, y:number};
        private selectedNodes: Node[] = []

        public constructor(canvasParent: HTMLDivElement, canvas: HTMLCanvasElement) {
            this.canvasParent = canvasParent;
            this.canvas = canvas;
            canvas.height = canvasParent.clientHeight;
            canvas.width = canvasParent.clientWidth;
            canvas.onmousedown = (e: MouseEvent) => {
                let canvasRect = this.canvas.getBoundingClientRect();
                let x = e.clientX - canvasRect.left;
                let y = e.clientY - canvasRect.top;
                let clickedNode = Node.GetNodeAt(x, y, this.nodes, this.dragOffset, this.zoomScale);
                if (clickedNode) {
                    this.nodeDragStart = {x: e.x, y: e.y}
                }else{
                    this.canvasDrag = true;
                    this.canvasDragStart = {x: e.x, y: e.y}
                }
            };
            canvas.onmouseup = (e: MouseEvent) => {
                let canvasRect = this.canvas.getBoundingClientRect();
                let x = e.clientX - canvasRect.left;
                let y = e.clientY - canvasRect.top;
                let clickedNode = Node.GetNodeAt(x, y, this.nodes, this.dragOffset, this.zoomScale);
                this.canvasDrag = false;
                for (var i = 0; i < this.selectedNodes.length; i++) {
                    this.selectedNodes[i].setState(NodeState.selected);
                }
                if (clickedNode && !this.nodeDrag) {
                    if (e.shiftKey) {
                        var i = this.selectedNodes.indexOf(clickedNode);
                        if (i === -1) {
                            this.selectedNodes.push(clickedNode);
                            clickedNode.setState(NodeState.selected);
                        }else{
                            this.selectedNodes.splice(i, 1);
                            clickedNode.setState(NodeState.active);
                        }
                    }else{
                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            this.selectedNodes[i].setState(NodeState.active);
                        }
                        this.selectedNodes = [clickedNode];
                        clickedNode.setState(NodeState.selected);
                    }
                }else{
                    this.nodeDrag = false;
                    if(this.canvasDragStart.x === e.x && this.canvasDragStart.y === e.y && !e.shiftKey) {
                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            this.selectedNodes[i].setState(NodeState.active);
                        }
                        this.selectedNodes = [];
                    }
                }
            };
            canvas.onmouseleave = () => {
                this.canvasDrag = false;
                this.nodeDrag = false;
                for (var i = 0; i < this.selectedNodes.length; i++) {
                    this.selectedNodes[i].setState(NodeState.selected);
                }
            };
            canvas.onmousemove = (e: MouseEvent) => {
                if (this.canvasDrag) {
                    this.dragOffset.x += e.movementX;
                    this.dragOffset.y += e.movementY;
                }
                if (this.nodeDrag) {
                    for (var i = 0; i < this.selectedNodes.length; i++) {
                        this.selectedNodes[i].move(e.movementX / this.zoomScale, e.movementY / this.zoomScale, true);
                    }
                }else{
                    let canvasRect = this.canvas.getBoundingClientRect();
                    let x = e.clientX - canvasRect.left;
                    let y = e.clientY - canvasRect.top;
                    let clickedNode = Node.GetNodeAt(x, y, this.nodes, this.dragOffset, this.zoomScale);

                    if (clickedNode && e.buttons === 1 && (e.x - this.nodeDragStart.x < 5 || e.y - this.nodeDragStart.y)) {
                        this.nodeDrag = true;

                        var i = this.selectedNodes.indexOf(clickedNode);
                        if (i === -1) {
                            for (var i = 0; i < this.selectedNodes.length; i++) {
                                this.selectedNodes[i].setState(NodeState.active);
                            }
                            this.selectedNodes = [clickedNode];
                            clickedNode.setState(NodeState.selected);
                        }

                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            this.selectedNodes[i].setState(NodeState.dragging);
                            this.selectedNodes[i].move(e.x - this.nodeDragStart.x, e.y - this.nodeDragStart.y, true);
                        }
                    }
                }
            };
            canvas.onmousewheel = (e: WheelEvent) => {
                if (e.wheelDelta === 120) {
                    this.zoomScale *= 2;
                }else{
                    this.zoomScale /= 2
                }
            };

            this.ctx = canvas.getContext("2d");

            this.nodes = [];
            this.edges = [];

            this.dragOffset = {
                x: this.canvas.width/2,
                y: this.canvas.height/2
            };
            this.zoomScale = 1;

            window.requestAnimationFrame(this.draw);
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

        // does not check for existing connection
        public connectSelected(): void {
            for (var i = 0; i < this.selectedNodes.length; i++) {
                for (var j = i + 1; j < this.selectedNodes.length; j++) {
                    this.addEdge(this.selectedNodes[i], this.selectedNodes[j]);
                }
            }
        }

        private beforeDraw = () => {
            var springForces: number[];
            for (var i = 0; i < this.edges.length; i++) {
                springForces = Edge.CalculateSpring(
                    this.edges[i].getNodes()[0],
                    this.edges[i].getNodes()[1],
                    this.zoomScale
                );
                this.edges[i].getNodes()[0].move(springForces[1], springForces[2]);
                this.edges[i].getNodes()[1].move(-springForces[1], -springForces[2]);
            }

            for (var i = 0; i < this.nodes.length; i++) {
                for (var j = i+1; j < this.nodes.length; j++) {
                    springForces = Edge.CalculateSpring(
                        this.nodes[i],
                        this.nodes[j],
                        this.zoomScale,
                        true
                    );
                    this.nodes[i].move(springForces[1], springForces[2]);
                    this.nodes[j].move(-springForces[1], -springForces[2]);
                }
            }
            this.draw();
        }

        private draw = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < this.edges.length; i++ ) {
                this.ctx.strokeStyle = this.edges[i].color;
                this.ctx.beginPath();
                this.ctx.moveTo(
                    this.edges[i].getNodes()[0].getPosX() * this.zoomScale + this.dragOffset.x,
                    this.edges[i].getNodes()[0].getPosY() * this.zoomScale + this.dragOffset.y
                );
                this.ctx.lineTo(
                    this.edges[i].getNodes()[1].getPosX() * this.zoomScale + this.dragOffset.x,
                    this.edges[i].getNodes()[1].getPosY() * this.zoomScale + this.dragOffset.y
                );
                this.ctx.stroke();
            }

            for (var i = 0; i < this.nodes.length; i++) {
                this.ctx.fillStyle = this.nodes[i].getColor();
                this.ctx.fillRect(
                    this.nodes[i].getPosX() * this.zoomScale + this.dragOffset.x - Node.Width / 2 * this.zoomScale,
                    this.nodes[i].getPosY() * this.zoomScale + this.dragOffset.y - Node.Height / 2 * this.zoomScale,
                    Node.Width * this.zoomScale,
                    Node.Height * this.zoomScale
                );
                this.ctx.strokeText(
                    this.nodes[i].name,
                    this.nodes[i].getPosX() * this.zoomScale + this.dragOffset.x - Node.Height / 2 * this.zoomScale + 10,
                    this.nodes[i].getPosY() * this.zoomScale + this.dragOffset.y
                );
            }
            this.ctx.strokeText("Press 'a' to add node", 100, 50);
            this.ctx.strokeText("Press 'b' to add node and connect to last", 100, 70);
            this.ctx.strokeText("Press 'c' to connect nodes", 100, 90);

            this.afterDraw();
        }

        private afterDraw = () => {
            window.requestAnimationFrame(this.beforeDraw);
        }
    }
}