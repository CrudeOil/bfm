/// <reference path="../../typings/index.d.ts" />
/// <reference path="flow.chart.ts" />

let flowChart: Flow.Chart;

$().ready(() => {
    let canvasDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("mainflowdiv");
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

    flowChart = new Flow.Chart(canvasDiv, canvas);

    let n1: Flow.Node = flowChart.addNode("FASTQ", Flow.NodeType.data, 10, 0);
    let n2: Flow.Node = flowChart.addNode("FASTA", Flow.NodeType.data, -10, 0);
    let lastNode = n2;

    let e1: Flow.Edge = flowChart.addEdge(n1, n2);

    document.onkeyup = (e) => {
        // c
        if (e.keyCode === 67) {
            flowChart.connectSelected();
        }else{
            $.get("http://setgetgo.com/randomword/get.php", (word: string) => {
                // a
                if (e.keyCode === 65) {
                    let newNode: Flow.Node = flowChart.addNode(
                        word,
                        Flow.NodeType.other,
                        (Math.random() * (canvas.clientWidth)) - canvas.clientWidth/2,
                        (Math.random() * (canvas.clientHeight)) - canvas.clientHeight/2
                    );
                    lastNode = newNode;
                }
                // b
                if (e.keyCode === 66) {
                    let newNode: Flow.Node = flowChart.addNode(
                        word,
                        Flow.NodeType.other,
                        (Math.random() * (canvas.clientWidth)) - canvas.clientWidth/2,
                        (Math.random() * (canvas.clientHeight)) - canvas.clientHeight/2
                    );
                    flowChart.addEdge(lastNode, newNode);
                    lastNode = newNode;
                }
            });
        }
    }
});
