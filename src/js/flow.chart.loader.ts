namespace Flow {
    export interface IPhysicsSettings {
        springEnabled: boolean,
        springFriction: number,
        springStrength: number,
        springLength: number
    }

    export interface IViewSettings {
        edgeType: string,
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
        edges: Array<IEdgeJson>
    }

    export function LoadJson(chart: Flow.Chart, chartJson: Flow.IChartJson): void {
        let nodeNames: Array<string> = Object.keys(chartJson.nodes);
        for (var i = 0; i < nodeNames.length; i++) {
            AddNodeFromJson(chart, nodeNames[i], chartJson.nodes[nodeNames[i]]);
        }
        for (var i = 0; i < chartJson.edges.length; i++) {
            if (chartJson.edges[i].fromNode in chart.nodes && chartJson.edges[i].toNode in chart.nodes) {
                chart.addEdge(
                    chart.nodes[chartJson.edges[i].fromNode],
                    chart.nodes[chartJson.edges[i].toNode],
                    chartJson.edges[i].name
                );
            }
        }
    }

    export function AddNodeFromJson(chart: Flow.Chart, name: string, node: INodeJson) {
        let nodePos: Flow.Point = node.pos ? node.pos : new Flow.Point(0,0); // default to 0,0 if pos is not set
        let newNode: Flow.Node = chart.addNode(name, node.type, nodePos.x, nodePos.y);
        newNode.setDescription(node.description);
    }
}
