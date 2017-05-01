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

        private offset: {x:number,y:number};

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
                    this.offset.x += e.movementX;
                    this.offset.y += e.movementY;
                }
            }

            this.ctx = canvas.getContext("2d");

            this.nodes = [];

            this.offset = {
                x: 0,
                y: 0
            };

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
                    this.nodes[i].getPosX() + this.offset.x,
                    this.nodes[i].getPosY() + this.offset.y,
                    100,
                    100
                );
            }
            window.requestAnimationFrame(this.draw);
        }
    }
}