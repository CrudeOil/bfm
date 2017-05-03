/// <reference path="flow.chart.physics.ts" />
/// <reference path="flow.chart.graphics.ts" />


namespace Flow {
    export class ControlHandler {
        private canvas: HTMLCanvasElement;
        private canvasRect: ClientRect;

        // movement of canvas and nodes
        private canvasDrag: boolean = false;
        private canvasDragStart: {x:number, y:number};
        private nodeDrag: boolean = false;
        private nodeDragStart: {x:number, y:number};
        private selectedNodes: Node[] = []

        constructor(
            chart: Flow.Chart,
            physicsHandler: Flow.PhysicsHandler,
            graphicsHandler: Flow.GraphicsHandler
            ) {
            this.canvas = chart.getCanvas();
            this.canvasRect = this.canvas.getBoundingClientRect();

            // stuff we want to happen on mousedown:
            // * start dragging canvas if not on node
            // * start dragging node(s) if on node
            this.canvas.onmousedown = (e: MouseEvent) => {
                let x = e.clientX - this.canvasRect.left;
                let y = e.clientY - this.canvasRect.top;
                let clickedNode = chart.getNodeAt(x, y);
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
            this.canvas.onmouseup = (e: MouseEvent) => {
                let x = e.clientX - this.canvasRect.left;
                let y = e.clientY - this.canvasRect.top;
                let clickedNode = chart.getNodeAt(x, y);
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
            this.canvas.onmouseleave = () => {
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
            this.canvas.onmousemove = (e: MouseEvent) => {
                if (this.canvasDrag) {
                    graphicsHandler.moveView({
                        x: e.movementX,
                        y: e.movementY
                    });
                }
                if (this.nodeDrag) {
                    for (var i = 0; i < this.selectedNodes.length; i++) {
                        // moving the actual nodes. speed is adjusted by zoomscale
                        // should always be true to mouse movement
                        this.selectedNodes[i].move(e.movementX / graphicsHandler.getScale(), e.movementY / graphicsHandler.getScale(), true);
                    }
                }else{
                    let x = e.clientX - this.canvasRect.left;
                    let y = e.clientY - this.canvasRect.top;
                    let clickedNode = chart.getNodeAt(x, y);

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
        }

        public getSelected() {
            return this.selectedNodes;
        }
    }
}
