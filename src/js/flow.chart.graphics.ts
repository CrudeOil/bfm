/// <reference path="flow.chart.ts" />
/// <reference path="flow.objects.ts" />


namespace Flow {
    export class GraphicsHandler {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        // vars for drawing stuff on canvas relative to view
        private viewOffset: {x:number,y:number};
        private viewScale: number;

        private debugTexts: string[] = [];

        public constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            
            this.ctx = canvas.getContext("2d");

            this.viewOffset = {
                x: canvas.clientWidth/2,
                y: canvas.clientHeight/2
            };
            this.viewScale = 1;
        }

        public drawGraphView = (objects: Flow.Objects) => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < objects.edges.length; i++ ) {
                this.drawEdge(objects.edges[i]);
            }

            for (var i = 0; i < objects.nodes.length; i++) {
                this.drawNode(objects.nodes[i]);
            }
            this.drawDebugText('x', `${this.viewOffset.x - this.canvas.clientWidth/2}`);
            this.drawDebugText('y', `${this.viewOffset.y - this.canvas.clientHeight/2}`);
            this.drawDebugText('offsx', `${this.viewOffset.x}`);
            this.drawDebugText('offsy', `${this.viewOffset.y}`);
            this.drawDebugText('zoom', `${this.viewScale}x`);
            this.drawDebugText('a', 'add node');
            this.drawDebugText('b', 'add node and connect to last');
            this.drawDebugText('c', 'connect nodes');
        }

        public drawDebugText(name: string, text: string) {
            var i = this.debugTexts.indexOf(name);
            if (i === -1) {
                this.debugTexts.push(name);
            }
            this.ctx.font = "12px Consolas";
            this.ctx.strokeText(`${name}: ${text}`, 100, 10 + i * 20);
        }

        private drawNode(node: Flow.Node) {
            let canvasPos = this.translateToCanvas(node.getPos());
            this.ctx.fillStyle = node.getColor();
            this.ctx.fillRect(
                canvasPos.x - node.getSize().x / 2 * this.viewScale,
                canvasPos.y - node.getSize().y / 2 * this.viewScale,
                node.getSize().x * this.viewScale,
                node.getSize().y * this.viewScale
            );
            let textPos: Flow.IPoint = {x:0,y:0}
            let textSize = 12;
            if (this.viewScale <= 1 / (Flow.Chart.ScaleMultiplier * Flow.Chart.MinZoomLevel)) { // max zoom out
                textPos.x = canvasPos.x// - node.getSize().x / 2 * this.viewScale;
                textPos.y = canvasPos.y - 10;
            }else{
                textPos.x = canvasPos.x// - node.getSize().x / 2 * this.viewScale + 10 * this.viewScale,
                textPos.y = canvasPos.y;
                if (this.viewScale >= 1) {
                    textSize += 15 * this.viewScale;
                }
            }
            this.ctx.textAlign = "center";
            this.ctx.font = `${textSize}px Consolas`;
            this.ctx.fillStyle = "#FFFFFF"
            this.ctx.fillText(
                node.name,
                textPos.x,
                textPos.y
            );
        }

        drawNodeView(node: Flow.Node) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let nodeRect: Flow.IRect = {
                x1: this.canvas.clientWidth / 2 - node.getSize().x / 2,
                y1: this.canvas.clientHeight / 2 - node.getSize().y / 2,
                x2: node.getSize().x,
                y2: node.getSize().y
            }
            this.ctx.fillStyle = node.getColor();
            this.ctx.fillRect(
                nodeRect.x1,
                nodeRect.y1,
                nodeRect.x2,
                nodeRect.y2
            )
            this.ctx.strokeText(
                node.name,
                nodeRect.x1 + 10,
                nodeRect.y1 + 10
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

        // from http://stackoverflow.com/questions/11023144/working-with-hex-strings-and-hex-values-more-easily-in-javascript
        public static addHexColor(c1: string, c2: string) {
            if (c1.charAt(0) === "#") {
                c1 = c1.substr(1);
            }
            if (c2.charAt(0) === "#") {
                c2 = c2.substr(1);
            }
            var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
            while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
            return `#${hexStr}`;
        }
    }
}
