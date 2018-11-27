import { DataType } from "./datatype";
import { ChartObject } from "./object";
import { ProcessNode } from './processNode';

export class Process extends ChartObject {
    public constructor(
        guid: string,
        private processNode: ProcessNode,
        private sourceDataTypes: Array<DataType> = [],
        private resultDataTypes: Array<DataType> = []
    ) {
        super(guid);
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {
        this.processNode.draw(context, zoomLevel);
    }
}
