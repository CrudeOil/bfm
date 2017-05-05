/// <reference path="flow.chart.physics.ts" />
/// <reference path="flow.chart.graphics.ts" />


namespace Flow {
    export enum ControlState {
        idle,
        draggingCanvas,
        draggingNode,
        viewingNode,
        viewingEdge
    }

    export class ControlHandler {
        private canvas: HTMLCanvasElement;
        private canvasRect: ClientRect;

        // movement of canvas and nodes
        private canvasDragStart: {x:number, y:number};
        private nodeDragStart: {x:number, y:number};
        private selectedNodes: Flow.Node[] = []
        private viewingNode: Flow.Node;
        private viewingEdge: Flow.Edge;
        
        private state: Flow.ControlState;

        private lastClick: number;

        constructor(
            chart: Flow.Chart,
            physicsHandler: Flow.PhysicsHandler,
            graphicsHandler: Flow.GraphicsHandler
            ) {
            this.canvas = chart.getCanvas();
            this.canvasRect = this.canvas.getBoundingClientRect();

            this.state = Flow.ControlState.idle;

            // stuff we want to happen on mousedown:
            // * start dragging canvas if not on node
            // * start dragging node(s) if on node
            this.canvas.onmousedown = (e: MouseEvent) => {
                if (this.state === Flow.ControlState.idle) {
                    let x = e.clientX - this.canvasRect.left;
                    let y = e.clientY - this.canvasRect.top;
                    let clickedNode = chart.getNodeAt(x, y);
                    if (clickedNode) {
                        this.nodeDragStart = {x: e.x, y: e.y}
                    }else{
                        this.state = Flow.ControlState.draggingCanvas;
                        this.canvasDragStart = {x: x, y: y}
                    }
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
            this.canvas.onmouseup = (e: MouseEvent) => {
                let x = e.clientX - this.canvasRect.left;
                let y = e.clientY - this.canvasRect.top;
                
                let clickedNode = chart.getNodeAt(x, y);

                switch (this.state) {
                    case Flow.ControlState.idle:
                        if (clickedNode) {
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
                                if (this.lastClick && Date.now() - this.lastClick < 500) {
                                    clickedNode.setState(NodeState.viewing);
                                    this.viewingNode = clickedNode;
                                    this.state = Flow.ControlState.viewingNode;
                                    this.lastClick = undefined;
                                }else{
                                    clickedNode.setState(NodeState.selected);
                                    this.lastClick = Date.now();
                                }
                            }
                        }else{
                            if(!e.shiftKey) {
                                for (var i = 0; i < this.selectedNodes.length; i++) {
                                    this.selectedNodes[i].setState(NodeState.active);
                                }
                                this.selectedNodes = [];
                            }
                        }
                        break;
                    case Flow.ControlState.draggingCanvas:
                        if (this.canvasDragStart.x === x && this.canvasDragStart.y === y) {
                            console.log("wow!");
                            for (var i = 0; i < this.selectedNodes.length; i++) {
                                this.selectedNodes[i].setState(NodeState.active);
                                this.selectedNodes = [];
                            }
                        }
                        this.state = Flow.ControlState.idle;
                        break;
                    case Flow.ControlState.draggingNode:
                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            this.selectedNodes[i].setState(NodeState.selected);
                        }
                        this.state = Flow.ControlState.idle;
                        break;
                    case Flow.ControlState.viewingEdge:

                        break;
                    case Flow.ControlState.viewingNode:

                        break;
                }

            };

            // stuff we want to happen when mouse leaves the screen:
            // * stop dragging everything
            this.canvas.onmouseleave = () => {
                switch (this.state) {
                    case Flow.ControlState.draggingCanvas:
                        this.state = Flow.ControlState.idle;
                        break;
                    case Flow.ControlState.draggingNode:
                        this.state = Flow.ControlState.idle;
                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            this.selectedNodes[i].setState(NodeState.selected);
                        }
                        break;
                }
            };

            // stuff we want to happen when mouse moves:
            // * if dragging canvas, adjust the drag offset
            // * if dragging nodes, move the nodes
            // TODO: Multi-select?
            this.canvas.onmousemove = (e: MouseEvent) => {
                switch (this.state) {
                    case Flow.ControlState.draggingCanvas:
                        graphicsHandler.moveView({
                            x: e.movementX,
                            y: e.movementY
                        });
                        break;
                    case Flow.ControlState.draggingNode:
                        for (var i = 0; i < this.selectedNodes.length; i++) {
                            // moving the actual nodes. speed is adjusted by zoomscale
                            // should always be true to mouse movement
                            this.selectedNodes[i].move(e.movementX / graphicsHandler.getScale(), e.movementY / graphicsHandler.getScale(), true);
                        }
                        break;
                    case Flow.ControlState.idle:
                        let x = e.clientX - this.canvasRect.left;
                        let y = e.clientY - this.canvasRect.top;
                        let clickedNode = chart.getNodeAt(x, y);

                        // only do this stuff while left mouse button is held down
                        // also only do this when we moved a certain amount TODO: make this work, I don't think this works
                        // TODO: change to right mouse button along with multi-select?
                        if (clickedNode && e.buttons === 1 && (e.x - this.nodeDragStart.x < 5 || e.y - this.nodeDragStart.y < 5)) {
                            this.state = Flow.ControlState.draggingNode;

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
                        break;
                }
            };

            // do the zooming business
            this.canvas.onmousewheel = (e: WheelEvent) => {
                let dOrigin: IPoint = {
                    x: graphicsHandler.getViewOffset().x - this.canvas.clientWidth / 2,
                    y: graphicsHandler.getViewOffset().y - this.canvas.clientHeight / 2
                }

                if (e.wheelDelta === 120) { // mwheelup
                    if (graphicsHandler.getScale() < 2**Chart.MaxZoomLevel) {
                        graphicsHandler.scale(2);
                        graphicsHandler.moveView({
                            x: dOrigin.x,
                            y: dOrigin.y
                        });
                    }
                }else{ // mwheeldown
                    if (graphicsHandler.getScale() > 2**-Chart.MinZoomLevel) {
                        graphicsHandler.moveView({
                            x: -dOrigin.x/2,
                            y: -dOrigin.y/2
                        });
                        graphicsHandler.scale(0.5);
                    }
                }
            };

            document.addEventListener('keyup', (e: KeyboardEvent) => {
                console.log(this.state);
                if (e.keyCode === 27 && this.getState() === Flow.ControlState.viewingNode) {
                    this.viewingNode.setState(Flow.NodeState.active);
                    this.setState(Flow.ControlState.idle);
                }
            });
        }

        public getSelected() {
            return this.selectedNodes;
        }

        public getState(): Flow.ControlState {
            return this.state;
        }

        public setState(state: Flow.ControlState) {
            this.state = state;
        }

        public getViewingNode(): Flow.Node {
            return this.viewingNode;
        }
    }
}
