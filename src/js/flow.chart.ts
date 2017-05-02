namespace Flow {
    export enum NodeType {
        data,
        application,
        other
    }

    export class Node {
        name: string;
        type: NodeType;
        pos: number[];

        public constructor(name: string, type: NodeType) {
            this.name = name;
            this.type = type;
            this.pos = [0,0,0];
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
    }

    export class Chart {
        private canvasParent: HTMLDivElement;
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        private nodes: Flow.Node[];

        private dragOffset: {x:number,y:number};
        private zoomOffset: number;

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
                this.zoomOffset = e.wheelDelta === 120 ? this.zoomOffset *= 2 : this.zoomOffset /= 2;
            }

            this.ctx = canvas.getContext("2d");

            this.nodes = [];

            this.dragOffset = {
                x: 0,
                y: 0
            };
            this.zoomOffset = 1;

            window.requestAnimationFrame(this.draw);
        }

        public addNode(name: string, type: NodeType) {
            this.nodes.push(new Node(name, type));
        }

        private draw = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle ="#0000FF";
            for (let i: number = 0; i < this.nodes.length; i++) {
                this.ctx.fillRect(
                    this.nodes[i].getPosX() + this.dragOffset.x,
                    this.nodes[i].getPosY() + this.dragOffset.y,
                    100 * this.zoomOffset,
                    60 * this.zoomOffset
                );
            }
            window.requestAnimationFrame(this.draw);
        }
    }
}