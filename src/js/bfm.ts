/// <reference path="../../typings/index.d.ts" />
/// <reference path="flow.chart.ts" />

let flowChart: Flow.Chart;

$().ready(() => {
    $.ajax({url: 'bioinformatics.json', dataType: "json", type: 'GET', success: (bioInfoChart) => {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

        flowChart = Flow.Chart.loadChart(canvas, bioInfoChart);

        flowChart.onNodeDetails = (node: Flow.Node) => {
            $('#detailsPane').modal('show');
            $('#detailsTitle').text(node.name);
            $('#detailsBody').html(window.markdownit().render(node.description));
        }

        let jsonBtn = <HTMLLinkElement>document.getElementById('JsonBtn');
        jsonBtn.onclick = (e) => {
            $('#saveLoadPane').modal('show');
            $('#jsonText').text(flowChart.getJson());
        }
        let loadJsonBtn = <HTMLLinkElement>document.getElementById('loadJsonBtn');
        loadJsonBtn.onclick = (e) => {
            let jsonText = $('#jsonText').text();
            let chartJson = <Flow.IChartJson>JSON.parse(jsonText);
            flowChart = Flow.Chart.loadChart(canvas, chartJson);
        }

        canvas.onkeyup = (e) => {
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
                    }
                });
            }
        }
    },
    error: function(error) {
        alert("Error loading JSON");
    }});
});
