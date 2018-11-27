import { Guid } from '../../common/guid';
import { Point } from '../../common/point';
import { DataType } from './datatype';
import { Process } from './process';
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

    public createProcess(
        shortDesc: string,
        longDesc: string,
        sourceDataTypes: Array<DataType>,
        resultDataTypes: Array<DataType>
    ): Process {
        const guid = Guid.GenerateGuid();

        return new Process(guid, shortDesc, longDesc, sourceDataTypes, resultDataTypes);
    }
}
