/// <reference path="../../typings/index.d.ts" />
/// <reference path="flow.chart.ts" />

let flowChart: Flow.Chart;

$().ready(() => {
    $.ajax({url: 'bioinformatics.json', dataType: "json", type: 'GET', success: (bioInfoChart: Flow.IChartJson) => {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainflow");

        flowChart = new Flow.Chart(canvas, bioInfoChart.settings);

        Flow.LoadJson(flowChart, bioInfoChart);

        flowChart.onNodeDetails = (node: Flow.ChartNode) => {
            $('#detailsPane').modal('show');
            $('#detailsTitle').text(node.getName());
            $('#detailsBody').html(window.markdownit().render(node.getDescription()));
        }

        let jsonBtn = <HTMLLinkElement>document.getElementById('JsonBtn');
        jsonBtn.onclick = (e) => {
            $('#saveLoadPane').modal('show');
            $('#jsonText').text(flowChart.getJson());
        }
        let loadJsonBtn = <HTMLLinkElement>document.getElementById('loadJsonBtn');
        loadJsonBtn.onclick = (e) => {
            let jsonText = $('#jsonText').val();
            let chartJson = <Flow.IChartJson>JSON.parse(jsonText);

            flowChart.clear();
            Flow.LoadJson(flowChart, chartJson);
        }

        canvas.onkeyup = (e) => {
            // c
            if (e.keyCode === 67) {
                flowChart.connectSelected();
            }else{
                $.get("http://setgetgo.com/randomword/get.php", (word: string) => {
                    // a
                    if (e.keyCode === 65) {
                        let newNode: Flow.ChartNode = flowChart.addNode(
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
