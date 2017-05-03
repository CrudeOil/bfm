/// <reference path="flow.chart.objects.ts" />


namespace Flow {
    export class Chart {
        // furthest allowed to be zoomed in
        public static MaxZoomLevel = 2;
        // furthest allowed to be zoomed out
        public static MinZoomLevel = 4;

        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        // collections of edges and nodes
        private nodes: Flow.Node[];
        private edges: Flow.Edge[];

        // vars for drawing stuff on canvas relative to view
        private viewOffset: {x:number,y:number};
        private viewScale: number;

        // movement of canvas and nodes
        private canvasDrag: boolean = false;
        private canvasDragStart: {x:number, y:number};
        private nodeDrag: boolean = false;
        private nodeDragStart: {x:number, y:number};
        private selectedNodes: Node[] = []

        public constructor(canvasParent: HTMLDivElement, canvas: HTMLCanvasElement) {
            this.canvasParent = canvasParent;
            this.canvas = canvas;

            // needed for some conversion to actual canvas location in mouse events
            let canvasRect = this.canvas.getBoundingClientRect();

            // set dimensions. TODO: update these when window is resized
            canvas.height = canvasParent.clientHeight;
            canvas.width = canvasParent.clientWidth;

            // stuff we want to happen on mousedown:
            // * start dragging canvas if not on node
            // * start dragging node(s) if on node
            canvas.onmousedown = (e: MouseEvent) => {
                let x = e.clientX - canvasRect.left;
                let y = e.clientY - canvasRect.top;
                let clickedNode = this.getNodeAt(x, y);
                if (clickedNode) {
                    this.nodeDragStart = {x: e.x, y: e.y}
                }else{
                    this.canvasDrag = true;
                    this.canvasDragStart = {x: e.x, y: e.y}
                }
            };
            // stuff we want to happen on mouse up:
            // * stop dragging canvas if we were dragging canvas
            // * stop dragging nodes if we were dragging nodes
            // * if neither, select:
            //   * a node if clicked on node and shift not pressed
            //   * add a node to selection if clicked on node and shift pressed
            //   * set state of selected nodes to selected
            // * or deselect:
            //   * all nodes if not clicked on node
            //   * all other nodes if clicked on node and shift was not pressed
            //   * set state of deselected nodes to active
            // TODO: clean up, works but is probably messy
            // TODO: comment anything that isn't self-explanatory
            canvas.onmouseup = (e: MouseEvent) => {
                let x = e.clientX - canvasRect.left;
                let y = e.clientY - canvasRect.top;
                let clickedNode = this.getNodeAt(x, y);
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

            // stuff we want to happen when mouse leaves the screen:
            // * stop dragging everything
            canvas.onmouseleave = () => {
                this.canvasDrag = false;
                this.nodeDrag = false;
                for (var i = 0; i < this.selectedNodes.length; i++) {
                    this.selectedNodes[i].setState(NodeState.selected);
                }
            };
            // stuff we want to happen when mouse moves:
            // * if dragging canvas, adjust the drag offset
            // * if dragging nodes, move the nodes
            // TODO: Multi-select?
            canvas.onmousemove = (e: MouseEvent) => {
                if (this.canvasDrag) {
                    this.viewOffset.x += e.movementX;
                    this.viewOffset.y += e.movementY;
                }
                if (this.nodeDrag) {
                    for (var i = 0; i < this.selectedNodes.length; i++) {
                        // moving the actual nodes. speed is adjusted by zoomscale
                        // should always be true to mouse movement
                        this.selectedNodes[i].move(e.movementX / this.viewScale, e.movementY / this.viewScale, true);
                    }
                }else{
                    let x = e.clientX - canvasRect.left;
                    let y = e.clientY - canvasRect.top;
                    let clickedNode = this.getNodeAt(x, y);

                    // only do this stuff while left mouse button is held down
                    // also only do this when we moved a certain amount TODO: make this work, I don't think this works
                    // TODO: change to right mouse button along with multi-select?
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

            // do the zooming business
            canvas.onmousewheel = (e: WheelEvent) => {
                let dOrigin: IPoint = {
                    x: this.viewOffset.x - canvas.clientWidth / 2,
                    y: this.viewOffset.y - canvas.clientHeight / 2
                }

                if (e.wheelDelta === 120) { // mwheelup
                    if (this.viewScale < 2**Chart.MaxZoomLevel) {
                        this.viewScale *= 2;
                        this.viewOffset.x += dOrigin.x;
                        this.viewOffset.y += dOrigin.y;
                    }
                }else{ // mwheeldown
                    if (this.viewScale > 2**-Chart.MinZoomLevel) {
                        this.viewOffset.x -= dOrigin.x/2;
                        this.viewOffset.y -= dOrigin.y/2;
                        this.viewScale /= 2
                    }
                }
            };

            this.ctx = canvas.getContext("2d");

            this.nodes = [];
            this.edges = [];

            this.viewOffset = {
                x: this.canvas.clientWidth/2,
                y: this.canvas.clientHeight/2
            };
            this.viewScale = 1;

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

        public translateToCanvas(p: IPoint): IPoint {
            return {
                x: p.x * this.viewScale + this.viewOffset.x,
                y: p.y * this.viewScale + this.viewOffset.y
            }
        }

        public getNodeAt(x: number, y: number): Node {
            let x1, x2, y1, y2: number;
            let canvasPoint: IPoint;

            for (var i = 0; i < this.nodes.length; i++) {
                canvasPoint = this.translateToCanvas(this.nodes[i].getPos());
                x1 = canvasPoint.x - Node.Width / 2 * this.viewScale;
                x2 = x1 + Node.Width*this.viewScale;
                y1 = canvasPoint.y - Node.Height / 2 * this.viewScale;
                y2 = y1 + Node.Height*this.viewScale;
                if (x > x1 && x < x2 && y > y1 && y < y2) {
                    return this.nodes[i];
                }
            }
            return undefined;
        }

        private beforeDraw = () => {
            var springForces: number[];
            for (var i = 0; i < this.edges.length; i++) {
                springForces = Edge.CalculateSpring(
                    this.edges[i].getNodes()[0],
                    this.edges[i].getNodes()[1]
                );
                this.edges[i].getNodes()[0].move(springForces[1], springForces[2]);
                this.edges[i].getNodes()[1].move(-springForces[1], -springForces[2]);
            }

            for (var i = 0; i < this.nodes.length; i++) {
                for (var j = i+1; j < this.nodes.length; j++) {
                    springForces = Edge.CalculateSpring(
                        this.nodes[i],
                        this.nodes[j],
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
                let firstNodePos = this.edges[i].getNodes()[0].getPos();
                let secondNodePos = this.edges[i].getNodes()[1].getPos();

                this.ctx.strokeStyle = this.edges[i].color;
                this.ctx.beginPath();
                this.ctx.moveTo(
                    this.translateToCanvas(firstNodePos).x,
                    this.translateToCanvas(firstNodePos).y
                );
                this.ctx.lineTo(
                    this.translateToCanvas(secondNodePos).x,
                    this.translateToCanvas(secondNodePos).y
                );
                this.ctx.stroke();
            }

            for (var i = 0; i < this.nodes.length; i++) {
                let nodePos = this.translateToCanvas(this.nodes[i].getPos());
                this.ctx.fillStyle = this.nodes[i].getColor();
                this.ctx.fillRect(
                    nodePos.x - Node.Width / 2 * this.viewScale,
                    nodePos.y - Node.Height / 2 * this.viewScale,
                    Node.Width * this.viewScale,
                    Node.Height * this.viewScale
                );
                this.ctx.strokeText(
                    this.nodes[i].name,
                    nodePos.x - Node.Height / 2 * this.viewScale + 10,
                    nodePos.y
                );
            }
            this.ctx.strokeText(`x: ${this.viewOffset.x - this.canvas.clientWidth/2}`, 100, 10);
            this.ctx.strokeText(`y: ${this.viewOffset.y - this.canvas.clientHeight/2}`, 100, 30);
            this.ctx.strokeText(`offsx: ${this.viewOffset.x}`, 100, 50);
            this.ctx.strokeText(`offsy: ${this.viewOffset.y}`, 100, 70);
            this.ctx.strokeText(`zoom: ${this.viewScale}x`, 100, 90);
            this.ctx.strokeText("Press 'a' to add node", 100, 110);
            this.ctx.strokeText("Press 'b' to add node and connect to last", 100, 130);
            this.ctx.strokeText("Press 'c' to connect nodes", 100, 150);

            this.afterDraw();
        }

        private afterDraw = () => {
            window.requestAnimationFrame(this.beforeDraw);
        }
    }
}