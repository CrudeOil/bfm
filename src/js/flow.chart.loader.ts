namespace Flow {
    export interface IPhysicsSettings {
        springEnabled: boolean,
        springFriction: number,
        springStrength: number,
        springLength: number
    }

    export interface IViewSettings {
        minZoomLevel: number,
        maxZoomLevel: number,
        zoomMultiplier: number,
        startPosition: Flow.Point,
        startZoomLevel: number
    }

    export interface IChartSettings {
        name: string,
        physicsSettings: IPhysicsSettings,
        viewSettings: IViewSettings
    }

    export interface INodeJson {
        description: string,
        type: Flow.NodeType,
        pos?: Flow.Point
    }

    export interface IEdgeJson {
        name: string,
        description: string,
        fromNode: string,
        toNode: string
    }

    export interface IChartJson {
        settings: IChartSettings,
        nodes: {[name: string]: INodeJson},
        edges: IEdgeJson[]
    }
}