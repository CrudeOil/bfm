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

    public addDataType(name: string): Promise<DataType> {
        var promise = new Promise<DataType>((resolve, reject) => {
            const obj = this.objectFactory.createDataType(name);
            this.objects[obj.getGuid()] = obj;
            resolve(obj);
        });
        return promise;
    }

    public removeObject(id: string): Promise<void> {
        var promise = new Promise<void>((resolve, reject) => {
            if (!this.objects[id]) {
                reject();
            } else {
                delete this.objects[id];
                resolve();
            }
        });
        return promise;
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
