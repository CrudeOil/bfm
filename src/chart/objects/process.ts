import { DataType, DATA_TYPE_WIDTH, DATA_TYPE_HEIGHT } from "./datatype";
import { ChartObject } from "./object";
import { ProcessNode, PROCESS_NODE_WIDTH, PROCESS_NODE_HEIGHT } from './processNode';
import { Graphic } from "../../graphics/graphic";
import { Line } from '../../graphics/line';
import { Arrow } from '../../graphics/arrow';
import { Color, Colors } from "../../graphics/color";
import { Point } from "../../common/point";

export class Process extends ChartObject {
    private graphics: Array<Line|Arrow>;

    public constructor(
        guid: string,
        private processNode: ProcessNode,
        private sourceDataTypes: Array<DataType> = [],
        private resultDataTypes: Array<DataType> = []
    ) {
        super(guid);

        this.generateDataTypeGraphics();
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        if (
            this.graphics
            && this.graphics.length > 0
            && this.sourceDataTypes.length > 0
            && this.resultDataTypes.length > 0
        ) {
            this.processNode.draw(context, zoomLevel);

            let fromx: number;
            let tox: number;

            for (var i = 0; i < this.sourceDataTypes.length; i++) {
                if (this.sourceDataTypes[i].pos.x < this.processNode.pos.x) {
                    fromx = this.sourceDataTypes[i].pos.x + DATA_TYPE_WIDTH / 2;
                    tox = this.processNode.pos.x - PROCESS_NODE_WIDTH / 2;
                } else {
                    fromx = this.sourceDataTypes[i].pos.x - DATA_TYPE_WIDTH / 2;
                    tox = this.processNode.pos.x + PROCESS_NODE_WIDTH / 2;
                }

                this.graphics[i].draw(new Point(fromx, this.sourceDataTypes[i].pos.y), context, zoomLevel, new Point(tox, this.processNode.pos.y));
            }
            for (var i = 0; i < this.resultDataTypes.length; i++) {
                if (this.resultDataTypes[i].pos.x < this.processNode.pos.x) {
                    fromx = this.processNode.pos.x - PROCESS_NODE_WIDTH / 2;
                    tox = this.resultDataTypes[i].pos.x + DATA_TYPE_WIDTH / 2;
                } else {
                    fromx = this.processNode.pos.x + PROCESS_NODE_WIDTH / 2;
                    tox = this.resultDataTypes[i].pos.x - DATA_TYPE_WIDTH / 2;
                }

                this.graphics[i + this.sourceDataTypes.length].draw(new Point(fromx, this.processNode.pos.y), context, zoomLevel, new Point(tox, this.resultDataTypes[i].pos.y));
            }
        }
    }

    public generateDataTypeGraphics() {
        const len = this.sourceDataTypes.length + this.resultDataTypes.length;
        this.graphics = new Array<Line|Arrow>(len);
        for (var i = 0; i < len; i++) {
            this.graphics[i] = new Arrow(new Color(Colors.black), 2);
        }
    }

    public onDataTypesChanged = () => {};

    public getProcessNodeObject() {
        return this.processNode;
    }

    public setNodePos(p: Point) {
        this.processNode.setPos(p);
    }
}
