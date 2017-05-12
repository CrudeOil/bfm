namespace Flow {
    export interface INodeJson {
        description: string,
        type: Flow.NodeType,
        pos?: Flow.Point
    }

    export interface IEdgeJson {
        name: string,
        content: string,
        fromNode: string,
        toNode: string
    }

    export interface IPhysicsSettings {
        springFriction: number,
        springStrength: number,
        springLength: number
    }

    export interface IViewSettings {
        minZoomLevel: number,
        maxZoomLevel: number,
        zoomMultiplier: number
    }

    export interface IChartSettings {
        name: string,
        physicsSettings: IPhysicsSettings,
        viewSettings: IViewSettings
    }

    export interface IChartJson {
        settings: IChartSettings,
        nodes: {[name: string]: INodeJson},
        edges: IEdgeJson[]
    }
}