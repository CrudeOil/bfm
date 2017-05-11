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
            this.ctx.textAlign = "left";
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
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(`${name}: ${text}`, 10, 10 + i * 20);
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
            if (this.viewScale == 1 / (Flow.Chart.ScaleMultiplier * Flow.Chart.MinZoomLevel)) { // max zoom out
                textPos.x = canvasPos.x;
                textPos.y = canvasPos.y - 10;
            }else{
                textPos.x = canvasPos.x;
                // please excuse the magic numbers
                textPos.y = canvasPos.y + 5 * this.viewScale;
                if (this.viewScale >= 1) {
                    textSize += 14 * this.viewScale;
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

        private drawEdge(edge: Flow.Edge) {
            let fromNode: Flow.Node = edge.getNodes()[0];
            let toNode: Flow.Node = edge.getNodes()[1];

            // is fromnode to left or right of tonode?
            let x = 0;
            if (this.translateToCanvas(fromNode.getPos()).x - fromNode.getSize().x / 2 > this.translateToCanvas(toNode.getPos()).x + toNode.getSize().x / 2 ) {
                x = 1;
            } else if (this.translateToCanvas(fromNode.getPos()).x + fromNode.getSize().x / 2 < this.translateToCanvas(toNode.getPos()).x - toNode.getSize().x / 2 ) {
                x = -1;
            }else{
                x = 0;
            }
            // is fromnode above or below of tonode?
            let y = 0;
            if (this.translateToCanvas(fromNode.getPos()).y - fromNode.getSize().y / 2 > this.translateToCanvas(toNode.getPos()).y + toNode.getSize().y / 2 ) {
                y = 1;
            } else if (this.translateToCanvas(fromNode.getPos()).y + fromNode.getSize().y / 2 < this.translateToCanvas(toNode.getPos()).y - toNode.getSize().y / 2 ) {
                y = -1;
            }else{
                y = 0;
            }

            let fromPos: Flow.IPoint = {
                x: fromNode.getPos().x - fromNode.getSize().x / 2 * x,
                y: fromNode.getPos().y - fromNode.getSize().y / 2 * y
            }
            let toPos: Flow.IPoint = {
                x: toNode.getPos().x + toNode.getSize().x / 2 * x,
                y: toNode.getPos().y + toNode.getSize().y / 2 * y
            }

            Flow.GraphicsHandler.drawArrow(this.ctx, this.translateToCanvas(fromPos), this.translateToCanvas(toPos));
        }

        public static drawArrow(ctx: CanvasRenderingContext2D,
                                from: Flow.IPoint,
                                to: Flow.IPoint,
                                color: string|CanvasGradient|CanvasPattern = "#FFFFFF",
                                scale = 1) 
        {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(
                from.x,
                from.y
            );

            // dimension deltas
            let d: Flow.IPoint = {
                x: to.x - from.x,
                y: to.y - from.y
            }
            let dist = Flow.Util.GetDist(from, to);
            let m = (to.y-from.y)/(to.x-from.x);
            // point along the arrow where the head will start
            let p: Flow.IPoint = {
                // when we divide the coordinate delta by total distance, we get the proportion of the total distance to the coordinate delta
                // we can then use this to give anything else the right proportions
                x: to.x - Flow.Edge.ArrowHeadLength * d.x / dist, 
                y: to.y - Flow.Edge.ArrowHeadLength * d.y / dist
            }
            ctx.lineTo(
                p.x,
                p.y
            );
            ctx.stroke();


            ctx.beginPath();
            ctx.moveTo(to.x, to.y);
            // we can use the aforementioned proportions again by using the x proportion on the y coordinate and vice-versa
            // this only works because the base of the arrowhead is perpendicular to the line.
            ctx.lineTo(p.x - Flow.Edge.ArrowHeadWidth / 2 * d.y / dist, p.y + Flow.Edge.ArrowHeadWidth / 2 * d.x / dist);
            ctx.lineTo(p.x + Flow.Edge.ArrowHeadWidth / 2 * d.y / dist, p.y - Flow.Edge.ArrowHeadWidth / 2 * d.x / dist);
            ctx.closePath();
            ctx.fill();
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
