export class Point {
    constructor(
        public x: number,
        public y: number
    ){}

    public add(add: Point) {
        return new Point(this.x + add.x, this.y + add.y);
    }

    public sub(sub: Point) {
        return new Point(this.x - sub.x, this.y - sub.y);
    }

    public div(div: Point): Point {
        return new Point(this.x / div.x, this.y / div.y);
    }
}
