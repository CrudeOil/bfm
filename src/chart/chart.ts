import { ObjectFactory } from './objects/factory';
import { ChartObject } from '../chart/objects/object';
import { DataType } from '../chart/objects/datatype';

import { Renderer } from '../graphics/renderer';
import { Point } from '../common/point';

export class Chart {
    private objectFactory: ObjectFactory;
    private objects: {[key: string]: ChartObject};
    private renderer: Renderer;

    public constructor(
        public context: CanvasRenderingContext2D
    ) {
        let canvas: HTMLCanvasElement = context.canvas;

        let canvasResized = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        window.addEventListener('resize', canvasResized);
        canvasResized();

        this.renderer = new Renderer(this, context);
        this.renderer.start();

        this.objectFactory = new ObjectFactory(this.renderer);
        this.objects = {};
    }

    public addDataType(name: string, pos?: Point): DataType {
        const obj = this.objectFactory.createDataType(name, pos);
        this.objects[obj.getGuid()] = obj;
        return obj;
    }

    addProcess(shortDesc: string, longDesc: string, sourceDataTypes: Array<DataType>, resultDataTypes: Array<DataType>): any {
        const obj = this.objectFactory.createProcess(shortDesc, longDesc, sourceDataTypes, resultDataTypes);
        this.objects[obj.getGuid()] = obj;
        return obj;
    }

    public removeObject(id: string) {
        if (!this.objects[id]) {
            console.error(`Object with id ${id} not found in object list`);
        } else {
            delete this.objects[id];
        }
    }

    public getObjects(): Array<ChartObject> {
        return (<any>Object).values(this.objects);
    }

    public setCameraPos(pos: Point) {
        this.renderer.setCameraPos(pos);
    }

    public moveCamera(x: number, y: number) {
        this.renderer.moveCamera(x,y);
    }

    public setZoomLevel(zoomLevel: number) {
        this.renderer.setZoomLevel(zoomLevel);
    }
}
