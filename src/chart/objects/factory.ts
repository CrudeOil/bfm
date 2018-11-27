import { Guid } from '../../common/guid';
import { Point } from '../../common/point';
import { DataType } from './datatype';
import { Renderer } from '../../graphics/renderer';

export class ObjectFactory {
    public constructor(
        private renderer: Renderer
    ) {

    }

    public createDataType(
        name: string,
        pos?: Point,
        relative?: boolean // relative to top-left of screen
    ): DataType {
        const guid = Guid.GenerateGuid();

        if (!pos) {
            return new DataType(guid, this.renderer.getViewCenter(), name);
        }

        const _pos = relative ? pos.sub(this.renderer.getViewOffset()) : pos;
        return new DataType(guid, _pos, name);
    }
}
