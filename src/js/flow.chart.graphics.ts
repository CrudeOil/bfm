/// <reference path="flow.chart.ts" />
/// <reference path="flow.objects.ts" />


namespace Flow {
    export class GraphicsHandler {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        // vars for drawing stuff on canvas relative to view
        private viewOffset: {x:number,y:number};
        private viewScale: number;

        public constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            
            this.ctx = canvas.getContext("2d");

            this.viewOffset = {
                x: canvas.clientWidth/2,
                y: canvas.clientHeight/2
            };
            this.viewScale = 1;
        }

        public draw = (objects: Flow.Objects) => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < objects.edges.length; i++ ) {
                this.drawEdge(objects.edges[i]);
            }

            for (var i = 0; i < objects.nodes.length; i++) {
                this.drawNode(objects.nodes[i]);
            }
            this.ctx.strokeText(`x: ${this.viewOffset.x - this.canvas.clientWidth/2}`, 100, 10);
            this.ctx.strokeText(`y: ${this.viewOffset.y - this.canvas.clientHeight/2}`, 100, 30);
            this.ctx.strokeText(`offsx: ${this.viewOffset.x}`, 100, 50);
            this.ctx.strokeText(`offsy: ${this.viewOffset.y}`, 100, 70);
            this.ctx.strokeText(`zoom: ${this.viewScale}x`, 100, 90);
            this.ctx.strokeText("Press 'a' to add node", 100, 110);
            this.ctx.strokeText("Press 'b' to add node and connect to last", 100, 130);
            this.ctx.strokeText("Press 'c' to connect nodes", 100, 150);
        }

        private drawNode(node: Flow.Node) {
            let canvasPos = this.translateToCanvas(node.getPos());
            this.ctx.fillStyle = node.getColor();
            this.ctx.fillRect(
                canvasPos.x - Node.Width / 2 * this.viewScale,
                canvasPos.y - Node.Height / 2 * this.viewScale,
                Node.Width * this.viewScale,
                Node.Height * this.viewScale
            );
            this.ctx.strokeText(
                node.name,
                canvasPos.x - Node.Height / 2 * this.viewScale + 10 * this.viewScale,
                canvasPos.y
            );
        }

        private drawEdge(edge: Flow.Edge) {
            let firstNodePos = edge.getNodes()[0].getPos();
            let secondNodePos = edge.getNodes()[1].getPos();

            this.ctx.strokeStyle = edge.color;
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

        public translateToCanvas(p: IPoint): IPoint {
            return {
                x: p.x * this.viewScale + this.viewOffset.x,
                y: p.y * this.viewScale + this.viewOffset.y
            }
        }

        public moveView(v: Flow.IPoint) {
            this.viewOffset.x += v.x;
            this.viewOffset.y += v.y;
        }

        public scale(factor: number) {
            this.viewScale *= factor;
        }

        public getScale() {
            return this.viewScale;
        }

        public getViewOffset(): IPoint {
            return this.viewOffset;
        }
    }
}
