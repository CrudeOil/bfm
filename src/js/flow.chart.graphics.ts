/// <reference path="flow.chart.ts" />
/// <reference path="flow.chart.objects.ts" />
/// <reference path="flow.chart.util.ts" />



namespace Flow {
    export class GraphicsHandler {        
        private canvas: HTMLCanvasElement;
        private viewSettings: Flow.IViewSettings;
        private ctx: CanvasRenderingContext2D;
        // vars for drawing stuff on canvas relative to view
        private viewOffset: {x:number,y:number};
        private viewScale: number;

        private debugTexts: Array<string> = [];

        public constructor(canvas: HTMLCanvasElement, viewSettings: IViewSettings) {
            this.viewSettings = viewSettings;

            this.canvas = canvas;
            
            this.ctx = canvas.getContext("2d");

            this.viewOffset = {
                x: canvas.clientWidth/2,
                y: canvas.clientHeight/2
            };
            this.viewScale = 1;
        }

        public draw = (objects: Flow.IObjects) => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < objects.edges.length; i++ ) {
                this.drawEdge(objects.edges[i]);
            }

            for (var key of Object.keys(objects.nodes)) {
                this.drawNode(objects.nodes[key]);
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
            let textPos: Flow.Point = {x:0,y:0}
            let textSize = 12;
            if (this.viewScale === 1 / (this.viewSettings.zoomMultiplier * this.viewSettings.minZoomLevel)) { // max zoom out
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
            switch (this.viewSettings.edgeType) {
                case "polyline": 
                    this.drawPolyLineEdge(edge);
                    break;
                case "orthagonal":
                    this.drawOrthagonalEdge(edge);
                    break;
                case "direct":
                    // passthrough
                default:
                    this.drawDirectEdge(edge);
            }
        }

        public drawPolyLineEdge(edge: Flow.Edge) {

        }

        public drawOrthagonalEdge(edge: Flow.Edge) {

        }

        public drawDirectEdge(edge: Flow.Edge) {
            let fromNode: Flow.Node = edge.getNodes()[0];
            let toNode: Flow.Node = edge.getNodes()[1];

            // is fromnode to left or right of tonode?
            let x = 0;
            if (fromNode.getPos().x - fromNode.getSize().x / 2 > toNode.getPos().x + toNode.getSize().x / 2 ) {
                x = 1;
            } if ((fromNode.getPos()).x + fromNode.getSize().x / 2 < (toNode.getPos()).x - toNode.getSize().x / 2 ) {
                x = -1;
            }
            
            // is fromnode above or below of tonode?
            let y = 0;
            if ((fromNode.getPos()).y - fromNode.getSize().y / 2 > (toNode.getPos()).y + toNode.getSize().y / 2 ) {
                y = 1;
            } if ((fromNode.getPos()).y + fromNode.getSize().y / 2 < (toNode.getPos()).y - toNode.getSize().y / 2 ) {
                y = -1;
            }
            

            let fromPos: Flow.Point = {
                x: fromNode.getPos().x - fromNode.getSize().x / 2 * x,
                y: fromNode.getPos().y - fromNode.getSize().y / 2 * y
            }
            let toPos: Flow.Point = {
                x: toNode.getPos().x + toNode.getSize().x / 2 * x,
                y: toNode.getPos().y + toNode.getSize().y / 2 * y
            }


            this.drawArrow(this.translateToCanvas(fromPos), this.translateToCanvas(toPos));

            let p: Flow.Point = this.translateToCanvas({
                x: fromNode.getPos().x + (toNode.getPos().x - fromNode.getPos().x) / 2,
                y: fromNode.getPos().y + (toNode.getPos().y - fromNode.getPos().y) / 2
            });

            this.ctx.fillText(edge.name, p.x, p.y)
        }

        public drawArrow(
            from: Flow.Point,
            to: Flow.Point,
            color: string|CanvasGradient|CanvasPattern = "#FFFFFF",
            scale = 1
            ){
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(
                from.x,
                from.y
            );

            // dimension deltas
            let d: Flow.Point = new Point(to.x - from.x, to.y - from.y);
            let dist = Flow.Util.GetDist(from, to);
            let m = (to.y-from.y)/(to.x-from.x);
            // point along the arrow where the head will start
            let p: Flow.Point = new Flow.Point(to.x - Flow.Edge.ARROWHEADLENGTH * d.x * this.viewScale / dist, to.y - Flow.Edge.ARROWHEADLENGTH * d.y * this.viewScale / dist);
            this.ctx.lineTo(
                p.x,
                p.y
            );
            this.ctx.stroke();


            this.ctx.beginPath();
            this.ctx.moveTo(to.x, to.y);
            // we can use the aforementioned proportions again by using the x proportion on the y coordinate and vice-versa
            // this only works because the base of the arrowhead is perpendicular to the line.
            this.ctx.lineTo(p.x - Flow.Edge.ARROWHEADWIDTH / 2 * d.y * this.viewScale / dist, p.y + Flow.Edge.ARROWHEADWIDTH / 2 * d.x * this.viewScale / dist);
            this.ctx.lineTo(p.x + Flow.Edge.ARROWHEADWIDTH / 2 * d.y * this.viewScale / dist, p.y - Flow.Edge.ARROWHEADWIDTH / 2 * d.x * this.viewScale / dist);
            this.ctx.closePath();
            this.ctx.fill();
        }

        public translateToCanvas(p: Point): Point {
            return new Flow.Point(p.x * this.viewScale + this.viewOffset.x, p.y * this.viewScale + this.viewOffset.y);
        }

        public moveView(v: Flow.Point) {
            this.viewOffset.x += v.x;
            this.viewOffset.y += v.y;
        }

        public scale(factor: number) {
            this.viewScale *= factor;
        }

        public getScale() {
            return this.viewScale;
        }

        public getViewOffset(): Point {
            return this.viewOffset;
        }

        public setSettings(viewSettings: IViewSettings): void {
            this.viewSettings = viewSettings;
        }

        public getSettings(): Flow.IViewSettings {
            return this.viewSettings;
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
