/// <reference path="/typings/index.d.ts" />
/// <reference path="flow.chart.ts" />



$().ready(() => {
    let canvasDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("mainflowdiv");
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

    let flowChart: Flow.Chart = new Flow.Chart(canvasDiv, canvas);

    flowChart.addNode("FASTQ", Flow.NodeType.data);
    flowChart.addNode("FASTA", Flow.NodeType.data);
});