/// <reference path="/typings/index.d.ts" />
/// <reference path="flow.chart.ts" />



$().ready(() => {
    let canvasDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("mainflowdiv");
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

    let flowChart: Flow.Chart = new Flow.Chart(canvasDiv, canvas);

    let n1: Flow.Node = flowChart.addNode("FASTQ", Flow.NodeType.data, 10, 0);
    let n2: Flow.Node = flowChart.addNode("FASTA", Flow.NodeType.data, -10, 0);

    let e1: Flow.Edge = flowChart.addEdge(n1, n2);

    document.onkeyup = (e) => {
        if (e.keyCode === 65) {
            let newNode: Flow.Node = flowChart.addNode(
                Math.random().toString(),
                Flow.NodeType.other,
                (Math.random() * (canvas.clientWidth)) - canvas.clientWidth/2,
                (Math.random() * (canvas.clientHeight)) - canvas.clientHeight/2
            );
        }
        if (e.keyCode === 67) {
            flowChart.connectSelected();
        }
    }
});
