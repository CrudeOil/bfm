import { Chart } from './chart/chart';
import { MAX_ZOOM_LEVEL } from './graphics/renderer';
import { Point } from './common/point';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');
const chart = new Chart(context);

chart.setCameraPos(new Point(canvas.clientWidth/2, canvas.clientHeight/2));

const beefData = chart.addDataType('Eggs', new Point(-250, 250));
const beanData = chart.addDataType('beans', new Point(-250, 0));
const spiceData = chart.addDataType('Spices', new Point(-250, -250));
const chiliData = chart.addDataType('Delicious chili', new Point(250, 0));
chart.addProcess('Cook', 'Cook!', [beefData, beanData, spiceData], [chiliData]);

let zoom = 1;

let mouseDown = false;

window.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.button === 0) {
        mouseDown = true;
    }
});
window.addEventListener('mouseup', (event: MouseEvent) => {
    if (event.button === 0) {
        mouseDown = false;
    }
});

window.addEventListener('mousemove', (event: MouseEvent) => {
    if (mouseDown) {
        chart.moveCamera(-event.movementX, -event.movementY);
    }
});

window.addEventListener('keydown', (event: KeyboardEvent) => {
    switch (event.key) {
        case 'z':
            zoom = 1+ (zoom + 1) % (MAX_ZOOM_LEVEL - 1);
            console.log(zoom);
            chart.setZoomLevel(zoom);
            break;
        case 'ArrowLeft':
            chart.moveCamera(-10, 0);
            break;
        case 'ArrowRight':
            chart.moveCamera(10, 0);
            break;
        case 'ArrowUp':
            chart.moveCamera(0, -10);
            break;
        case 'ArrowDown':
            chart.moveCamera(0, 10);
            break;
    }
});
