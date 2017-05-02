/// <reference path="/typings/index.d.ts" />
/// <reference path="flow.chart.ts" />



$().ready(() => {
    let canvasDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("mainflowdiv");
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

    let flowChart: Flow.Chart = new Flow.Chart(canvasDiv, canvas);

    let lastNode: Flow.Node;

    let addNodeBtn: HTMLLinkElement = <HTMLLinkElement>document.getElementById("addnodebtn");
    addNodeBtn.onclick = () => {
        let newNode: Flow.Node = flowChart.addNode(
            Math.random().toString(),
            Flow.NodeType.other,
            (Math.random() * (canvas.clientWidth - 100) + 100) / 2,
            (Math.random() * (canvas.clientHeight - 100) + 100) / 2
        );
        flowChart.addEdge(lastNode, newNode);
        lastNode = newNode;
    }

    let n1: Flow.Node = flowChart.addNode("FASTQ", Flow.NodeType.data, 10, 0);
    let n2: Flow.Node = flowChart.addNode("FASTA", Flow.NodeType.data, -10, 0);
    lastNode = n2;

    let e1: Flow.Edge = flowChart.addEdge(n1, n2);
});