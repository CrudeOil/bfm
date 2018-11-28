import { ObjectFactory } from './objects/factory';
import { ChartObject } from '../chart/objects/object';
import { DataType } from '../chart/objects/datatype';

import { Renderer } from '../graphics/renderer';
import { Point } from '../common/point';
import { Process } from './objects/process';

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

        this.objectFactory = new ObjectFactory(this.renderer);
        this.objects = {};

        this.renderer.repaint();
    }

    public addDataType(name: string, pos?: Point): DataType {
        const obj = this.objectFactory.createDataType(name, pos);
        this.objects[obj.getGuid()] = obj;

        obj.onMoved = () => {
            this.renderer.repaint();
        }

        this.renderer.repaint();
        return obj;
    }

    addProcess(shortDesc: string, longDesc: string, sourceDataTypes: Array<DataType>, resultDataTypes: Array<DataType>, pos?: Point): Process {
        const obj = this.objectFactory.createProcess(shortDesc, longDesc, sourceDataTypes, resultDataTypes, pos);
        this.objects[obj.getGuid()] = obj;

        obj.getProcessNodeObject().onMoved = () => {
            this.renderer.repaint();
        }

        this.renderer.repaint();
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
