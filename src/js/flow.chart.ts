namespace Flow {
    export enum NodeType {
        data,
        application,
        other
    }

    export class Edge {
        public static SpringFriction = 1;
        public static SpringStrength = 0.5;
        public static SpringLength = 250;

        nodes: Node[];
        color: string|CanvasGradient|CanvasPattern;

        public constructor(n0: Node, n1: Node, color: string = "#FFFFFF") {
            this.nodes = [];
            this.nodes[0] = n0;
            this.nodes[1] = n1;
            this.color = color;
        }

        public getNodes(): Node[] {
            return [this.nodes[0], this.nodes[1]];
        }

        public static CalculateSpring(n1: Node, n2: Node, zoomScale: number = 1): number[] {
            let dx = n1.getPosX() - n2.getPosX();
            let dy = n1.getPosY() - n2.getPosY();
            let d = Math.sqrt(dx**2 + dy**2);

            if (d === 0) {
                d = 1;
                dx = 1;
                dy = 0;
            }

            d = Math.abs(d/zoomScale);
            let f = 0;
            let fx = 0;
            let fy = 0;

            if (d > 10) {
                f = (Edge.SpringLength - d) * Edge.SpringStrength;
                fx = ((dx / d) * f) / 2;
                fy = ((dy / d) * f) / 2;
            }


            return [f, fx, fy];
        }
    }

    export class Node {
        name: string;
        type: NodeType;
        pos: number[];
        color: string|CanvasGradient|CanvasPattern;

        public constructor(name: string, type: NodeType, color="#0000FF") {
            this.name = name;
            this.type = type;
            this.pos = [0,0,0];
            this.color = color;
        }

        public getPosX(): number {
            return this.pos[0];
        }

        public getPosY(): number {
            return this.pos[1];
        }

        public getZ(): number {
            return this.pos[2];
        }

        public setPos(x: number, y: number, z?: number): void {
            this.pos[0] = x;
            this.pos[1] = y;
            this.pos[2] = z? z : this.pos[2];
        }

        public move(dx: number, dy: number): void {
            this.pos[0] += dx;
            this.pos[1] += dy;
        }
    }

    export class Chart {
        private static NodeSize = {
            width: 100,
            height: 60
        };

        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        private nodes: Flow.Node[];
        private edges: Flow.Edge[];

        private dragOffset: {x:number,y:number};
        private zoomScale: number;
        private drag: boolean = false;


        public constructor(canvasParent: HTMLDivElement, canvas: HTMLCanvasElement) {
            this.canvasParent = canvasParent;
            this.canvas = canvas;
            canvas.height = canvasParent.clientHeight;
            canvas.width = canvasParent.clientWidth;
            canvas.onmousedown = () => {
                this.drag = true;
            }
            canvas.onmouseup = () => {
                this.drag = false;
            }
            canvas.onmouseleave = () => {
                this.drag = false;
            }
            canvas.onmousemove = (e: MouseEvent) => {
                if (this.drag) {
                    this.dragOffset.x += e.movementX;
                    this.dragOffset.y += e.movementY;
                }
            }
            canvas.onmousewheel = (e: WheelEvent) => {
                this.zoomScale = e.wheelDelta === 120 ? this.zoomScale *= 2 : this.zoomScale /= 2;
            }

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

        private beforeDraw = () => {
            var springForces: number[];
            for (let i: number = 0; i < this.edges.length; i++) {
                springForces = Edge.CalculateSpring(
                    this.edges[i].getNodes()[0],
                    this.edges[i].getNodes()[1],
                    this.zoomScale
                );
                this.edges[i].getNodes()[0].move(springForces[1], springForces[2]);
                this.edges[i].getNodes()[1].move(-springForces[1], -springForces[2]);
            }
            this.draw();
        }

        private draw = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i: number = 0; i < this.edges.length; i++ ) {
                this.ctx.strokeStyle = this.edges[i].color;
                this.ctx.beginPath();
                this.ctx.moveTo(
                    this.edges[i].getNodes()[0].getPosX() + this.dragOffset.x,
                    this.edges[i].getNodes()[0].getPosY() + this.dragOffset.y
                );
                this.ctx.lineTo(
                    this.edges[i].getNodes()[1].getPosX() + this.dragOffset.x,
                    this.edges[i].getNodes()[1].getPosY() + this.dragOffset.y
                );
                this.ctx.stroke();
            }

            for (var i: number = 0; i < this.nodes.length; i++) {
                this.ctx.fillStyle = this.nodes[i].color;
                this.ctx.fillRect(
                    this.nodes[i].getPosX() + this.dragOffset.x - Chart.NodeSize.width / 2 * this.zoomScale,
                    this.nodes[i].getPosY() + this.dragOffset.y - Chart.NodeSize.height / 2 * this.zoomScale,
                    Chart.NodeSize.width * this.zoomScale,
                    Chart.NodeSize.height * this.zoomScale
                );
            }

            this.afterDraw();
        }

        private afterDraw = () => {
            window.requestAnimationFrame(this.beforeDraw);
        }
    }
}