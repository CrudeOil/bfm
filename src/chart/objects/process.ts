import { DataType } from "./datatype";
import { ChartObject } from "./object";

export class Process extends ChartObject {
    public constructor(
        guid: string,
        private shortDesc: string,
        private longDesc: string,
        private sourceDataTypes: Array<DataType> = [],
        private resultDataTypes: Array<DataType> = []
    ) {
        super(guid);
    }

    public draw(context: CanvasRenderingContext2D, zoomLevel: number) {

    }
}
